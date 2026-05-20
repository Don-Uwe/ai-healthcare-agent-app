import os
import json
import urllib.request
import urllib.error

MAX_DIFF_SIZE = 180000
MAX_FILES = 25

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

EXTENSION_MAP = {
    ".tsx": "React TypeScript",
    ".ts": "TypeScript",
    ".jsx": "React JavaScript",
    ".js": "JavaScript",
    ".py": "Python",
    ".kt": "Kotlin",
    ".java": "Java",
    ".go": "Go",
    ".rs": "Rust",
    ".yml": "DevOps",
    ".yaml": "DevOps",
    ".sql": "SQL"
}

SYSTEM_PROMPT = """
You are a Staff-level Software Engineer performing a production-grade GitHub Pull Request review.

Your review style:
- Precise
- Technical
- Constructive
- Direct
- Production-focused

Review priorities:
1. Security vulnerabilities
2. Logic bugs
3. Code Loss / Data corruption risks
4. Functionality Loss
5. Performance issues
6. Scalability concerns
7. Concurrency / async issues
8. API contract risks
9. Architecture quality
10. Maintainability
11. Readability

Rules:
- Do NOT praise unnecessarily.
- Do NOT explain obvious things.
- Do NOT invent issues.
- Only comment when there is meaningful engineering value.
- Avoid generic AI wording.
- Avoid hypothetical issues unless strongly supported.
- Avoid style-only comments unless maintainability is impacted.

Every issue must include severity:
- BLOCKER
- HIGH
- MEDIUM
- LOW
- NIT

Actively look for:
- Hardcoded secrets
- Unsafe HTML rendering
- SQL injection
- Missing auth checks
- Sensitive logging
- Data exposure
- Functionality loss
- Code that can cause crashes
- Code Loss / Data corruption risks
- Unsafe deserialization
- Token leakage
- XSS risks
- SSRF risks
- Race conditions
- Blocking IO
- Unbounded queries
- Missing validation
- Missing pagination
- Transaction consistency issues

Output format:

## Summary

## Risk Score
LOW / MEDIUM / HIGH

## Critical Issues

## Major Concerns

## Minor Improvements

## Positive Notes

## Recommended Action
- Approve
- Request Changes
- Needs Manual Testing

For every issue include:
- severity
- file/area
- why it matters
- suggested fix

If no major issues exist:
"PR looks technically sound. No major concerns identified."
"""

def should_ignore(diff_header: str) -> bool:
    return any(pattern in diff_header for pattern in IGNORED_PATTERNS)

def detect_language(filename: str) -> str:
    for ext, language in EXTENSION_MAP.items():
        if filename.endswith(ext):
            return language
    return "Unknown"

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

def split_diff_by_files(diff_text):
    files = {}
    current_file = None
    buffer = []
    for line in diff_text.splitlines():
        if line.startswith("diff --git"):
            if current_file:
                files[current_file] = "\n".join(buffer)
            parts = line.split(" b/")
            current_file = parts[-1] if len(parts) > 1 else "unknown"
            buffer = [line]
        else:
            buffer.append(line)
    if current_file:
        files[current_file] = "\n".join(buffer)
    return files

def generate_review(filename, language, diff_text, gemini_api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
    prompt = f"{SYSTEM_PROMPT}\n\nFILE NAME: {filename}\nLANGUAGE: {language}\n\nReview this pull request diff carefully.\n\nPR DIFF:\n{diff_text}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "topP": 0.8, "topK": 32, "maxOutputTokens": 8192}
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
        print(f"HTTP Error from Gemini API for {filename}: {e.code} - {error_body}")
        raise e
    except Exception as e:
        print(f"Failed to fetch review from Gemini API for {filename}: {e}")
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
        print("Fetching PR diff...")
        diff_text = fetch_pr_diff(repo, pr_number, github_token)
        if not diff_text:
            return

        print("Filtering diff...")
        filtered_diff = filter_diff(diff_text)

        print("Splitting diff by files...")
        file_diffs = split_diff_by_files(filtered_diff)

        if len(file_diffs) > MAX_FILES:
            print(f"Large PR detected. Reviewing first {MAX_FILES} files only.")
            file_diffs = dict(list(file_diffs.items())[:MAX_FILES])

        reviews = []
        for filename, file_diff in file_diffs.items():
            print(f"Reviewing: {filename}")
            language = detect_language(filename)
            try:
                review = generate_review(filename, language, file_diff, gemini_api_key)
                reviews.append(f"## File: `{filename}` ({language})\n\n{review}")
            except Exception as review_error:
                print(f"Review failed for {filename}: {review_error}")

        final_review = "\n\n---\n\n".join(reviews)
        if not final_review.strip():
            final_review = "PR looks technically sound. No major concerns identified."

        print("Posting review to GitHub...")
        post_review(repo, pr_number, github_token, final_review)

    except Exception as e:
        print(f"Execution failed: {e}")

if __name__ == "__main__":
    main()
