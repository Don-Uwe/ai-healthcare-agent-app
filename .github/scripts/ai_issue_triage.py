import os
import json
import urllib.request
import urllib.error
import urllib.parse
import traceback
import time

def make_request(url, method="GET", data=None, headers=None, token=None):
    if headers is None:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "AI-Issue-Triage-Bot"
        }
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        req.data = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
        
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            resp_body = response.read().decode("utf-8")
            return json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} for {url}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"Request failed for {url}: {e}")
        return None

def fetch_issue(repo, issue_number, token):
    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}"
    return make_request(url, token=token)

def fetch_recent_issues(repo, token, limit=50):
    # Fetch recent issues for duplicate checking context
    url = f"https://api.github.com/repos/{repo}/issues?state=all&per_page={limit}&sort=created&direction=desc"
    issues = make_request(url, token=token)
    if not issues: return []
    
    context = []
    for issue in issues:
        # Avoid including PRs in issue duplicate check if not needed, but PRs can be duplicates too
        context.append({
            "number": issue["number"],
            "title": issue["title"],
            "state": issue["state"],
            "html_url": issue["html_url"]
        })
    return context

def generate_triage_decision(title, body, recent_issues_context, api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    prompt = f"""
You are an automated Issue Triage Assistant responsible for reviewing newly created issues, validating them against repository rules, checking for duplicates, assigning labels, and determining assignment eligibility.

## Repository Context
This repository is focused on: Health Articles, Health Content Discovery, Podcasts, AI Chat Assistant, User Analytics, User Engagement Features, Content Intelligence, Frontend Experience, Backend APIs supporting the above features.
The repository is NOT intended for: Doctor consultation systems, Hospital management systems, Clinical workflows, Doctor onboarding, Doctor appointment management, Medical practitioner management, Healthcare provider administration.

## Initial Validation
Check whether the issue contains: Clear problem statement, Reproduction steps (if bug), Expected behavior, Relevant screenshots/logs when applicable, Sufficient implementation details.
If the issue lacks enough information, mark `is_valid = false`.

## Scope Validation
If the issue involves Doctors, Practitioners, Appointments, Clinical workflows, Hospitals, or Medical staff management, mark `is_in_scope = false` and `is_doctor_related = true`.
If the issue is: Extremely broad, Product strategy discussion, Long-term roadmap item, Infrastructure migration, Security-sensitive, or Requires maintainer-only access, mark `is_in_scope = false`.

## Technical Classification
Classify as backend if it involves: APIs, Database, Authentication, Authorization, Server-side validation, Backend integrations, Content processing services, Analytics pipelines.
Classify as frontend if it involves: React Native UI, UX improvements, Components, Navigation, State management, Client-side validation, Frontend performance, Accessibility, Styling.

## Difficulty Level Assignment
Level 1: Small fixes (UI alignment, Typo fixes, Simple validations, Minor component updates).
Level 2: Medium complexity (New screens, Feature enhancements, State management updates, API integrations).
Level 3: Advanced (Architecture changes, Complex analytics, Performance optimizations, Large feature additions).

## Maintainer Escalation
You must set `escalate_to_maintainer = true` when:
* Backend issue
* Scope ambiguity
* Doctor-related request
* Architecture change
* Security concern
* Large feature proposal
* Level 3 issue

# Recent Issues for Duplicate Check
{json.dumps(recent_issues_context, indent=2)}

# New Issue
Title: {title}
Body:
{body}

Output a single JSON object. DO NOT wrap in Markdown code blocks. Output exactly this structure:
{{
  "is_valid": boolean,
  "is_duplicate": boolean,
  "duplicate_number": integer or null,
  "is_in_scope": boolean,
  "is_doctor_related": boolean,
  "classification": "backend" | "frontend" | "broad" | null,
  "difficulty": "level1" | "level2" | "level3" | null,
  "escalate_to_maintainer": boolean,
  "reasoning": "A short, polite explanation for your decision."
}}
"""
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
    }
    
    req = urllib.request.Request(url, method="POST", headers=headers, data=json.dumps(data).encode("utf-8"))
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode("utf-8"))
            text_response = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            # Clean up markdown if accidentally included
            if text_response.startswith("```json"):
                text_response = text_response[7:]
            if text_response.endswith("```"):
                text_response = text_response[:-3]
            return json.loads(text_response)
    except Exception as e:
        print(f"Gemini API failed: {e}")
        return None

def add_labels(repo, issue_number, labels, token):
    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/labels"
    make_request(url, method="POST", data={"labels": labels}, token=token)

def post_comment(repo, issue_number, body, token):
    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/comments"
    make_request(url, method="POST", data={"body": body}, token=token)

def close_issue(repo, issue_number, token):
    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}"
    make_request(url, method="PATCH", data={"state": "closed"}, token=token)

def check_active_assignments(repo, username, token):
    """Returns True if the user has >= 1 open assigned issue in this repo."""
    url = f"https://api.github.com/repos/{repo}/issues?assignee={username}&state=open"
    issues = make_request(url, token=token)
    return issues is not None and len(issues) > 0

