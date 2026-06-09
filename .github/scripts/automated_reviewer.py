import os
import json
import socket
import urllib.request
import urllib.error
import time
from datetime import datetime, timezone

MAX_DIFF_SIZE = 300000        # max diff bytes sent to Gemini per PR
API_TIMEOUT = 30              # seconds for all GitHub API calls
GEMINI_TIMEOUT = 120          # seconds for Gemini API (response can be long)
BATCH_DELAY = 10              # seconds to wait between PR reviews (avoids rate limits)
RATE_LIMIT_SLEEP_BASE = 60    # base seconds for 429 back-off (doubles each retry)
MAX_BATCH_PER_RUN = 30        # max PRs to process per scheduled/manual run


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

def make_github_request(url, headers, is_json=True, max_retries=3):
    request = urllib.request.Request(url)
    for k, v in headers.items():
        request.add_header(k, v)
        
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(request, timeout=API_TIMEOUT) as response:
                if is_json:
                    return json.loads(response.read().decode("utf-8"))
                else:
                    return response.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code in [403, 429]:
                retry_after = e.headers.get("Retry-After")
                if retry_after:
                    sleep_time = int(retry_after) + 1
                else:
                    sleep_time = 15 * (2 ** attempt) # fallback exponential
                print(f"[WARN] GitHub API Rate Limit ({e.code}) on {url}. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
            else:
                print(f"HTTP Error {e.code} on {url}: {e.read().decode('utf-8')}")
                if is_json: return None
                return ""
        except (urllib.error.URLError, socket.timeout) as e:
            print(f"Network error on {url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                if is_json: return None
                return ""
    if is_json: return None
    return ""

def fetch_pr_metadata(repo, pr_number, github_token):
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    headers = {"Authorization": f"token {github_token}", "Accept": "application/vnd.github.v3+json"}
    data = make_github_request(url, headers, is_json=True)
    if data:
        title = data.get("title", "Unknown Title")
        body = data.get("body", "No Description")
        labels = [label["name"] for label in data.get("labels", [])]
        author = data.get("user", {}).get("login", "")
        return title, body, labels, author
    return "Unknown Title", "Unknown Description", [], ""

def fetch_pr_comments(repo, pr_number, github_token):
    comments = []
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments?per_page=100&page={page}"
        headers = {"Authorization": f"token {github_token}", "Accept": "application/vnd.github.v3+json"}
        data = make_github_request(url, headers, is_json=True)
        if not data: break
        comments.extend(data)
        if len(data) < 100: break
        page += 1
    return comments

def fetch_pr_commits(repo, pr_number, github_token):
    commits = []
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/commits?per_page=100&page={page}"
        headers = {"Authorization": f"token {github_token}", "Accept": "application/vnd.github.v3+json"}
        data = make_github_request(url, headers, is_json=True)
        if not data: break
        commits.extend(data)
        if len(data) < 100: break
        page += 1
    return commits

def fetch_pr_diff(repo, pr_number, github_token):
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    headers = {"Authorization": f"token {github_token}", "Accept": "application/vnd.github.v3.diff"}
    diff = make_github_request(url, headers, is_json=False)
    return diff if diff else ""

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
        with urllib.request.urlopen(request, timeout=API_TIMEOUT) as response:
            data = json.loads(response.read().decode("utf-8"))
            return [label["name"] for label in data]
    except (urllib.error.URLError, socket.timeout) as e:
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
        with urllib.request.urlopen(request, timeout=API_TIMEOUT) as response:
            if response.status in [200, 201]:
                print(f"Successfully added labels: {labels}")
            else:
                print(f"Failed to add labels: {response.status}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP Error adding labels: {e.code} - {error_body}")
    except (urllib.error.URLError, socket.timeout) as e:
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
            with urllib.request.urlopen(request, timeout=GEMINI_TIMEOUT) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                return resp_data["candidates"][0]["content"]["parts"][0]["text"]
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            print(f"HTTP Error from Gemini API (Attempt {attempt+1}): {e.code} - {error_body}")
            if e.code in [429, 500, 502, 503, 504] and attempt < max_retries - 1:
                # Exponential back-off: 60 s, 120 s, 240 s — much longer for rate limits
                sleep_time = RATE_LIMIT_SLEEP_BASE * (2 ** attempt)
                print(f"Retrying in {sleep_time} seconds...")
                time.sleep(sleep_time)
            else:
                raise e
        except (socket.timeout, urllib.error.URLError) as e:
            print(f"Gemini API timed out (Attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(15)
            else:
                raise e
        except Exception as e:
            print(f"Failed to fetch review from Gemini API (Attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(15)
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
        with urllib.request.urlopen(request, timeout=API_TIMEOUT) as response:
            if response.status in [200, 201]:
                print("Review posted successfully.")
            else:
                print(f"Failed to post review: {response.status}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP Error posting comment to GitHub: {e.code} - {error_body}")
    except (urllib.error.URLError, socket.timeout) as e:
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
            with urllib.request.urlopen(request, timeout=API_TIMEOUT) as response:
                data = json.loads(response.read().decode("utf-8"))
                if not data:
                    break
                prs.extend(data)
                if len(data) < 100:
                    break
                page += 1
        except (urllib.error.URLError, socket.timeout) as e:
            print(f"Failed to fetch open PRs: {e}")
            break
    return prs

def run_review_for_pr(repo, pr_number, github_token, gemini_api_key,
                      is_scheduled=False, filtered_labels=None):
    """
    Returns a (status, detail) tuple:
      status : "reviewed" | "skipped" | "error"
      detail : human-readable reason string
    """
    if filtered_labels is None:
        filtered_labels = []
    print(f"Fetching data for PR #{pr_number}...")
    pr_title, pr_body, pr_labels, pr_author = fetch_pr_metadata(repo, pr_number, github_token)

    if not pr_title or pr_title == "Unknown Title":
        return "error", "Could not fetch PR data."

    if "dependabot" in pr_author.lower() or "dependency-bot" in pr_author.lower():
        print(f"Skipping PR #{pr_number} because author is {pr_author}.")
        return "skipped", f"PR authored by {pr_author}"

    # 1. Skip review entirely if the PR currently contains the label: gssoc:invalid
    if "gssoc:invalid" in pr_labels:
        msg = "Skipped: PR has 'gssoc:invalid' label."
        print(msg)
        return "skipped", msg

    print("Fetching PR comments...")
    comments = fetch_pr_comments(repo, pr_number, github_token)

    OLD_BOT_SIG = "### \U0001f916 Gemini AI Code Review"
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
        msg = "Skipped: no commits found."
        print(msg)
        return "skipped", msg

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
            if is_scheduled or (latest_old_review_time and last_commit_time > latest_old_review_time):
                should_run = True
                reason = "Migration: first new-bot review."
            else:
                reason = "Skipped: migration waiting for new commit since old review."
        else:
            should_run = True
            reason = "Initial: no previous review exists."
    else:
        elapsed = current_time - latest_new_review_time
        cooldown_period = 168 * 3600

        if elapsed.total_seconds() < cooldown_period:
            hrs = elapsed.total_seconds() / 3600
            reason = f"Skipped: cooldown active ({hrs:.1f} h / 168 h elapsed)."
        elif is_scheduled:
            should_run = True
            reason = "Scheduled re-check: 168 h elapsed, checking unresolved feedback."
        elif last_commit_time <= latest_new_review_time:
            reason = "Skipped: no new commits since last bot review."
        else:
            should_run = True
            reason = "Subsequent: 168 h elapsed + new commits detected."

    print(f"Trigger Decision: {reason}")
    if not should_run:
        print("Exiting review workflow without posting.")
        return "skipped", reason

    diff_text = fetch_pr_diff(repo, pr_number, github_token)
    if not diff_text:
        msg = "Skipped: no diff found or fetch failed."
        print(msg)
        return "skipped", msg

    print("Filtering diff...")
    filtered_diff = filter_diff(diff_text)
    if not filtered_diff.strip():
        msg = "Skipped: diff empty after filtering ignored files."
        print(msg)
        return "skipped", msg

    # Prepare previous reviews context
    previous_reviews_text = ""
    if new_reviews:
        previous_reviews_text += "\n--- PREVIOUS NEW BOT REVIEWS ---\n"
        for i, rev in enumerate(new_reviews):
            previous_reviews_text += f"\nReview {i+1} on {rev['created_at']}:\n{rev['body']}\n"
    if old_reviews:
        previous_reviews_text += "\n--- PREVIOUS OLD BOT REVIEWS ---\n"
        for i, rev in enumerate(old_reviews[:3]):
            previous_reviews_text += f"\nReview {i+1} on {rev['created_at']}:\n{rev['body']}\n"

    print(f"Using pre-fetched labels: {filtered_labels}")

    print("Generating review with Gemini...")
    model_response = generate_review(pr_title, pr_body, filtered_diff,
                                     previous_reviews_text, filtered_labels, gemini_api_key)

    if not model_response:
        msg = "Skipped: Gemini returned an empty response."
        print(msg)
        return "skipped", msg

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
        outcome = "reviewed (no issues)"
    else:
        review_text = (
            "### Automated Review Feedback\n\n"
            "Provide actionable comments grouped by severity:\n\n"
            f"{clean_model_response.strip()}\n\n"
            "> Maintainer Note:\n>\n"
            "> Once the initial automated feedback has been addressed, maintainer **@SB2318** will review the pull request for final evaluation.\n\n"
            f"{NEW_BOT_SIG}"
        )
        outcome = "reviewed (issues found)"

    print("Posting review comment to GitHub...")
    post_review(repo, pr_number, github_token, review_text)

    # Always ensure gssoc is appended to mark that it was reviewed by the bot
    if "gssoc" not in [l.lower() for l in selected_labels]:
        selected_labels.append("gssoc")

    if selected_labels:
        print(f"Adding labels to PR: {selected_labels}")
        add_pr_labels(repo, pr_number, github_token, selected_labels)

    return "reviewed", f"{outcome} | labels: {selected_labels if selected_labels else 'none'}"

def _get_filtered_labels(repo, github_token):
    """Fetch all repo labels once and filter to the relevant subset."""
    available_labels = fetch_repo_labels(repo, github_token)
    relevant_prefixes = ("type:", "quality:", "level:", "gssoc")
    result = []
    for label in available_labels:
        lower = label.lower()
        if any(lower.startswith(p) for p in relevant_prefixes) or lower == "in-progress" or "gssoc" in lower:
            result.append(label)
    print(f"Relevant labels fetched once: {result}")
    return result


def _write_step_summary(lines):
    """Append markdown lines to $GITHUB_STEP_SUMMARY if running inside GitHub Actions."""
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    try:
        with open(summary_file, "a", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
    except Exception as e:
        print(f"[WARN] Could not write step summary: {e}")


def main():
    import traceback

    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    github_token   = os.environ.get("GITHUB_TOKEN")
    repo           = os.environ.get("GITHUB_REPOSITORY")
    pr_number      = os.environ.get("PR_NUMBER", "").strip()
    event_name     = os.environ.get("GITHUB_EVENT_NAME", "")

    # Scheduled / manual / push events re-check PRs even without new commits
    is_scheduled = event_name in ("schedule", "workflow_dispatch", "push")

    if not all([gemini_api_key, github_token, repo]):
        msg = "Missing required environment variables (GEMINI_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY)."
        print(msg)
        _write_step_summary(["## \u274c Automated PR Reviewer", "", f"**Fatal:** {msg}"])
        return

    run_start = datetime.now(timezone.utc)
    print(f"Event: {event_name} | Scheduled mode: {is_scheduled} | Started: {run_start.isoformat()}")

    # --- Validate PR_NUMBER: must be a positive integer string ---
    single_pr_mode = pr_number.isdigit() and int(pr_number) > 0

    # audit_log entries: (pr_num, status, detail)
    audit_log = []
    stop_reason = None

    try:
        if single_pr_mode:
            print(f"Single-PR mode: reviewing PR #{pr_number}")
            filtered_labels = _get_filtered_labels(repo, github_token)
            try:
                status, detail = run_review_for_pr(
                    repo, pr_number, github_token, gemini_api_key,
                    is_scheduled=is_scheduled, filtered_labels=filtered_labels
                )
                audit_log.append((pr_number, status, detail))
            except Exception as e:
                audit_log.append((pr_number, "error", str(e)))
                traceback.print_exc()
        else:
            # Batch mode
            print("Batch mode: fetching all open PRs...")
            open_prs = fetch_open_prs(repo, github_token)
            total = len(open_prs)
            print(f"Found {total} open PR(s). Will process up to {MAX_BATCH_PER_RUN}.")

            # Fetch labels ONCE for the entire batch run
            filtered_labels = _get_filtered_labels(repo, github_token)

            processed = 0
            for pr in open_prs:
                if processed >= MAX_BATCH_PER_RUN:
                    stop_reason = f"Batch limit reached ({MAX_BATCH_PER_RUN} PRs per run)."
                    print(f"\n[STOP] {stop_reason}")
                    break

                num = pr.get("number")
                if not num:
                    continue
                    
                pr_labels = [l.get("name", "").lower() for l in pr.get("labels", [])]
                if "gssoc" in pr_labels:
                    continue

                print(f"\n--- [{processed + 1}/{min(total, MAX_BATCH_PER_RUN)}] Reviewing PR #{num} ---")
                try:
                    status, detail = run_review_for_pr(
                        repo, str(num), github_token, gemini_api_key,
                        is_scheduled=is_scheduled, filtered_labels=filtered_labels
                    )
                    audit_log.append((num, status, detail))
                except urllib.error.HTTPError as e:
                    audit_log.append((num, "error", f"HTTP {e.code}: {e.reason}"))
                    print(f"[WARN] HTTP Error reviewing PR #{num}: {e}")
                    if e.code == 429:
                        stop_reason = "Gemini API Rate Limit (429) fully exhausted. Aborting batch run to save Actions minutes."
                        print(f"\n[STOP] {stop_reason}")
                        break
                except Exception as e:
                    audit_log.append((num, "error", str(e)))
                    print(f"[WARN] Error reviewing PR #{num}: {e}")
                    traceback.print_exc()

                processed += 1

                if processed < min(total, MAX_BATCH_PER_RUN):
                    print(f"Waiting {BATCH_DELAY}s before next PR...")
                    time.sleep(BATCH_DELAY)

            if stop_reason is None:
                stop_reason = f"All {processed} PR(s) processed (no more to review)."

    except Exception as e:
        stop_reason = f"Fatal exception: {e}"
        print(f"\n[FATAL] {stop_reason}")
        traceback.print_exc()

    # ------------------------------------------------------------------ #
    #  Final summary (stdout + GitHub Actions Step Summary)               #
    # ------------------------------------------------------------------ #
    run_end = datetime.now(timezone.utc)
    duration_s = int((run_end - run_start).total_seconds())
    duration_str = f"{duration_s // 60}m {duration_s % 60}s"

    reviewed = [e for e in audit_log if e[1] == "reviewed"]
    skipped  = [e for e in audit_log if e[1] == "skipped"]
    errored  = [e for e in audit_log if e[1] == "error"]

    separator = "=" * 60
    print(f"\n{separator}")
    print(f"  AUTOMATED REVIEWER \u2014 RUN SUMMARY")
    print(separator)
    print(f"  Event       : {event_name}")
    print(f"  Duration    : {duration_str}")
    print(f"  PRs seen    : {len(audit_log)}")
    print(f"  Reviewed    : {len(reviewed)}")
    print(f"  Skipped     : {len(skipped)}")
    print(f"  Errors      : {len(errored)}")
    print(f"  Stop reason : {stop_reason or 'N/A'}")
    print(separator)
    print("  PR-BY-PR DETAIL")
    print(separator)
    for num, status, detail in audit_log:
        icon = {"reviewed": "\u2705", "skipped": "\u23ed", "error": "\u274c"}.get(status, "?")
        print(f"  {icon} PR #{num:>5} | {status:<8} | {detail}")
    print(separator)

    # Write GitHub Actions Job Summary (visible in the Actions UI)
    md_lines = [
        "## \U0001f916 Automated PR Reviewer \u2014 Run Summary",
        "",
        f"| Field | Value |",
        f"|---|---|",
        f"| **Event** | `{event_name}` |",
        f"| **Duration** | {duration_str} |",
        f"| **PRs evaluated** | {len(audit_log)} |",
        f"| **Reviewed** | {len(reviewed)} |",
        f"| **Skipped** | {len(skipped)} |",
        f"| **Errors** | {len(errored)} |",
        f"| **Stop reason** | {stop_reason or 'N/A'} |",
        "",
        "### Per-PR Detail",
        "",
        "| PR | Status | Detail |",
        "|---|---|---|",
    ]
    for num, status, detail in audit_log:
        icon = {"reviewed": "\u2705", "skipped": "\u23ed", "error": "\u274c"}.get(status, "?")
        md_lines.append(f"| [#{num}](https://github.com/{repo}/pull/{num}) | {icon} {status} | {detail} |")

    _write_step_summary(md_lines)


if __name__ == "__main__":
    main()
