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

<hr>

## ✨ Key Features

- **Multilingual Article Publishing** — Write health content in any language
- **Collaborative Reviews** — Community editing, feedback & approval workflow
- **Community-Driven Content** — collaborative contributions where users can improve, refine, and expand existing health articles.
- **Health Podcasts** — Publish and share verified podcasts
- **Contribution Analytics** — Track your impact
- **Content Integrity** — Plagiarism detection, grammar checks & originality scoring
- **Community Safety** — Flagging system + RBAC for reviewers & admins

**Admin Features**: Interactive review dashboard, moderation tools & more.

*(Video Tour)*  
![UltimateHealth Tour](https://github.com/user-attachments/assets/433e6b0e-6d79-4335-85d8-7977bbddae5e)

<hr>

## 🚀 Programs Participated In

<table>
  <tr>
    <th>Event</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/63473496/153487849-4f094c16-d21c-463e-9971-98a8af7ba372.png" width="180" alt="GSSoC 2026"/></td>
    <td><b>GirlScript Summer of Code 2026</b><br>3-month open source program empowering next-generation developers through real-world contributions</td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/e0a40d06-f5b8-42a7-a5a0-033280f842be" width="180" alt="IEEE"/></td>
    <td><b>IEEE IGDTUW Open Source Week</b><br>November 12–18</td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/2b03167c-a598-48be-9f93-66130e58ec00" width="180" alt="Vultr"/></td>
    <td><b>Vultr Cloud Innovate Hackathon</b><br>Build innovative solutions using Vultr cloud</td>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/63473496/153487849-4f094c16-d21c-463e-9971-98a8af7ba372.png" width="180" alt="GSSoC"/></td>
    <td><b>GirlScript Summer of Code 2024</b><br>3-month open source program for beginners</td>
  </tr>
</table>

<hr>

## 📖 Blogs

- [Firebase Cloud Messaging Backend (Node.js)](https://medium.com/@bhattacharyas161/firebase-cloud-messaging-backend-implementation-using-nodejs-and-expressjs-5e1525856a3f)
- [Firebase Cloud Messaging in React Native](https://medium.com/@bhattacharyas161/firebase-cloud-messaging-in-react-native-v8-vs-v9-setup-and-troubleshooting-0d1ed52fdead)

##  Submodule Repositories

- **Backend Repository**: [ultimatehealth-backend](https://github.com/SB2318/ultimatehealth-backend)
- **Admin Repository**:  [ultimatehealth-admin](https://github.com/SB2318/ultimatehealth-admin-app)
- **Content Checker Repository**:  [content-checker](https://github.com/SB2318/VeriWise-Content-Check)

<hr>

## 🛠️ Tech Stack

<p>
  <img src="https://i.pinimg.com/originals/79/5e/bb/795ebb5f4a470cd7242136237f61fc53.png" alt="Java" width="70" height="50" />
  <img src="https://e7.pngegg.com/pngimages/247/558/png-clipart-node-js-javascript-express-js-npm-react-github-angle-text.png" alt="Node.js" width="50" height="50" />
  <img src="https://cdn.icon-icons.com/icons2/2699/PNG/512/expressjs_logo_icon_169185.png" alt="Express" width="50" height="50" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png" alt="React" width="50" height="50" />
  <img src="https://staging.svgrepo.com/show/331488/mongodb.svg" alt="MongoDB" width="60" height="50" />
</p>

<hr>

## 📌 Contents

- [Key Features](#-key-features)
- [Programs Participated](#-programs-participated-in)
- [Getting Started](#getting-started)
- [Contribution Guidelines](#-contribution-guidelines)
- [Our Vision](#-our-vision)
- [Contributors](#our-contributors-)

<hr>

## Getting Started ⚡

1. Clone the repo:
   ```bash
   git clone https://github.com/SB2318/UltimateHealth.git
   cd UltimateHealth
   git checkout main
   cd frontend
2. Frontend (React Native + Expo)

  ```bash
   yarn install
   npx expo prebuild --clean
   npx expo run android (for android)
   npx expo run ios (for Ios)
 ```

## 🤝 Contribution Guidelines

We welcome contributions to both our **Mobile Application (Expo/React Native)** and **Web Application (React)**!

### 📱 Mobile Contributions (main branch)
- Mobile code is located on the `main` branch.
- Follow the standard guidelines in [CONTRIBUTING.md](CONTRIBUTING.md).
- Create your feature branch off `main` and target your PRs to `main`.

### 🌐 Web Contributions (web branch)
- Web code is located on the dedicated `web` branch.
- Switch to the web branch using `git checkout web`.
- Read and follow the detailed [Web PR & Contribution Guidelines](https://github.com/SB2318/UltimateHealth/blob/web/PR_GUIDELINES.md) on the `web` branch.
- **CRITICAL:** Ensure all web-related Pull Requests **target the `web` branch** and NOT `main`.

## :zap:Our Vision:

We are committed to delivering reliable health information and comprehensive resources that empower individuals to take charge of their well-being. Our mission is to foster a healthier society by providing trustworthy, accessible, and engaging content, enabling users to make informed decisions and lead healthier lives.

##  Feedback and Support:

If you encounter any issues or have any feedback or suggestions, please open an issue in the Issues section of this repository. We appreciate your feedback and will respond as soon as possible.

<hr>
          
<h2 align = "center">Our Previous Contributors ❤️</h2>
<div align = "center">
 <h3>Thank you for contributing to our repository</h3>
 <h1> We appreciate your help in making UltimateHealth even better.😃</h1>

 <!-- CONTRIBUTORS-TABLE-START -->
 <table>
  <tr>
    <td align="center"><a href="https://github.com/SB2318"><img src="https://avatars.githubusercontent.com/u/87614560?v=4" width="120px;" alt=""/><br/><sub><b>Susmita Bhattacharya</b></sub></a></td>
    <td align="center"><a href="https://github.com/suhanipaliwal"><img src="https://avatars.githubusercontent.com/u/161575955?v=4" width="120px;" alt=""/><br/><sub><b>Suhani Singh Paliwal</b></sub></a></td>
      <td align="center"><a href="https://github.com/BHS-Harish"><img src="https://avatars.githubusercontent.com/u/114602603?v=4" width="120px;" alt=""/><br/><sub><b>Balaharisankar Lakshmanaperumal</b></sub></a>
        </td>  
    <td align="center"><a href="https://github.com/SharmaNishchay"><img src="https://avatars.githubusercontent.com/u/146124877?v=4" width="120px;" alt=""/><br/><sub><b>SharmaNischay</b></sub></a></td>
    <td align="center"><a href="https://github.com/officeneerajsaini"><img src="https://avatars.githubusercontent.com/u/118799941?v=4" width="120px;" alt=""/><br/><sub><b>Neeraj Saini</b></sub></a></td>
     <td align="center"><a href="https://github.com/meghanagottapu"><img src="https://avatars.githubusercontent.com/u/43183125?v=4" width="120px;" alt=""/><br/><sub><b>meghana gottapu</b></sub></a></td>
 
     
 </tr>
   
   <tr>
     <td align="center"><a href="https://github.com/jaickeyminj"><img src="https://avatars.githubusercontent.com/u/95216865?v=4" width="120px;" alt=""/><br/><sub><b>Jaickey Joy Minj</b></sub></a></td> 
     <td align="center"><a href="https://github.com/Asymtode712"><img src="https://avatars.githubusercontent.com/u/115717746?v=4" width="120px;" alt=""/><br/><sub><b>Siddheya Kulkarni</b></sub></a></td>
    <td align="center"><a href="https://github.com/PradnyaGaitonde"><img src="https://avatars.githubusercontent.com/u/116059908?v=4" width="120px;" alt=""/><br/><sub><b>Pradnya Gaitonde</b></sub></a></td>
    <td align="center"><a href="https://github.com/sanmarg"><img src="https://avatars.githubusercontent.com/u/50082154?v=4" width="120px;" alt=""/><br/><sub><b>Sanmarg Sandeep Paranjpe</b></sub></a></td>
    <td align="center"><a href="https://github.com/adrikaDwivedi"><img src="https://avatars.githubusercontent.com/u/89826992?v=4" width="120px;" alt=""/><br/><sub><b>AdrikaDwivedi</b></sub></a></td>
    <td align="center"><a href="https://github.com/Arpcoder"><img src="https://avatars.githubusercontent.com/u/100352419?v=4" width="120px;" alt=""/><br/><sub><b>Arpna</b></sub></a></td>
   
 </tr>

<tr>
   <td align="center"><a href="https://github.com/alishasingh06"><img src="https://avatars.githubusercontent.com/u/114938485?v=4" width="120px;" alt=""/><br/><sub><b>Alisha Singh</b></sub></a></td>  
     <td align="center"><a href="https://github.com/Sibam-Paul"><img src="https://avatars.githubusercontent.com/u/158052549?v=4" width="120px;" alt=""/><br/><sub><b>Sibam Paul</b></sub></a></td> 
    <td align="center"><a href="https://github.com/rushiii3"><img src="https://avatars.githubusercontent.com/u/105168088?v=4" width="120px;" alt=""/><br/><sub><b>HRUSHIKESH SHINDE</b></sub></a></td>
    <td align="center"><a href="https://github.com/soham0005"><img src="https://avatars.githubusercontent.com/u/83421425?v=4" width="120px;" alt=""/><br/><sub><b>Soham Adhyapak</b></sub></a></td>
    <td align="center"><a href="https://github.com/kylie-kiaying"><img src="https://avatars.githubusercontent.com/u/133581245?v=4" width="120px;" alt=""/><br/><sub><b>Kylie</b></sub></a></td>
    <td align="center"><a href="https://github.com/Himanshu8850"><img src="https://avatars.githubusercontent.com/u/128601673?v=4" width="120px;" alt=""/><br/><sub><b>Himanshu Choudhary</b></sub></a></td>
  
 </tr>

 <tr>
       <td align="center"><a href="https://github.com/Hemu21"><img src="https://avatars.githubusercontent.com/u/106808387?v=4" width="120px;" alt=""/><br/><sub><b>Hemanth kumar</b></sub></a></td> 
     <td align="center"><a href="https://github.com/nishant0708"><img src="https://avatars.githubusercontent.com/u/101548649?v=4" width="120px;" alt=""/><br/><sub><b>Nishant Kaushal</b></sub></a></td> 
    <td align="center"><a href="https://github.com/Kamaleshbala01"><img src="https://avatars.githubusercontent.com/u/139665559?v=4" width="120px;" alt=""/><br/><sub><b>Kamalesh Bala</b></sub></a></td>
    <td align="center"><a href="https://github.com/ParthNakum21"><img src="https://avatars.githubusercontent.com/u/134558990?v=4" width="120px;" alt=""/><br/><sub><b>Parth Nakum</b></sub></a></td>
     <td align="center"><a href="https://github.com/Abhigna-arsam"><img src="https://avatars.githubusercontent.com/u/125258286?v=4" width="120px;" alt=""/><br/><sub><b>Abhigna Arsam</b></sub></a></td>
      <td align="center"><a href="https://github.com/MaryamMohamedYahya"><img src="https://avatars.githubusercontent.com/u/147263523?v=4" width="120px;" alt=""/><br/><sub><b>MaryamMohamedYahya</b></sub></a></td>

  
 </tr>

   <tr>
      <td align="center"><a href="https://github.com/thevijayshankersharma"><img src="https://avatars.githubusercontent.com/u/109781385?v=4" width="120px;" alt=""/><br/><sub><b>Vijay Shanker Sharma</b></sub></a></td>
    <td align="center"><a href="https://github.com/TonyStark-47"><img src="https://avatars.githubusercontent.com/u/73957207?v=4" width="120px;" alt=""/><br/><sub><b>Tony Stark</b></sub></a>
        </td>
   <td align="center"><a href="https://github.com/iamworrell"><img src="https://avatars.githubusercontent.com/u/99043769?v=4" width="120px;" alt=""/><br/><sub><b>Worrell Seville</b></sub></a>
        </td>  

   <td align="center"><a href="https://github.com/Aditijainnn"><img src="https://avatars.githubusercontent.com/u/144632601?v=4" width="120px;" alt=""/><br/><sub><b>Aditi</b></sub></a>
        </td>  

  <td align="center"><a href="https://github.com/ananyag309"><img src="https://avatars.githubusercontent.com/u/145869907?v=4" width="120px;" alt=""/><br/><sub><b>Ananya Gupta</b></sub></a>
        </td> 
   <td align="center"><a href="https://github.com/akshathere"><img src="https://avatars.githubusercontent.com/u/106247875?v=4" width="120px;" alt=""/><br/><sub><b>akshathere</b></sub></a>
        </td> 


 </tr>

 <tr>

   <td align="center"><a href="https://github.com/Ayushmaanagarwal1211"><img src="https://avatars.githubusercontent.com/u/118350936?v=4" width="120px;" alt=""/><br/><sub><b>Ayushmaan Agarwal</b></sub></a>
        </td> 
    <td align="center"><a href="https://github.com/Damini2004"><img src="https://avatars.githubusercontent.com/u/119414762?v=4" width="120px;" alt=""/><br/><sub><b>Damini Chachane</b></sub></a>
        </td> 
   <td align="center"><a href="https://github.com/Parth20GitHub"><img src="https://avatars.githubusercontent.com/u/142086512?v=4" width="120px;" alt=""/><br/><sub><b>Parth Shah</b></sub></a>
        </td>  
  <td align="center"><a href="https://github.com/sreevidya-16"><img src="https://avatars.githubusercontent.com/u/115856774?v=4" width="120px;" alt=""/><br/><sub><b>Sree Vidya</b></sub></a>
        </td> 
  <td align="center"><a href="https://github.com/AsmitaMishra24"><img src="https://avatars.githubusercontent.com/u/146121869?v=4" width="120px;" alt=""/><br/><sub><b>Asmita Mishra</b></sub></a>
        </td> 
<td align="center"><a href="https://github.com/iamkanhaiyakumar"><img src="https://avatars.githubusercontent.com/u/120328606?v=4" width="120px;" alt=""/><br/><sub><b>Kanhaiya Kumar</b></sub></a>
        </td> 
   
 </tr>
 <tr>
   
   <td align="center"><a href="https://github.com/revanth1718"><img src="https://avatars.githubusercontent.com/u/109272714?v=4" width="120px;" alt=""/><br/><sub><b>Revanth Pasupuleti</b></sub></a>
        </td> 
   <td align="center"><a href="https://github.com/arunimaChintu"><img src="https://avatars.githubusercontent.com/u/99474881?v=4" width="120px;" alt=""/><br/><sub><b>Arunima Dutta</b></sub></a>
        </td> 
   <td align="center"><a href="https://github.com/Maana-Ajmera"><img src="https://avatars.githubusercontent.com/u/162733812?v=4" width="120px;" alt=""/><br/><sub><b>Maana Ajmera</b></sub></a>
        </td>  
     <td align="center"><a href="https://github.com/ANKeshri"><img src="https://avatars.githubusercontent.com/u/159682348?v=4" width="120px;" alt=""/><br/><sub><b>Aditya Narayan</b></sub></a>
        </td>  
     
  <td align="center"><a href="https://github.com/Utsavladia"><img src="https://avatars.githubusercontent.com/u/124615886?v=4" width="120px;" alt=""/><br/><sub><b>Utsav Ladia</b></sub></a>
        </td>
   
   <td align="center"><a href="https://github.com/Nayanika1402"><img src="https://avatars.githubusercontent.com/u/132455412?v=4" width="120px;" alt=""/><br/><sub><b>Nayanika Mukherjee</b></sub></a>
        </td>
  
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
 </tr>
 </table>
 <!-- CONTRIBUTORS-TABLE-END -->
</div>


<hr>
<div>
  <h2><img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f_1f3fb/512.webp" width="35" height="35"> Support </h2>
</div>

<div>
  Don't forget to leave a star<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f31f/512.webp" width="35" height="30"> for this project!
</div> <br>

<a href="#top" style="position: fixed; bottom: 20px; right: 20px; background-color: black ; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-family: Arial; font-size: 16px;">Go to Top</a>

<!-- trigger action -->
