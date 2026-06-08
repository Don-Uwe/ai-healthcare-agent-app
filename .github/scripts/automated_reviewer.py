import os
import json
import urllib.request
import urllib.error
import time
from datetime import datetime, timezone

MAX_DIFF_SIZE = 500000


IGNORED_PATTERNS = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "dist/",
    "build/",
    ".next/",
    "coverage/",
    "*.snap"
]

SYSTEM_PROMPT = """
You are an automated PR review assistant for this repository.

Review the pull request for:
* Code correctness
* Security concerns
* Performance issues
* Edge cases
* Maintainability
* Readability
* Repository standards
* Missing tests
* Architectural concerns
* Breaking changes

Avoid nitpicking formatting unless it affects maintainability.

Do not repeatedly report the same unresolved comment in every review cycle unless it is still blocking.
Prioritize newly introduced changes since the last review.
Avoid duplicate comments.
Be concise and actionable.
Focus on helping contributors reach a maintainer review quickly.
Assume contributors are acting in good faith.
Do not approve or merge pull requests.
Do not request changes for subjective preferences alone.

If you find issues (Critical, Important, or Suggestions), output them grouped by severity using the following headings:

#### Critical
[Describe critical issues that can cause bugs, security vulnerabilities, crashes, or data corruption. Provide actionable comments.]

#### Important
[Describe issues that impact maintainability, performance, scalability, or correctness in specific scenarios.]

#### Suggestions
[Describe optional improvements that can enhance code quality.]

Do not include empty severity sections. For example, if there are no Critical issues, do not include the "#### Critical" heading.

If no significant issues are found (the code looks good, matches repository standards, and there are no critical/important/suggestion issues), output exactly:
NO_ISSUES_FOUND

At the very end of your response, you MUST select the most appropriate labels for this pull request from the available labels list provided.
Output them on a single line starting with "SELECTED_LABELS: " followed by a comma-separated list of the selected labels. If no labels are appropriate, output "SELECTED_LABELS: None".

AVAILABLE LABELS:
{available_labels}
"""

def should_ignore(diff_header: str) -> bool:
    return any(pattern in diff_header for pattern in IGNORED_PATTERNS)

def parse_github_date(date_str: str) -> datetime:
    # Standard GitHub ISO 8601 UTC date string format: 2026-06-08T13:43:17Z
    if date_str.endswith('Z'):
        date_str = date_str[:-1] + '+00:00'
    try:
        return datetime.fromisoformat(date_str)
    except Exception:
        # Fallback for older python or different format
        dt = datetime.strptime(date_str[:19], "%Y-%m-%dT%H:%M:%S")
        return dt.replace(tzinfo=timezone.utc)

def fetch_pr_metadata(repo, pr_number, github_token):
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"token {github_token}")
    request.add_header("Accept", "application/vnd.github.v3+json")
    try:
        with urllib.request.urlopen(request) as response:
            data = json.loads(response.read().decode("utf-8"))
            title = data.get("title", "No Title")
            body = data.get("body", "No Description")
            labels = [label["name"] for label in data.get("labels", [])]
            return title, body, labels
    except urllib.error.URLError as e:
        print(f"Failed to fetch PR metadata: {e}")
        return "Unknown Title", "Unknown Description", []

def fetch_pr_comments(repo, pr_number, github_token):
    comments = []
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments?per_page=100&page={page}"
        request = urllib.request.Request(url)
        request.add_header("Authorization", f"token {github_token}")
        request.add_header("Accept", "application/vnd.github.v3+json")
        try:
            with urllib.request.urlopen(request) as response:
                data = json.loads(response.read().decode("utf-8"))
                if not data:
                    break
                comments.extend(data)
                if len(data) < 100:
                    break
                page += 1
        except urllib.error.URLError as e:
            print(f"Failed to fetch PR comments: {e}")
            break
    return comments

