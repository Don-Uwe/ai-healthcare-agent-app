# UltimateHealth — Release Notes

## v2.0.0 (March 31, 2026)

This is a **major internal + platform-level upgrade** focused on scalability, maintainability, and cleaner architecture.

---

## 🚀 What Changed

### ⚙️ Architecture Overhaul

- Added a dedicated `src/hooks/` layer
- Migrated everything to **React Query (TanStack Query)**

**Result:**
- Cleaner components (no more API clutter)
- Built-in caching + smarter data fetching
- Consistent loading & error handling
- Much easier to scale going forward

> Total: **76 custom hooks** now power the app

---

## 🧩 Hooks Breakdown

### 🔐 Auth & Access
Login, signup, OTP, token validation, session handling — all modular now.

### 👤 Profile System
Everything from profile fetch → updates → social circle is now isolated into reusable hooks.

### 📝 Articles
- Create, read, like, save, repost
- Lazy content loading
- View tracking & read analytics

### ✍️ Improvements & Reviews
- Request edits
- Suggest changes
- Review comments
- Track improvement history

### 🎙️ Podcasts
- Upload + discovery
- Search & filters
- Engagement tracking (likes, views)

### 📂 Playlists
- Create, update, and manage podcast collections

### 📊 Analytics
- Monthly / yearly read-write stats
- Total engagement metrics
- Most viewed content

### 🔔 Notifications
- Fetch + delete support

### 📤 Media Upload
- Image + audio pipelines separated cleanly

### 🚨 Moderation
- Report system with structured reasons

### 🤝 Social
- Follow / unfollow system

### 🔑 Security
- Password flows cleaned up

### 🤖 AI Layer
- Gemini integration for suggestions & content assist

---

## 🎨 UI & UX Fixes

- Fixed Android icon cropping issues
- Proper Android 13+ themed icon support
- Cleaner splash screen (light + dark mode)
- Better first impression on app launch
- Fix multiple screens accroding to feedback

---

## 📱 Platform Updates

- Version: **2.0.0**
- Android `versionCode`: **21**
- iOS bundle ID: `com.ultimatehealth.app`
- Edge-to-edge display enabled
- Improved compatibility across newer Android versions

---

## 🔐 Permissions

- No new risky permissions added
- Existing permissions cleaned up
- Better descriptions for user clarity

---

## 🌐 Deep Linking

- Articles & podcasts can be shared via links
- Domain: `uhsocial.in`

---

## 🛠️ Build & Dev Setup

- React Native New Architecture enabled
- Expo Router in use
- Typed routes enabled
- React compiler experiment on
- Firebase setup retained

---


## Known Issues
- UI fixes accross multiple screen
- Animated Loader support for different app states


## Future Roadmap
- Enhanced offline support with React Query persistence
- Additional analytics hooks
- Real-time updates using WebSocket hooks (Currently happening for feedbacks)
- Enhanced AI integration features

---

For bug reports or feature requests, please contact the development team.
