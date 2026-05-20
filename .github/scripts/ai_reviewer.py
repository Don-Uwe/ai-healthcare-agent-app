import os
import json
import urllib.request
import urllib.error

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
You are a Staff-level Software Engineer performing a thorough, production-grade GitHub Pull Request review.
Your review style should be precise, technical, highly detailed, and constructive.

When reviewing the PR, consider the PR Title and Description to understand the author's intent, then deeply analyze the provided code diff.

Review priorities:
1. Security vulnerabilities & Edge Cases
2. Logic bugs & Unintended side-effects
3. UI/UX issues (e.g., accessibility, responsive design issues, missing bounds checking)
4. Event handling (e.g., passive event listeners on touch events)
5. Performance & Scalability concerns
6. Maintainability & Readability

Format your review beautifully using Markdown. Group your findings by severity.

Output format structure:

## Summary
Provide a brief summary of what the PR does and the overall quality.

### 🔴 High Severity
List critical bugs, security risks, or major logic flaws.
For each, provide:
- **Issue**: What is wrong.
- **Impact**: Why it matters.
- **Fix**: Code snippet showing how to fix it.

### 🟡 Medium Severity
List architectural concerns, edge cases, accessibility issues, or unhandled errors.
- **Issue**: ...
- **Impact**: ...
- **Fix**: ...

### 🟢 Low Severity / Nits
List minor stylistic issues, typos, global variable pollution, or missing comments.

## What's Good ✅
Highlight 2-3 things the author did well (e.g., good use of transitions, clean abstractions).

## Verdict
- **Approve**: If no high/medium issues.
- **Request Changes**: If high/medium issues exist. Mention the most critical one here.

If the PR is absolutely flawless, you may output: "PR looks technically sound. No major concerns identified." but be VERY critical and look deeply before doing this.
"""

def should_ignore(diff_header: str) -> bool:
    return any(pattern in diff_header for pattern in IGNORED_PATTERNS)

def fetch_pr_metadata(repo, pr_number, github_token):
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"token {github_token}")
    request.add_header("Accept", "application/vnd.github.v3+json")
    try:
        with urllib.request.urlopen(request) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data.get("title", "No Title"), data.get("body", "No Description")
    except urllib.error.URLError as e:
        print(f"Failed to fetch PR metadata: {e}")
        return "Unknown Title", "Unknown Description"

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

def generate_review(pr_title, pr_body, diff_text, gemini_api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}"
    prompt = f"{SYSTEM_PROMPT}\n\nPR TITLE:\n{pr_title}\n\nPR DESCRIPTION:\n{pr_body}\n\nPR DIFF:\n{diff_text}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "topP": 0.8, "topK": 40, "maxOutputTokens": 8192}
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(request) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            return resp_data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP Error from Gemini API: {e.code} - {error_body}")
        raise e
    except Exception as e:
        print(f"Failed to fetch review from Gemini API: {e}")
        raise e

def post_review(repo, pr_number, github_token, review_text):
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    payload = {"body": f"### 🤖 Gemini AI Code Review\n\n{review_text}"}
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

def main():
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    github_token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    pr_number = os.environ.get("PR_NUMBER")

    if not all([gemini_api_key, github_token, repo, pr_number]):
        print("Missing required environment variables.")
        return

    try:
        print("Fetching PR metadata...")
        pr_title, pr_body = fetch_pr_metadata(repo, pr_number, github_token)

        print("Fetching PR diff...")
        diff_text = fetch_pr_diff(repo, pr_number, github_token)
        if not diff_text:
            print("No diff found or failed to fetch diff.")
            post_review(repo, pr_number, github_token, "⚠️ Could not retrieve PR diff for review. Please check if the PR has valid changes.")
            return

        print("Filtering diff...")
        filtered_diff = filter_diff(diff_text)
        
        if not filtered_diff.strip():
             print("Diff is empty after filtering out ignored files.")
             post_review(repo, pr_number, github_token, "PR contains only changes to ignored files (e.g. lockfiles, build artifacts). No review generated.")
             return

        print("Generating comprehensive review...")
        final_review = generate_review(pr_title, pr_body, filtered_diff, gemini_api_key)

        print("Posting review to GitHub...")
        post_review(repo, pr_number, github_token, final_review)

    except Exception as e:
        print(f"Execution failed: {e}")
        post_review(repo, pr_number, github_token, f"⚠️ An error occurred while generating the AI review:\n```\n{e}\n```")

if __name__ == "__main__":
    main()