def fetch_pr_commits(repo, pr_number, github_token):
    commits = []
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/commits?per_page=100&page={page}"
        request = urllib.request.Request(url)
        request.add_header("Authorization", f"token {github_token}")
        request.add_header("Accept", "application/vnd.github.v3+json")
        try:
            with urllib.request.urlopen(request) as response:
                data = json.loads(response.read().decode("utf-8"))
                if not data:
                    break
                commits.extend(data)
                if len(data) < 100:
                    break
                page += 1
        except urllib.error.URLError as e:
            print(f"Failed to fetch PR commits: {e}")
            break
    return commits

def fetch_pr_diff(repo, pr_number, github_token):
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"token {github_token}")
    request.add_header("Accept", "application/vnd.github.v3.diff")
    try:
        with urllib.request.urlopen(request) as response:
            return response.read().decode("utf-8")
    except urllib.error.URLError as e:
        print(f"Failed to fetch PR diff: {e}")
        return ""

def filter_diff(diff_text):
    filtered_lines = []
    ignoring = False
    for line in diff_text.splitlines():
        if line.startswith("diff --git"):
            ignoring = should_ignore(line)
        if not ignoring:
            filtered_lines.append(line)
    final_diff = "\n".join(filtered_lines)
    if len(final_diff) > MAX_DIFF_SIZE:
        final_diff = final_diff[:MAX_DIFF_SIZE] + "\n\n[Diff truncated due to size limits]"
    return final_diff

def fetch_repo_labels(repo, github_token):
    url = f"https://api.github.com/repos/{repo}/labels?per_page=100"
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"token {github_token}")
    request.add_header("Accept", "application/vnd.github.v3+json")
    try:
        with urllib.request.urlopen(request) as response:
            data = json.loads(response.read().decode("utf-8"))
            return [label["name"] for label in data]
    except urllib.error.URLError as e:
        print(f"Failed to fetch repo labels: {e}")
        return []

def add_pr_labels(repo, pr_number, github_token, labels):
    if not labels:
        return
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/labels"
    payload = {"labels": labels}
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(request) as response:
            if response.status in [200, 201]:
                print(f"Successfully added labels: {labels}")
            else:
                print(f"Failed to add labels: {response.status}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP Error adding labels: {e.code} - {error_body}")
    except urllib.error.URLError as e:
        print(f"Failed to add labels: {e}")

