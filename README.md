<h1 align="center">🌟 UltimateHealth (HealthGuide)</h1>

<h3 align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Roboto&size=22&duration=4995&pause=1000&color=006400&width=850&height=58&lines=Open-source+Health+Platform+%7C+React+Native+(Expo)+App+%2B+Node.js+Backend+%2B+MongoDB" alt="Typing SVG" />
  </a>
</h3>

# Contributor Note

I appreciate everyone’s interest in contributing.

A small note regarding participation and expectations: this project is maintained primarily by me as a single maintainer, so collaboration and review timelines may differ from larger teams.

This may not always be the ideal place to actively coordinate contributors, and contributors should consider possible delays before taking up work.

For this initiative, I’m contributing with limited availability (maximum ~3 hours/day), while balancing other responsibilities. Contributions are welcome, but they should align with this pace and maintain a healthy workflow.

Thank you for understanding and for your interest in the project.


<br/>


# 🚀 UltimateHealth Frontend — Upcoming Release

**Platform:** React Native (Expo) —  Android

## 🔒 Security

* Added **Sentry request body redaction** to prevent credentials and sensitive health data from being exposed.
* Improved **sensitive key detection** for tokens, passwords, auth data, and similar fields.
* Hardened **Axios auth handling** to avoid sending invalid `Bearer undefined/null` headers.

## 🐞 Bug Fixes

* Fixed **TTS player** staying visible after playback completion.
* Resolved **Home feed pagination inconsistencies** with selected categories and Saved filtering.
* Fixed **keyboard overlap** in comments input.
* Unified **API timeout error messaging**.
* Improved **Podcast playback resume/rewind behavior**.
* Fixed **guest deep link routing** for restricted screens.
* Corrected **timezone parsing** to preserve local time behavior.

## ✨ Improvements

* Integrated **Sentry monitoring + safe network logging**.
* Added centralized **API timeout handling** with fetch + Axios support.
* Improved **accessibility support** across multiple screens.
* Introduced **custom audio waveform visualization** for podcast playback.
* Migrated date utilities from **moment → date-fns** with locale support.
* Refactored **Axios instance architecture** for cleaner initialization.
* Improved **TypeScript safety** for AntDesign icons.
* Added ESLint cleanup and stricter Redux typing.

## 🧪 Testing & DX

* Added unit tests for:

  * API timeout handling
  * Date utilities
* Removed production console noise and improved developer comments/logging.

## ⚠️ Deferred

* React Navigation Sentry instrumentation (requires navigation ref architecture changes).
* Future cleanup for scoped Jest mocks.

---


<div align="center">

