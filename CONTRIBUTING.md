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
3. **Set up the frontend (React Native + Expo)**
   ```bash
   cd frontend
   yarn install
   npx expo prebuild --clean

   npx expo run android   # For Android
   # or
   npx expo run ios       # For iOS (requires macOS + Xcode) ```

## Development Workflow

1. **Create a branch** for your changes (use a clear name):

  ```
  git checkout -b feature/add-new-health-article
  # or
  git checkout -b bugfix/fix-plagiarism-check
  ```
2. **Make your changes** and test them thoroughly.
3. **Commit your changes** using clear, conventional messages:
```
feat: add multilingual article publishing support
fix: resolve crash in AI chat when no internet
docs: update contribution guidelines
```
4. **Push to your fork** and open a **Pull Request** to the **main** branch.


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


## Recognition

All contributors are listed in the **README**.  
We greatly appreciate every contribution, big or small!

Thank you for helping make **UltimateHealth** a trusted resource for wellness information.

— **The UltimateHealth Team**  
*(Susmita Bhattacharya & contributors)*