def check_previous_prs(repo, username, token):
    """Returns True if the user has submitted at least one PR (open or closed) in this repo."""
    # Search for PRs created by the user in this repo
    query = urllib.parse.quote(f"repo:{repo} is:pr author:{username}")
    url = f"https://api.github.com/search/issues?q={query}"
    result = make_request(url, token=token)
    if result and "total_count" in result:
        return result["total_count"] > 0
    return False

def assign_user(repo, issue_number, username, token):
    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/assignees"
    make_request(url, method="POST", data={"assignees": [username]}, token=token)

def handle_issue_opened(repo, issue_number, token, gemini_api_key):
    print(f"Triaging new issue #{issue_number}...")
    issue = fetch_issue(repo, issue_number, token)
    if not issue: return
    
    title = issue.get("title", "")
    body = issue.get("body", "")
    
    recent_issues = fetch_recent_issues(repo, token)
    # Remove self from recent issues to avoid false duplicate
    recent_issues = [i for i in recent_issues if str(i["number"]) != str(issue_number)]
    
    decision = generate_triage_decision(title, body, recent_issues, gemini_api_key)
    if not decision:
        print("Failed to get triage decision.")
        return
        
    print(f"Triage Decision: {json.dumps(decision, indent=2)}")
    
    labels_to_add = []
    
    if decision.get("is_duplicate"):
        labels_to_add.append("duplicate")
        dup_num = decision.get("duplicate_number")
        msg = f"This issue appears to already be tracked in an existing issue or pull request (#{dup_num}).\n\nTo keep discussions centralized, this issue will be closed as a duplicate.\n\n> **Reasoning:** {decision.get('reasoning')}"
        post_comment(repo, issue_number, msg, token)
        add_labels(repo, issue_number, labels_to_add, token)
        close_issue(repo, issue_number, token)
        return

    if not decision.get("is_in_scope"):
        labels_to_add.append("out-of-scope")
        if decision.get("is_doctor_related"):
            labels_to_add.append("doctor-module")
            msg = f"This repository currently focuses on health content, podcasts, analytics, AI assistant features, and related user experiences.\n\nDoctor and clinical workflow features are currently outside the scope of the GSSoC contribution program.\n\nMaintainer review may be required for future consideration. cc @SB2318\n\n> **Reasoning:** {decision.get('reasoning')}"
        else:
            msg = f"This issue has been marked as out of scope for the current contribution program.\n\n> **Reasoning:** {decision.get('reasoning')}"
        
        post_comment(repo, issue_number, msg, token)
        add_labels(repo, issue_number, labels_to_add, token)
        close_issue(repo, issue_number, token)
        return

    if not decision.get("is_valid"):
        labels_to_add.append("needs-information")
        msg = f"Thank you for opening this issue! However, it currently lacks sufficient information for triage.\n\nPlease provide a clear problem statement, reproduction steps (if applicable), and expected behavior.\n\n> **Note:** {decision.get('reasoning')}"
        post_comment(repo, issue_number, msg, token)
        add_labels(repo, issue_number, labels_to_add, token)
        return

    # Valid and In Scope
    classification = decision.get("classification")
    difficulty = decision.get("difficulty")
    escalate = decision.get("escalate_to_maintainer")
    
    if escalate:
        labels_to_add.append("maintainer-review-required")
    
    if classification == "backend":
        labels_to_add.extend(["backend", "level:backend"])
        if difficulty: labels_to_add.append(difficulty)
        add_labels(repo, issue_number, labels_to_add, token)
        msg = "This issue requires backend investigation and has been routed to @SB2318 for review and prioritization."
        post_comment(repo, issue_number, msg, token)
        assign_user(repo, issue_number, "SB2318", token)
        return
        
    elif classification == "frontend":
        labels_to_add.append("frontend")
        if difficulty: labels_to_add.append(difficulty)
        # Apply gssoc label to mark it as successfully triaged for the batch runner
        labels_to_add.append("gssoc")
        add_labels(repo, issue_number, labels_to_add, token)
        
        if escalate:
            msg = f"This issue has been triaged as a **frontend** task, but requires maintainer review. cc @SB2318\n\n> **Reasoning:** {decision.get('reasoning')}"
        else:
            msg = f"This issue has been triaged as a **frontend** task.\n\nIt is now open for community contribution! To request assignment, please comment below.\n\n*Eligibility Reminder: You must have zero active assigned issues to be assigned.*"
            
        post_comment(repo, issue_number, msg, token)
        return
        
    else:
        # Broad or uncategorized
        if "maintainer-review-required" not in labels_to_add:
            labels_to_add.append("maintainer-review-required")
        add_labels(repo, issue_number, labels_to_add, token)
        msg = "This issue covers a broad scope or requires architectural decisions. Escalating to @SB2318 for maintainer review."
        post_comment(repo, issue_number, msg, token)


