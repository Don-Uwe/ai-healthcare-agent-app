# 🗂️ Fetchai Innovation-Lab-Examples — Issue Planning

> **Repository:** [fetchai/innovation-lab-examples](https://github.com/fetchai/innovation-lab-examples)
> **Created:** 2026-05-19
> **Purpose:** Track all proposed and verified issues for contribution planning

---

## 📊 Priority Matrix

| # | Issue Title | Priority | Difficulty | Impact | Status |
|---|---|---|---|---|---|
| 1 | Missing `.env.example` + Security Bug | 🔴 Critical | 🟢 Easy | 🔥 High | Filed as [#48](https://github.com/fetchai/innovation-lab-examples/issues/48) — needs edit |
| 2 | CI Workflow to Validate Folder Structure | 🟠 High | 🟡 Medium | 🔥🔥 Very High | To file |
| 3 | Standardize README Template | 🟡 Medium | 🟢 Easy | 🔥 High | To file |
| 4 | Interactive Web Dashboard | 🟢 Low | 🔴 Hard | 🚀 Massive | To file (future) |
| 5 | Secret Scanning Pre-commit Hook | 🔴 Critical | 🟡 Medium | 🔐 Critical | To file |

---

## ✅ Issue Tracker

- `[ ]` Issue 1 — Edit #48 with corrected body
- `[ ]` Issue 2 — File CI Validator issue
- `[ ]` Issue 3 — File README Template issue
- `[ ]` Issue 4 — File Web Dashboard issue (future)
- `[ ]` Issue 5 — File Secret Scanning issue

---

---

## 🔴 Issue 1 — Missing `.env.example` + Security Bug

**GitHub Issue:** [#48](https://github.com/fetchai/innovation-lab-examples/issues/48) *(filed, needs editing)*
**Status:** 🔴 Needs correction — original had wrong folder names

### Title
```
[Bug]: Missing .env.example in several agent examples + actual .env file committed (security)
```

### Labels
`bug` · `security` · `documentation` · `good first issue` · `help wanted`

### Description

The root `README.md` quickstart (line 37) instructs users to run:
```bash
cp .env.example .env
```
And `CONTRIBUTING.md` explicitly requires every example to include `.env.example`.

After a **full GitHub API audit**, several confirmed folders are missing `.env.example`. Additionally, `Crewai-agents/trip_planner/` has an **actual `.env` file committed** to the repository — a potential credential leak.

### ✅ Verified Affected Folders

| Folder | Issue | Severity |
|---|---|---|
| `Crewai-agents/trip_planner/` | Actual `.env` committed to git | 🔴 Security Bug |
| `Crewai-agents/Blood-Report-Analysis-Agent/` | No `.env.example` | 🟡 Bug |
| `stripe-payment-agents/conversational-property-finder/` | No `.env.example` | 🟡 Bug |
| `a2a-uAgents-Integration/a2a-Inbound-Communication/` | No `.env.example` | 🟡 Bug |
| `a2a-uAgents-Integration/a2a-Outbound-Communication/` | No `.env.example` | 🟡 Bug |

> ⚠️ **Not affected** (already have `.env.example`): `llama-index/`, `ag2-agents/payment-approval/`, `community_agent/`, `stripe-payment-agents/expense-calculator-group/`

### Steps to Reproduce

```bash
git clone https://github.com/fetchai/innovation-lab-examples.git
cd innovation-lab-examples/Crewai-agents/Blood-Report-Analysis-Agent
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
ls -la       # No .env.example ❌
python agent.py
```

**Error:**
```
KeyError: 'OPENAI_API_KEY'
```

### Proposed Fix

1. **Urgent:** Remove `Crewai-agents/trip_planner/.env` from git history, rotate credentials
2. Add `.env.example` to each missing folder
3. Add CI check to enforce `.env.example` presence when `os.getenv` is used

### Effort Estimate
- Security fix: ~30 min
- Adding `.env.example` to 4 folders: ~1 hour
- CI check: ~2 hours

---

---

## 🟠 Issue 2 — CI Workflow to Validate Example Folder Structure

**GitHub Issue:** Not yet filed
**Status:** 🟡 To file

### Title
```
[Feature]: Add GitHub Actions job to enforce consistent folder structure in PRs
```

### Labels
`enhancement` · `ci/cd` · `infrastructure`

### Description

The current `.github/workflows/pull_request_ci.yml` only checks if the PR author has **starred the repo**. It has zero validation of:
- Folder structure completeness
- Presence of `README.md`, `requirements.txt`, `.env.example`
- Correct entry point naming
- Ruff linting compliance

This causes recurring issues (e.g., #34, #35, #48) to slip through review.

### Proposed Fix

Add a Python validation script triggered on PRs:

```yaml
# .github/workflows/pull_request_ci.yml (addition)
- name: Validate example folder structure
  run: python scripts/check_structure.py
```

```python
# scripts/check_structure.py
import os, sys, glob

REQUIRED = ["README.md", "requirements.txt"]
errors = []

for py_file in glob.glob("**/*.py", recursive=True):
    folder = os.path.dirname(py_file)
    if folder == "":
        continue
    with open(py_file) as f:
        src = f.read()
    # Check .env.example if env vars used
    if ("os.getenv" in src or "os.environ" in src):
        if not os.path.exists(os.path.join(folder, ".env.example")):
            errors.append(f"❌ Missing .env.example in: {folder}/")
    # Check required files
    for req in REQUIRED:
        if not os.path.exists(os.path.join(folder, req)):
            errors.append(f"❌ Missing {req} in: {folder}/")

if errors:
    print("\n".join(errors))
    sys.exit(1)

print("✅ All example folders passed structure check.")
```

### Steps to Reproduce the Gap

1. Open any recent PR that adds a new example (e.g., #34, #35)
2. Check the CI run — it only validates the star check, nothing else
3. PR gets merged with missing `README.md` or `.env.example`

### Effort Estimate
- Script: ~2 hours
- CI integration + testing: ~1 hour
- Total: ~3 hours

---

---

## 🟡 Issue 3 — Standardize README Template Across All Examples

**GitHub Issue:** Not yet filed
**Status:** 🟡 To file

### Title
```
[Docs]: Inconsistent README format across examples — enforce standard template
```

### Labels
`documentation` · `good first issue` · `help wanted`

### Description

The repo has a `docs/AGENT_README_TEMPLATE.md` but it is **not enforced**. Examples like `gemini-quickstart/` have detailed READMEs with architecture diagrams, while others like `Crewai-agents/Blood-Report-Analysis-Agent/` have only ~20 lines with no setup instructions.

This creates an inconsistent contributor and user experience and reduces discoverability of examples.

### Affected Examples (Short/Incomplete READMEs)

| Folder | README Size | Missing Sections |
|---|---|---|
| `Crewai-agents/Blood-Report-Analysis-Agent/` | 1,642 bytes | Architecture, Prerequisites, Output |
| `ag2-agents/research-synthesis-team/` | Unknown | Needs audit |
| `a2a-uAgents-Integration/` subfolders | Likely minimal | Needs audit |

### Proposed Fix

1. Update `docs/AGENT_README_TEMPLATE.md` with required sections:
   - Overview, Architecture, Prerequisites, Setup, Running, Sample Output, Contributing
2. Add a CI check that warns if a PR's `README.md` is under 30 lines
3. Open a tracking issue to retrofit existing examples

```yaml
# CI check addition
- name: Check README length
  run: |
    for f in $(git diff --name-only HEAD~1 | grep README.md); do
      lines=$(wc -l < $f)
      if [ $lines -lt 30 ]; then
        echo "❌ $f is too short ($lines lines). Minimum: 30"
        exit 1
      fi
    done
```

### Effort Estimate
- Template update: ~1 hour
- CI check: ~30 min
- Retrofitting existing READMEs: ~3–4 hours (per example ~15 min)

---

---

## 🟢 Issue 4 — Interactive Web Dashboard to Browse and Run Examples

**GitHub Issue:** Not yet filed
**Status:** 🟢 Future / Long-term

### Title
```
[Feature]: Add an interactive web dashboard to explore and launch examples
```

### Labels
`enhancement` · `feature-request` · `high-impact`

### Description

All 30+ examples are currently CLI-only. A **lightweight web UI** would let users:

- Browse available examples with metadata (difficulty, tech stack, description)
- See architecture diagrams inline
- Copy-paste setup commands in one click
- View live agent log output streamed to the browser
- Filter by tech stack (Gemini, Claude, CrewAI, etc.)

This would make the repo a **showcase-ready demo platform** for Fetch.ai technologies.

### Proposed Stack

```
FastAPI (backend)  +  Vanilla JS/HTML (frontend)  +  WebSockets (live logs)
```

Or simpler:
```
Streamlit — zero-config dashboard with agent metadata cards
```

### Mockup Structure

```
dashboard/
├── app.py              # FastAPI or Streamlit app
├── metadata.json       # Auto-generated from each example's README
├── static/
│   ├── index.html
│   └── styles.css
└── scripts/
    └── generate_metadata.py   # Parses all README.md files
```

### Effort Estimate
- Metadata parser: ~2 hours
- Basic Streamlit dashboard: ~4 hours
- Full FastAPI + HTML dashboard: ~2 days

---

---

## 🔴 Issue 5 — Secret Scanning Pre-commit Hook

**GitHub Issue:** Not yet filed
**Status:** 🔴 Critical / Should file soon (linked to Issue 1 security finding)

### Title
```
[Security]: Add pre-commit secret scanning to prevent accidental API key commits
```

### Labels
`security` · `enhancement` · `ci/cd`

### Description

The `Crewai-agents/trip_planner/.env` incident (Issue #1/[#48](https://github.com/fetchai/innovation-lab-examples/issues/48)) demonstrates that **real credentials can be committed** without any guardrails. Contributors working with API keys (Gemini, OpenAI, Claude, Stripe) risk exposing them permanently in git history.

The repo currently has **no secret scanning, no pre-commit hooks, and no CI secret detection**.

### Proposed Fix

**Option A — detect-secrets (lightweight)**
```bash
pip install detect-secrets
detect-secrets scan > .secrets.baseline
```

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

**Option B — gitleaks (more powerful)**
```yaml
# .github/workflows/secret_scan.yml
name: Secret Scanning
on: [push, pull_request]
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Also add to `CONTRIBUTING.md`:**
```markdown
## 🔐 Secret Safety
Never commit `.env` files. Always use `.env.example`.
Run `pre-commit install` before your first commit.
```

### Effort Estimate
- Setup `detect-secrets`: ~30 min
- CI gitleaks integration: ~1 hour
- Update `CONTRIBUTING.md`: ~15 min
- Total: ~2 hours

---

---

## 🗓️ Contribution Roadmap

```
Week 1 — Quick Wins
├── Edit Issue #48 with corrected body (30 min)
├── File Issue #5 (Secret Scanning) — critical (30 min)
└── Add .env.example to 4 missing folders — open PR (1–2 hrs)

Week 2 — Medium Impact
├── File Issue #2 (CI Validator)
├── Implement check_structure.py script — open PR (3 hrs)
└── File Issue #3 (README Template)

Week 3 — Documentation
├── Retrofit short READMEs in affected folders (3–4 hrs)
└── Update CONTRIBUTING.md with pre-commit hook instructions

Month 2 — Future
└── File + implement Issue #4 (Web Dashboard)
```

---

## 📎 References

| Resource | Link |
|---|---|
| Repository | https://github.com/fetchai/innovation-lab-examples |
| Issue #48 (filed) | https://github.com/fetchai/innovation-lab-examples/issues/48 |
| CONTRIBUTING.md | https://github.com/fetchai/innovation-lab-examples/blob/main/CONTRIBUTING.md |
| Agent README Template | https://github.com/fetchai/innovation-lab-examples/blob/main/docs/AGENT_README_TEMPLATE.md |
| uAgents Docs | https://github.com/fetchai/uAgents |
| detect-secrets | https://github.com/Yelp/detect-secrets |
| gitleaks | https://github.com/gitleaks/gitleaks |
