# Contributing to UltimateHealth

Thank you for your interest in contributing to **UltimateHealth** (also known as HealthGuide)!  
We are building an open-source health library and article management platform to deliver reliable, multilingual wellness content, AI-powered chat, podcasts, and community-driven improvements. Your contributions help us empower people to take charge of their well-being.

We welcome contributions from everyone — whether you're a first-time contributor, developer, content creator, tester, or designer.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all participants to maintain a respectful and inclusive environment.

## Ways to Contribute

You can contribute in many ways:

- **Reporting bugs** or suggesting improvements (Issues)
- **Fixing bugs** or implementing new features (Pull Requests)
- **Writing or reviewing health articles** (content contributions)
- **Improving documentation**
- **Adding or improving translations**
- **Enhancing the AI chat**, podcast features, or moderation tools
- **Testing** the Android app or web platform
- **Spreading the word** (starring the repo, sharing on social media)

## Getting Started

1. **Fork the repository**

   Click the **Fork** button at the top of [https://github.com/SB2318/UltimateHealth](https://github.com/SB2318/UltimateHealth).

2. **Clone your fork**

   ```bash
   git clone https://github.com/SB2318/UltimateHealth.git
   cd UltimateHealth
   git checkout main
   ```
3. **Set up the project**

   - **For Mobile Frontend (React Native + Expo)**:
     ```bash
     cd frontend
     yarn install
     npx expo prebuild --clean
     npx expo run android   # For Android
     # or
     npx expo run ios       # For iOS (requires macOS + Xcode)
     ```

   - **For Web Application (React)**:
     If you want to contribute to the Web application, you **must** switch to the `web` branch:
     ```bash
     git checkout web
     ```
     Refer to the `README.md` and `PR_GUIDELINES.md` on the `web` branch for setup, styling, and contribution instructions.

## Development Workflow

1. **Create a branch** for your changes (use a clear name):

  ```
  git checkout -b feature/add-new-health-article
  # or
  git checkout -b bugfix/fix-plagiarism-check
  ```
2. **Make your changes** and test them thoroughly.
   - For frontend cleanup checks, run `cd frontend && pnpm quality` before opening a PR. See [Knip Contributor Guide](docs/KNIP_CONTRIBUTOR_GUIDE.md) for dead-code review workflow.
3. **Commit your changes** using clear, conventional messages:
```
feat: add multilingual article publishing support
fix: resolve crash in AI chat when no internet
docs: update contribution guidelines
```
4. **Push to your fork** and open a **Pull Request**:
   - Target the **main** branch for mobile app/core contributions.
   - Target the **web** branch for web application contributions.


## Pull Request Guidelines

- **Keep PRs focused** — one feature or bug fix per PR.

- **Include a clear title and description:**
  - What problem does this solve?
  - How did you test it?
  - Any screenshots or videos (especially for UI changes)?

- **Reference related issues**  
  Example: `Closes #123`

- **Follow code standards**
  - Use TypeScript best practices for frontend
  - Maintain clean and structured Node.js code for backend

- **Testing**
  - Add or update tests when applicable (see `TEST_GUIDELINES.md`)

- **Documentation**
  - Update documentation if your change affects users or developers

---

We will review your PR as soon as possible. Feedback will be provided constructively.

## Content Contributions (Articles & Podcasts)

- All health content must be **accurate, evidence-based, and original**.
- The platform includes built-in:
  - Plagiarism detection
  - Grammar checks
  - Originality scoring
- Follow the review workflow:
  - **Submit → Community/Reviewers Feedback → Approval by Moderators/Admins**

---

## Issue Guidelines

- Use the provided **issue templates** when available.
- Be **clear and descriptive**.
- Include **steps to reproduce** bugs.
- For **feature requests**:
  - Explain the use case
  - Describe why it benefits the community


## Frequently Asked Questions

- Do I need to get assigned to an issue before working on it?

Yes. It is recommended to comment on the issue and wait for maintainer       assignment before starting work. This helps prevent duplicate efforts and conflicting Pull

- Which branch should I target for my Pull Request?

For mobile app and core project contributions, target the main branch.
For web application contributions, target the web branch.
Always verify the target branch before creating your PR.

-  How do I know whether an issue belongs to the mobile app or web app?

Check the issue description, labels, and affected files. If the issue mentions React Native, Expo, Android, or iOS, it likely belongs to the mobile app. If it mentions React web pages, routing, or browser UI, it likely belongs to the web branch.

- What if my Pull Request has merge conflicts?

Sync your branch with the latest changes from the target branch, resolve conflicts locally, test again, and push the updated branch.

- Do I need to update documentation when making changes?

Yes. If your contribution affects users, contributors, APIs, workflows, or setup instructions, update the relevant documentation accordingly.

## Recognition

All contributors are listed in the **README**.  
We greatly appreciate every contribution, big or small!

Thank you for helping make **UltimateHealth** a trusted resource for wellness information.

— **The UltimateHealth Team**  
*(Susmita Bhattacharya & contributors)*