def handle_issue_comment(repo, issue_number, commenter, token):
    print(f"Evaluating assignment request for @{commenter} on PR/Issue #{issue_number}...")
    issue = fetch_issue(repo, issue_number, token)
    if not issue: return
    
    # Check if issue is closed
    if issue.get("state") == "closed":
        print("Issue is closed. Ignoring comment.")
        return
        
    # Check if issue already has assignees
    if issue.get("assignees"):
        # The user's spec states "first eligible commenter". If it's already assigned, we ignore new requests.
        print("Issue already assigned. Ignoring comment.")
        return
        
    # Check labels: Must be frontend solvable and not admin-only/backend
    labels = [l.get("name", "").lower() for l in issue.get("labels", [])]
    if "backend" in labels or "maintainer-review-required" in labels or "needs-information" in labels or "out-of-scope" in labels:
        print("Issue is not open for standard frontend contribution.")
        return
        
    if "frontend" not in labels:
        print("Issue is not marked as frontend. Triage might be incomplete. Ignoring.")
        return

    # Eligibility Check 1: Active assignments
    has_active = check_active_assignments(repo, commenter, token)
    if has_active:
        msg = f"@{commenter} You currently have an active assigned issue. Please complete your existing work before requesting a new assignment."
        post_comment(repo, issue_number, msg, token)
        return
        
    # Eligibility Check 2: Previous PR submitted (if they ever had an issue)
    # This is tricky because we can't easily query "all past assigned issues for a user".
    # The rule: "If you previously had an assigned issue, ensure that a Pull Request has been submitted before requesting another assignment."
    # We will enforce this by checking if the user has submitted at least one PR to the repo if they've been active.
    # To be perfectly accurate, we'd need to cross-reference closed assigned issues with their PRs.
    # For now, we assume if they have 0 active, we assign. If we want to strictly check "if had previous issue -> must have PR",
    # we can check if they have closed issues assigned to them.
    
    query = urllib.parse.quote(f"repo:{repo} is:issue assignee:{commenter} is:closed")
    url = f"https://api.github.com/search/issues?q={query}"
    past_issues = make_request(url, token=token)
    
    if past_issues and past_issues.get("total_count", 0) > 0:
        # User had past assigned issues. Check if they have submitted any PRs.
        has_prs = check_previous_prs(repo, commenter, token)
        if not has_prs:
            msg = f"@{commenter} It appears you previously had an assigned issue but haven't submitted a Pull Request to this repository yet. Ensure that a Pull Request has been submitted before requesting another assignment."
            post_comment(repo, issue_number, msg, token)
            return

    # Eligible!
    assign_user(repo, issue_number, commenter, token)
    
    msg = f"""> Thank you for volunteering, @{commenter}!
>
> The issue has been reviewed and determined to be suitable for community contribution.
>
> Assignment has been made based on current contributor availability.
>
> Please ensure your pull request references this issue (`Fixes #{issue_number}`) and follows repository contribution guidelines.
>
> Maintainer: @SB2318"""
    post_comment(repo, issue_number, msg, token)
    print(f"Successfully assigned #{issue_number} to {commenter}.")

def main():
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    github_token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    event_name = os.environ.get("GITHUB_EVENT_NAME")
    
    if not all([gemini_api_key, github_token, repo]):
        print("Missing required environment variables.")
        return
        
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not os.path.exists(event_path) or event_name == "workflow_dispatch":
        test_issue = os.environ.get("ISSUE_NUMBER", "").strip()
        if test_issue:
            print(f"Running manual test triage on #{test_issue}...")
            handle_issue_opened(repo, test_issue, github_token, gemini_api_key)
        else:
            print("Running batch triage on untriaged open issues...")
            url = f"https://api.github.com/repos/{repo}/issues?state=open&per_page=100"
            issues = make_request(url, token=github_token)
            if not issues:
                print("No open issues found or failed to fetch.")
                return
            
            processed = 0
            for issue in issues:
                if "pull_request" in issue:
                    continue
                
                labels = [l.get("name", "").lower() for l in issue.get("labels", [])]
                
                # Check for every open issue, which has not yet tagged gssoc or other triage labels
                skip_labels = {
                    "gssoc", "outside-ultimatehealth", "duplicate", "out-of-scope",
                    "needs-information", "backend", "maintainer-review-required"
                }
                
                if not any(lbl in skip_labels for lbl in labels):
                    num = issue["number"]
                    print(f"\n--- Batch Triaging Issue #{num} ---")
                    handle_issue_opened(repo, num, github_token, gemini_api_key)
                    processed += 1
                    time.sleep(10) # delay to avoid rate limiting
                    
            print(f"\nBatch triage complete. Processed {processed} issues.")
        return

    with open(event_path, "r") as f:
        event_data = json.load(f)
        
    action = event_data.get("action")
    
    if event_name == "issues" and action == "opened":
        issue_number = event_data["issue"]["number"]
        handle_issue_opened(repo, issue_number, github_token, gemini_api_key)
        
    elif event_name == "issue_comment" and action == "created":
        # Only process if comment is on an issue, not a PR
        if "pull_request" not in event_data["issue"]:
            issue_number = event_data["issue"]["number"]
            commenter = event_data["comment"]["user"]["login"]
            
            # Avoid responding to our own comments
            if commenter == "github-actions[bot]" or "bot" in commenter.lower():
                return
                
            handle_issue_comment(repo, issue_number, commenter, github_token)

if __name__ == "__main__":
    main()