[![Live Web Demo](https://img.shields.io/badge/Live%20Web%20Demo-4CAF50?style=for-the-badge&logo=globe&logoColor=white)](https://uhsocial.in/frontend/v2)
[![Android App](https://img.shields.io/badge/Android%20App-Play%20Store-34A853?style=for-the-badge&logo=googleplay&logoColor=white)](https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth)
[![API Docs](https://img.shields.io/badge/API%20Docs-007ACC?style=for-the-badge&logo=swagger&logoColor=white)](https://uhsocial.in/docs)
[![Content API](https://img.shields.io/badge/Content%20API-FF6B00?style=for-the-badge&logo=python&logoColor=white)](https://uhsocial.in/content-intel/docs)

</div>



<div align="center">

<table>
  <!-- Row 1 -->
  <tr>
    <td align="center"><b>🧾 License</b></td>
    <td align="center"><b>🛠️ Frontend CI</b></td>
    <td align="center"><b>📱 Expo CI</b></td>
    <td align="center"><b>🌟 Stars</b></td>
  </tr>
  <tr>
    <td align="center">
      <img alt="License" src="https://img.shields.io/github/license/SB2318/UltimateHealth?style=flat&logo=github&color=success"/>
    </td>
    <td align="center">
      <img alt="Frontend CI" src="https://github.com/SB2318/UltimateHealth/actions/workflows/frontend-ci.yml/badge.svg?style=flat&logo=github&color=success"/>
    </td>
    <td align="center">
      <a href="https://github.com/SB2318/UltimateHealth/actions/workflows/eas-build.yml">
        <img alt="Expo Build" src="https://github.com/SB2318/UltimateHealth/actions/workflows/eas-build.yml/badge.svg?label=Expo%20Build%20(Android%20%2B%20iOS)&logo=expo&color=blue"/>
      </a>
    </td>
    <td align="center">
      <img alt="Stars" src="https://img.shields.io/github/stars/SB2318/UltimateHealth?style=flat&logo=github&color=success"/>
    </td>
  </tr>

  <!-- Row 2 -->
  <tr>
    <td align="center"><b>🍴 Forks</b></td>
    <td align="center"><b>🐛 Issues</b></td>
    <td align="center"><b>🔄 Open PRs</b></td>
    <td align="center"><b>✅ Closed PRs</b></td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/SB2318/UltimateHealth/network/members">
        <img alt="Forks" src="https://img.shields.io/github/forks/SB2318/UltimateHealth?style=flat&logo=github&color=success"/>
      </a>
    </td>
    <td align="center">
      <img alt="Issues" src="https://img.shields.io/github/issues/SB2318/UltimateHealth?style=flat&logo=github"/>
    </td>
    <td align="center">
      <img alt="Open PRs" src="https://img.shields.io/github/issues-pr/SB2318/UltimateHealth?style=flat&logo=github"/>
    </td>
    <td align="center">
      <img alt="Closed PRs" src="https://img.shields.io/github/issues-pr-closed/SB2318/UltimateHealth?style=flat&logo=github&color=critical"/>
    </td>
  </tr>

  <!-- Row 3 -->
  <tr>
    <td align="center"><b>🤖 Android Build CI</b></td>
    <td align="center"><b>🍎 iOS Build CI</b></td>
    <td align="center"><b>⏱️ Last Commit</b></td>
    <td align="center"><b>📦 Repo Size</b></td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/SB2318/UltimateHealth/actions/workflows/android-build-validation.yml">
        <img alt="Android Build CI" src="https://github.com/SB2318/UltimateHealth/actions/workflows/android-build-validation.yml/badge.svg?style=flat&logo=android&label=Android%20Build"/>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/SB2318/UltimateHealth/actions/workflows/ios-build-validation.yml">
        <img alt="iOS Build CI" src="https://github.com/SB2318/UltimateHealth/actions/workflows/ios-build-validation.yml/badge.svg?style=flat&logo=apple&label=iOS%20Build"/>
      </a>
    </td>
    <td align="center">
      <img alt="Last Commit" src="https://img.shields.io/github/last-commit/SB2318/UltimateHealth?style=flat&logo=github&color=informational"/>
    </td>
    <td align="center">
      <img alt="Repo Size" src="https://img.shields.io/github/repo-size/SB2318/UltimateHealth?style=flat&logo=github&color=success"/>
    </td>
  </tr>
</table>

</div>

---

## 📖 Overview

**UltimateHealth** (also known as **HealthGuide**) is a fully open-source health library and article management platform that delivers trusted, multilingual wellness content to users worldwide.

It combines a **React Native (Expo) mobile app**, a **Node.js REST API backend**, a **Python-powered content intelligence service**, and a **React web frontend** — all working together to provide:

- Verified health articles authored and reviewed by the community
- AI-powered health chat assistant
- Health podcasts
- Multilingual content support
- A moderated, plagiarism-checked content pipeline

> 🌐 **Live Platform:** [uhsocial.in](https://uhsocial.in/frontend/v2) &nbsp;|&nbsp; 📱 **Android App:** [Play Store](https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 Multilingual Articles | Write and read health content in any language |
| 🤝 Collaborative Reviews | Community editing, feedback & approval workflow |
| 🎙️ Health Podcasts | Publish and stream verified health podcasts |
| 🤖 AI Health Chat | AI-powered assistant for health-related queries |
| 📊 Contribution Analytics | Track your contribution impact |
| 🛡️ Content Integrity | Plagiarism detection, grammar checks & originality scoring |
| 🔒 Community Safety | Flagging system + RBAC for reviewers & admins |
| 🌐 Guest Mode | Read articles and listen to podcasts without signing in |
| 🔖 Content Preferences | Save preferences for a personalized experience |
| 🌍 Translation Support | Extend any article in your preferred language |

**Admin Features:** Interactive review dashboard, moderation tools & analytics.

*(Video Tour)*
![UltimateHealth Tour](https://github.com/user-attachments/assets/433e6b0e-6d79-4335-85d8-7977bbddae5e)

---

## 🛠️ Tech Stack

### Mobile App (React Native)
| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
| Language | TypeScript / JavaScript |
| State Management | Context API / Redux |
| Navigation | React Navigation |
| Build System | EAS Build (Expo Application Services) |
| CI/CD | GitHub Actions |

### Backend API (Node.js)
| Layer | Technology |
|---|---|
| Runtime | [Node.js](https://nodejs.org/) |
| Framework | Express.js |
| Database | [MongoDB](https://www.mongodb.com/) + Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| API Docs | Swagger — [uhsocial.in/docs](https://uhsocial.in/docs) |

### Content Intelligence API (Python)
| Layer | Technology |
|---|---|
| Language | Python |
| Purpose | Plagiarism detection, grammar analysis, originality scoring |
| API Docs | [uhsocial.in/content-intel/docs](https://uhsocial.in/content-intel/docs) |

### Web Frontend
| Layer | Technology |
|---|---|
| Framework | React |
| Branch | `web` branch |
| Live URL | [uhsocial.in/frontend/v2](https://uhsocial.in/frontend/v2) |

---

## 📁 Project Structure

```
UltimateHealth/                  # Repository root
├── frontend/                    # React Native (Expo) mobile app
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── screens/             # App screens/pages
│   │   ├── navigation/          # Navigation configuration
│   │   ├── services/            # API service calls
│   │   ├── context/             # React Context providers
│   │   └── utils/               # Helper utilities
│   ├── app.json                 # Expo app configuration
│   ├── package.json
│   └── ...
├── ieee-submodules/             # IEEE IGDTUW open source contributions
├── .github/                     # GitHub Actions CI/CD workflows
│   └── workflows/
│       ├── frontend-ci.yml      # Frontend lint/test pipeline
│       ├── eas-build.yml        # Expo EAS build (Android + iOS)
│       ├── android-build-validation.yml
│       └── ios-build-validation.yml
├── .env.example                 # Environment variable template
├── setup-android.sh             # Android environment setup script
├── CONTRIBUTING.md              # Contribution guidelines
├── CODE_OF_CONDUCT.md           # Code of conduct
├── TEST_GUIDELINES.md           # Testing guidelines
├── Learn.md                     # Learning resources
├── LICENSE                      # MIT License
└── README.md                    # This file
```

> **Note:** The **backend (Node.js + MongoDB)** and **web frontend (React)** live in separate repositories/branches. See [Services & Dependencies](#-services--api-dependencies) below.

---

## ⚙️ Environment Setup

### Prerequisites

Make sure you have the following installed before proceeding:

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | >= 18.x | JavaScript runtime |
| [Yarn](https://yarnpkg.com/) | >= 1.22.x | Package manager |
| [Git](https://git-scm.com/) | Latest | Version control |
| [Expo CLI](https://docs.expo.dev/get-started/installation/) | Latest | Mobile app tooling |
| [Android Studio](https://developer.android.com/studio) | Latest | Android emulator & SDK |
| [Xcode](https://developer.apple.com/xcode/) | Latest (macOS only) | iOS simulator |

### Installing Expo CLI

```bash
npm install -g expo-cli eas-cli
```

### Android SDK Setup (Linux/macOS)

A convenience script is included to automate Android environment setup:

```bash
chmod +x setup-android.sh
./setup-android.sh
```

This sets up required Android SDK paths and environment variables.

---

## 🚀 Installation

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then clone your fork:
git clone https://github.com/<your-username>/UltimateHealth.git
cd UltimateHealth
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in the required values (API URLs, keys, etc.)
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 3. Mobile App Setup (React Native + Expo)

```bash
cd frontend
yarn install
```

### 4. Run on Android

```bash
npx expo prebuild --clean
npx expo run:android
```

### 5. Run on iOS *(macOS only)*

```bash
npx expo prebuild --clean
npx expo run:ios
```

### 6. Run in Expo Go (Quick Preview)

```bash
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone.

---

## 🔁 Development Workflow

```
1. Fork the repository
2. Create a new branch from `main`
       git checkout -b feat/your-feature-name
3. Make your changes & commit
       git add .
       git commit -m "feat: describe your change"
4. Push your branch
       git push origin feat/your-feature-name
5. Open a Pull Request → target: main branch
6. Wait for CI checks to pass & request a review
```

### Branch Naming Convention

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation updates |
| `refactor/` | Code refactoring |
| `test/` | Tests |
| `chore/` | Build scripts, CI, tooling |

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add multilingual article support
fix: resolve crash on podcast playback
docs: update README environment setup
```

---

## 🏗️ Build & Deployment

### Development Build (Local)

```bash
cd frontend
npx expo start --dev-client
```

### Production Build via EAS

Builds are triggered automatically via GitHub Actions on pushes to `main`. You can also trigger them manually:

```bash
# Android APK/AAB
eas build --platform android --profile production

# iOS IPA (macOS + Apple Developer account required)
eas build --platform ios --profile production
```

### CI/CD Pipelines

| Workflow | Trigger | Purpose |
|---|---|---|
| `frontend-ci.yml` | Push / PR to `main` | Lint & type-check |
| `eas-build.yml` | Push to `main` | Expo EAS build (Android + iOS) |
| `android-build-validation.yml` | Push / PR | Android build validation |
| `ios-build-validation.yml` | Push / PR | iOS build validation |

---

## 🔌 Services & API Dependencies

| Service | URL | Purpose |
|---|---|---|
| REST API | [uhsocial.in/docs](https://uhsocial.in/docs) | Backend API (Node.js + MongoDB) |
| Content Intelligence | [uhsocial.in/content-intel/docs](https://uhsocial.in/content-intel/docs) | Plagiarism + grammar checks (Python) |
| Web Frontend | [uhsocial.in/frontend/v2](https://uhsocial.in/frontend/v2) | React web app (see `web` branch) |
| Android App | [Play Store](https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth) | Published Android app |

> The **backend** and **content intelligence** service are hosted separately. For local development, update your `.env` file to point to either the live APIs or locally running services.

---

## 🤝 Contribution Guidelines

We welcome contributions from everyone — developers, designers, writers, and testers!

### How to Contribute

1. Check [open issues](https://github.com/SB2318/UltimateHealth/issues) or create a new one
2. Comment on the issue to get it assigned
3. Follow the [Development Workflow](#-development-workflow) above
4. Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
5. Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
6. Follow [TEST_GUIDELINES.md](TEST_GUIDELINES.md) when adding tests

### Types of Contributions

- 🐛 Bug reports & fixes
- ✨ New features
- 📝 Health article writing & review
- 🌍 Translations
- 📖 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Testing (Android app / web platform)

> 📖 For detailed PR guidelines, code style, and review process — read [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🚀 Programs Participated In

<table>
  <tr>
    <th>Event</th>
    <th>Description</th>
  </tr>
  <tr>
   
   <td align="center"><a href="https://github.com/Maheshwari-Love"><img src="https://avatars.githubusercontent.com/u/142833275?v=4" width="120px;" alt=""/><br/><sub><b>Maheshwari Love</b></sub></a>
        </td> 
  <td align="center"><a href="https://github.com/Pujan-sarkar"><img src="https://avatars.githubusercontent.com/u/144250917?v=4" width="120px;" alt=""/><br/><sub><b>Pujan Sarkar</b></sub></a>
        </td> 

   <td align="center"><a href="https://github.com/tristnaja"><img src="https://avatars.githubusercontent.com/u/121044617?v=4" width="120px;" alt=""/><br/><sub><b>Tristan Al Harrish Basori</b></sub></a>
        </td> 
       <td align="center"><a href="https://github.com/ionfwsrijan"><img src="https://avatars.githubusercontent.com/u/201338831?v=4" width="120px;" alt=""/><br/><sub><b>SrijanCodes</b></sub></a></td>
     <td align="center"><a href="https://github.com/Sparshjoshi-iit"><img src="https://avatars.githubusercontent.com/u/181929259?v=4" width="120px;" alt=""/><br/><sub><b>Sparsh Joshi</b></sub></a></td>
     <td align="center"><a href="https://github.com/Namraa310806"><img src="https://avatars.githubusercontent.com/u/131944677?v=4" width="120px;" alt=""/><br/><sub><b>Patel Namraa</b></sub></a></td>
 </tr>

   <tr>
    <td align="center"><a href="https://github.com/Randomlyclueless"><img src="https://avatars.githubusercontent.com/u/144950366?v=4" width="120px;" alt=""/><br/><sub><b>Kimaya Chavan</b></sub></a></td>
       <td align="center"><a href="https://github.com/Vaishnavi10706"><img src="https://avatars.githubusercontent.com/u/209587091?v=4" width="120px;" alt=""/><br/><sub><b>Vaishnavi</b></sub></a></td>
     <td align="center"><a href="https://github.com/Chandrika987"><img src="https://avatars.githubusercontent.com/u/221697990?v=4" width="120px;" alt=""/><br/><sub><b>Chandrika</b></sub></a></td>
     <td align="center"><a href="https://github.com/bhavyaxtech"><img src="https://avatars.githubusercontent.com/u/202380426?v=4" width="120px;" alt=""/><br/><sub><b>Bhavya Reddy</b></sub></a></td>
     <td align="center"><a href="https://github.com/Harshit-Maurya838"><img src="https://avatars.githubusercontent.com/u/174622309?v=4" width="120px;" alt=""/><br/><sub><b>Harshit Maurya</b></sub></a></td>
     <td align="center"><a href="https://github.com/Preksha0401"><img src="https://avatars.githubusercontent.com/u/155712570?v=4" width="120px;" alt=""/><br/><sub><b>Preksha Pravin Salvi</b></sub></a></td>
 </tr>

   <tr>
    <td align="center"><a href="https://github.com/Tanisha-sharma7302"><img src="https://avatars.githubusercontent.com/u/227324372?v=4" width="120px;" alt=""/><br/><sub><b>Tanisha-sharma7302</b></sub></a></td>
       <td align="center"><a href="https://github.com/saurabhhhcodes"><img src="https://avatars.githubusercontent.com/u/157192462?v=4" width="120px;" alt=""/><br/><sub><b>Saurabh Kumar Bajpai</b></sub></a></td>
     <td align="center"><a href="https://github.com/SarthakKharche"><img src="https://avatars.githubusercontent.com/u/187843039?v=4" width="120px;" alt=""/><br/><sub><b>SarthakKharche</b></sub></a></td>
     <td align="center"><a href="https://github.com/indresh404"><img src="https://avatars.githubusercontent.com/u/256361574?v=4" width="120px;" alt=""/><br/><sub><b>Indresh </b></sub></a></td>
     <td align="center"><a href="https://github.com/Aditya-br"><img src="https://avatars.githubusercontent.com/u/172393580?v=4" width="120px;" alt=""/><br/><sub><b>Aditya B R</b></sub></a></td>
     <td align="center"><a href="https://github.com/Kaustav2706"><img src="https://avatars.githubusercontent.com/u/249536131?v=4" width="120px;" alt=""/><br/><sub><b>KAUSTAV HALDER</b></sub></a></td>
 </tr>

   <tr>
    <td align="center"><a href="https://github.com/abhilashgedela28-lang"><img src="https://avatars.githubusercontent.com/u/251615976?v=4" width="120px;" alt=""/><br/><sub><b>abhilashgedela28-lang</b></sub></a></td>
       <td align="center"><a href="https://github.com/hari2k7"><img src="https://avatars.githubusercontent.com/u/232849976?v=4" width="120px;" alt=""/><br/><sub><b>Hariharasudhan D</b></sub></a></td>
     <td align="center"><a href="https://github.com/Sujith-RMD"><img src="https://avatars.githubusercontent.com/u/224506968?v=4" width="120px;" alt=""/><br/><sub><b>SujithKumar R</b></sub></a></td>
     <td align="center"><a href="https://github.com/abdullahxyz85"><img src="https://avatars.githubusercontent.com/u/181183976?v=4" width="120px;" alt=""/><br/><sub><b>Abdullah Jameel</b></sub></a></td>
     <td align="center"><a href="https://github.com/hema7392"><img src="https://avatars.githubusercontent.com/u/142394039?v=4" width="120px;" alt=""/><br/><sub><b>Hemadri</b></sub></a></td>
     <td align="center"><a href="https://github.com/basantnema31"><img src="https://avatars.githubusercontent.com/u/208905651?v=4" width="120px;" alt=""/><br/><sub><b>Basant Nema</b></sub></a></td>
 </tr>

   <tr>
    <td align="center"><a href="https://github.com/Priya09023"><img src="https://avatars.githubusercontent.com/u/218076920?v=4" width="120px;" alt=""/><br/><sub><b>Priya09023</b></sub></a></td>
       <td align="center"><a href="https://github.com/Krishnx21"><img src="https://avatars.githubusercontent.com/u/194249486?v=4" width="120px;" alt=""/><br/><sub><b>Krishna Kumar</b></sub></a></td>
     <td align="center"><a href="https://github.com/jpdevhub"><img src="https://avatars.githubusercontent.com/u/160400709?v=4" width="120px;" alt=""/><br/><sub><b>Karan Singh</b></sub></a></td>
     <td align="center"><a href="https://github.com/SiddharthRiot"><img src="https://avatars.githubusercontent.com/u/133003051?v=4" width="120px;" alt=""/><br/><sub><b>Siddharth</b></sub></a></td>
     <td align="center"><a href="https://github.com/KRUSHAL2956"><img src="https://avatars.githubusercontent.com/u/134606696?v=4" width="120px;" alt=""/><br/><sub><b>Krushal Hirpara</b></sub></a></td>
     <td align="center"><a href="https://github.com/nyxsky404"><img src="https://avatars.githubusercontent.com/u/189461188?v=4" width="120px;" alt=""/><br/><sub><b>Sumit Kumar</b></sub></a></td>
 </tr>

   <tr>
    <td align="center"><a href="https://github.com/PranavAgarkar07"><img src="https://avatars.githubusercontent.com/u/90404176?v=4" width="120px;" alt=""/><br/><sub><b>Pranav Agarkar</b></sub></a></td>
       <td align="center"><a href="https://github.com/Maskman014"><img src="https://avatars.githubusercontent.com/u/225333585?v=4" width="120px;" alt=""/><br/><sub><b>Krishna Veernala</b></sub></a></td>
     <td align="center"><a href="https://github.com/vinalal"><img src="https://avatars.githubusercontent.com/u/121111797?v=4" width="120px;" alt=""/><br/><sub><b>Vinayak Lal</b></sub></a></td>
     <td align="center"><a href="https://github.com/VirenSumbly"><img src="https://avatars.githubusercontent.com/u/56977249?v=4" width="120px;" alt=""/><br/><sub><b>leVir</b></sub></a></td>
     <td align="center"><a href="https://github.com/vipul674"><img src="https://avatars.githubusercontent.com/u/140911122?v=4" width="120px;" alt=""/><br/><sub><b>vipul674</b></sub></a></td>
     <td align="center"><a href="https://github.com/palakjaiswal16"><img src="https://avatars.githubusercontent.com/u/116461116?v=4" width="120px;" alt=""/><br/><sub><b>palakjaiswal16</b></sub></a></td>
 </tr>

   <tr>
    <td align="center"><a href="https://github.com/Pcmhacker-piro"><img src="https://avatars.githubusercontent.com/u/181658297?v=4" width="120px;" alt=""/><br/><sub><b>Prakash Meena</b></sub></a></td>
   </tr>
 </table>
 <!-- CONTRIBUTORS-TABLE-END -->
</div>

---

## 🗺️ LIVE (2.1.0)

- **Translation Contribution** — Extend any article in your preferred language
- **Guest Mode Support** — Read articles and listen to podcasts without signing in
- **Content Preference Save** — Save your preferences for a more personalized future experience

**Coming soon.** 🚀

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for full details.

---

<div align="center">

Made with ❤️ by the [UltimateHealth Community](https://github.com/SB2318/UltimateHealth/graphs/contributors)

⭐ **Star this repo** if you find it helpful — it motivates us to keep building!

[![GitHub stars](https://img.shields.io/github/stars/SB2318/UltimateHealth?style=social)](https://github.com/SB2318/UltimateHealth/stargazers)

</div>