def generate_review(pr_title, pr_body, diff_text, previous_reviews_text, available_labels, gemini_api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}"
    formatted_prompt = SYSTEM_PROMPT.replace("{available_labels}", ", ".join(available_labels) if available_labels else "None")
    prompt = f"{formatted_prompt}\n\nPR TITLE:\n{pr_title}\n\nPR DESCRIPTION:\n{pr_body}\n"
    if previous_reviews_text:
        prompt += f"\n{previous_reviews_text}\n"
    prompt += f"\nPR DIFF:\n{diff_text}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "topP": 0.8, "topK": 40, "maxOutputTokens": 8192}
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(request) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                return resp_data["candidates"][0]["content"]["parts"][0]["text"]
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            print(f"HTTP Error from Gemini API (Attempt {attempt+1}): {e.code} - {error_body}")
            if e.code in [429, 500, 502, 503, 504] and attempt < max_retries - 1:
                sleep_time = (2 ** attempt) * 5
                print(f"Retrying in {sleep_time} seconds...")
                time.sleep(sleep_time)
            else:
                raise e
        except Exception as e:
            print(f"Failed to fetch review from Gemini API (Attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                raise e

def post_review(repo, pr_number, github_token, review_text):
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    payload = {"body": review_text}
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(request) as response:
            if response.status in [200, 201]:
                print("Review posted successfully.")
            else:
                print(f"Failed to post review: {response.status}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP Error posting comment to GitHub: {e.code} - {error_body}")
    except urllib.error.URLError as e:
        print(f"Failed to post comment to GitHub: {e}")

def fetch_open_prs(repo, github_token):
    prs = []
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/pulls?state=open&per_page=100&page={page}"
        request = urllib.request.Request(url)
        request.add_header("Authorization", f"token {github_token}")
        request.add_header("Accept", "application/vnd.github.v3+json")
        try:
            with urllib.request.urlopen(request) as response:
                data = json.loads(response.read().decode("utf-8"))
                if not data:
                    break
                prs.extend(data)
                if len(data) < 100:
                    break
                page += 1
        except urllib.error.URLError as e:
            print(f"Failed to fetch open PRs: {e}")
            break
    return prs

def run_review_for_pr(repo, pr_number, github_token, gemini_api_key):
    print(f"Running review for PR #{pr_number}...")
    pr_title, pr_body, pr_labels = fetch_pr_metadata(repo, pr_number, github_token)

    # 1. Skip review entirely if the PR currently contains the label: gssoc:invalid
    if "gssoc:invalid" in pr_labels:
        print("PR contains 'gssoc:invalid' label. Skipping review entirely.")
        return

    print("Fetching PR comments...")
    comments = fetch_pr_comments(repo, pr_number, github_token)

    OLD_BOT_SIG = "### 🤖 Gemini AI Code Review"
    NEW_BOT_SIG = "<!-- automated-ai-reviewer-bot-v2 -->"

    old_reviews = []
    new_reviews = []

    for c in comments:
        body = c.get("body", "")
        if NEW_BOT_SIG in body:
            new_reviews.append(c)
        elif OLD_BOT_SIG in body:
            old_reviews.append(c)

    print("Fetching PR commits...")
    commits = fetch_pr_commits(repo, pr_number, github_token)
    if not commits:
        print("No commits found for this PR. Skipping.")
        return

    # Parse timestamps
    commit_dates = [parse_github_date(cmt["commit"]["committer"]["date"]) for cmt in commits]
    last_commit_time = max(commit_dates)

    new_review_dates = [parse_github_date(rev["created_at"]) for rev in new_reviews]
    latest_new_review_time = max(new_review_dates) if new_review_dates else None

    old_review_dates = [parse_github_date(rev["created_at"]) for rev in old_reviews]
    latest_old_review_time = max(old_review_dates) if old_review_dates else None

    current_time = datetime.now(timezone.utc)
    has_new_review = len(new_reviews) > 0
    has_old_review = len(old_reviews) > 0

    # Cooldown & Trigger logic
    should_run = False
    reason = ""

    if not has_new_review:
        if has_old_review:
            # Migration Rule
            if latest_old_review_time and last_commit_time > latest_old_review_time:
                should_run = True
                reason = "Migration review: new commit pushed since the last old review."
            else:
                reason = "Migration review: waiting for the first new commit to be pushed since the last old review."
        else:
            # Brand new PR
            should_run = True
            reason = "Initial review: no previous reviews exist for this PR."
    else:
        # Subsequent reviews cooldown & feedback check
        elapsed = current_time - latest_new_review_time
        cooldown_period = 48 * 3600  # 48 hours in seconds
        
        if elapsed.total_seconds() < cooldown_period:
            reason = f"Cooldown period of 48 hours has not elapsed. Only {elapsed.total_seconds() / 3600:.1f} hours elapsed."
        elif last_commit_time <= latest_new_review_time:
            reason = "No new commits have been pushed since the last new bot review."
        else:
            should_run = True
            reason = "Subsequent review: cooldown elapsed and new commits detected."

    print(f"Trigger Decision: {reason}")
    if not should_run:
        print("Exiting review workflow without posting.")
        return

    print("Fetching PR diff...")
    diff_text = fetch_pr_diff(repo, pr_number, github_token)
    if not diff_text:
        print("No diff found or failed to fetch diff.")
        return

    print("Filtering diff...")
    filtered_diff = filter_diff(diff_text)
    if not filtered_diff.strip():
         print("Diff is empty after filtering out ignored files.")
         return

    # Prepare previous reviews context for the model to avoid duplication
    previous_reviews_text = ""
    if new_reviews:
        previous_reviews_text += "\n--- PREVIOUS NEW BOT REVIEWS ---\n"
        for i, rev in enumerate(new_reviews):
            previous_reviews_text += f"\nReview {i+1} on {rev['created_at']}:\n{rev['body']}\n"
    if old_reviews:
        previous_reviews_text += "\n--- PREVIOUS OLD BOT REVIEWS ---\n"
        for i, rev in enumerate(old_reviews[:3]): # Pass at most 3 old reviews to keep prompt clean
            previous_reviews_text += f"\nReview {i+1} on {rev['created_at']}:\n{rev['body']}\n"

    print("Fetching repo labels...")
    available_labels = fetch_repo_labels(repo, github_token)
    relevant_prefixes = ("type:", "quality:", "level:", "gssoc")
    filtered_labels = []
    for label in available_labels:
        if any(label.lower().startswith(p) for p in relevant_prefixes) or label.lower() == "in-progress" or "gssoc" in label.lower():
            filtered_labels.append(label)
    print(f"Filtered Available Labels: {filtered_labels}")

    print("Generating review with Gemini...")
    model_response = generate_review(pr_title, pr_body, filtered_diff, previous_reviews_text, filtered_labels, gemini_api_key)
    
    # Extract selected labels
    selected_labels = []
    clean_model_response = model_response
    for line in model_response.splitlines():
        if line.strip().startswith("SELECTED_LABELS:"):
            clean_model_response = model_response.replace(line, "")
            labels_part = line.split("SELECTED_LABELS:", 1)[1].strip()
            if labels_part.lower() != "none":
                selected_labels = [l.strip() for l in labels_part.split(",") if l.strip()]
                break

    # Check if the model response indicates no issues found
    no_issues_found = "NO_ISSUES_FOUND" in clean_model_response or not any(
        heading in clean_model_response for heading in ["#### Critical", "#### Important", "#### Suggestions"]
    )

    if no_issues_found:
        review_text = (
            "### Automated Review Feedback\n\n"
            "No major issues were identified during this review.\n\n"
            "The implementation appears consistent with the repository standards and the modified files were reviewed successfully.\n\n"
            "> Maintainer Note:\n>\n"
            "> Maintainer **@SB2318** will review this pull request after the initial automated review cycle is complete.\n\n"
            f"{NEW_BOT_SIG}"
        )
    else:
        review_text = (
            "### Automated Review Feedback\n\n"
            "Provide actionable comments grouped by severity:\n\n"
            f"{clean_model_response.strip()}\n\n"
            "> Maintainer Note:\n>\n"
            "> Once the initial automated feedback has been addressed, maintainer **@SB2318** will review the pull request for final evaluation.\n\n"
            f"{NEW_BOT_SIG}"
        )

    print("Posting review comment to GitHub...")
    post_review(repo, pr_number, github_token, review_text)

    if selected_labels:
        print(f"Adding labels to PR: {selected_labels}")
        add_pr_labels(repo, pr_number, github_token, selected_labels)

def main():
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    github_token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    pr_number = os.environ.get("PR_NUMBER")

    if not all([gemini_api_key, github_token, repo]):
        print("Missing required environment variables (GEMINI_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY).")
        return

    try:
        if pr_number and pr_number.strip():
            # Process single PR
            run_review_for_pr(repo, pr_number.strip(), github_token, gemini_api_key)
        else:
            # Process all open PRs
            print("PR_NUMBER is not set or empty. Fetching all open PRs...")
            open_prs = fetch_open_prs(repo, github_token)
            print(f"Found {len(open_prs)} open PR(s).")
            for pr in open_prs:
                num = pr.get("number")
                if num:
                    print(f"\n--- Reviewing PR #{num} ---")
                    try:
                        run_review_for_pr(repo, str(num), github_token, gemini_api_key)
                    except Exception as e:
                        print(f"Error reviewing PR #{num}: {e}")
    except Exception as e:
        print(f"Execution failed: {e}")

if __name__ == "__main__":
    main()
