import os
import json
import urllib.request
import urllib.error

def main():
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    github_token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    pr_number = os.environ.get("PR_NUMBER")

    if not gemini_api_key or not github_token or not repo or not pr_number:
        print("Missing required environment variables.")
        return

    # 1. Fetch Pull Request Diff from GitHub API
    diff_url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    req = urllib.request.Request(diff_url)
    req.add_header("Authorization", f"token {github_token}")
    req.add_header("Accept", "application/vnd.github.v3.diff")

    try:
        with urllib.request.urlopen(req) as response:
            diff_text = response.read().decode("utf-8")
    except urllib.error.URLError as e:
        print(f"Failed to fetch PR diff: {e}")
        return

    # 2. Filter diff to ignore lockfiles, generated assets, and test dependencies
    filtered_lines = []
    ignoring = False
    for line in diff_text.splitlines():
        if line.startswith("diff --git"):
            if any(ignored in line for ignored in ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "dist/", "build/"]):
                ignoring = True
            else:
                ignoring = False
        if not ignoring:
            filtered_lines.append(line)

    final_diff = "\n".join(filtered_lines)
    
    # Truncate if diff is exceptionally large to stay well within token limits
    if len(final_diff) > 200000:
        final_diff = final_diff[:200000] + "\n... [Diff truncated for size limit] ..."

    # 3. Call Gemini 2.5 Flash API via raw HTTP request
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}"
    prompt = (
        "You are an AI code reviewer. Write a helpful, highly precise, and constructive review of the following pull request diff.\n"
        "Keep your response concise and structured.\n"
        "Point out any clear bugs, syntax errors, or architectural improvements.\n\n"
        f"PR Diff:\n{final_diff}"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    req_gemini = urllib.request.Request(
        gemini_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req_gemini) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            review_text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Failed to fetch review from Gemini API: {e}")
        return

    # 4. Post the review comment back to the GitHub PR thread
    comment_url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    comment_payload = {
        "body": f"### 🤖 Gemini AI Code Review\n\n{review_text}"
    }

    req_comment = urllib.request.Request(
        comment_url,
        data=json.dumps(comment_payload).encode("utf-8"),
        headers={
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req_comment) as resp_comment:
            if resp_comment.status in [200, 201]:
                print("Review posted successfully!")
            else:
                print(f"Failed to post review: {resp_comment.status}")
    except urllib.error.URLError as e:
        print(f"Failed to post comment to GitHub: {e}")

if __name__ == "__main__":
    main()
