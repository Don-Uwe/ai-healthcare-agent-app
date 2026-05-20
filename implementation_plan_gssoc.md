# UltimateHealth Mobile App: 30 Granular GSSoC '26 Issues

This document outlines 30 granular, beginner-to-intermediate level GitHub issues tailored for GirlScript Summer of Code (GSSoC) 2026. These tasks are based on the React Native (Expo) architecture, utilizing Tamagui, Redux, and existing features like Podcasts, Articles, and the newly implemented Guest Mode.

## User Review Required
> [!IMPORTANT]
> Please review the categories and issue scopes below. Let me know if you would like me to increase the difficulty of these issues, focus more heavily on a specific module (e.g., Chatbot or Podcasts), or format these as ready-to-copy GitHub Issue Templates.

## Proposed Changes (GSSoC Issue Roadmap)

### Phase 1: Guest Mode & Onboarding Polish
1. **[Guest Mode]** Add Lottie animations to `GuestPlaceholderScreen.tsx` instead of static icons to make the prompt more engaging.
2. **[Auth]** Build a sleek "Why Join Us?" benefits modal that triggers from the `GuestPlaceholderScreen.tsx`.
3. **[Routing]** Implement deep linking handling to direct unauthenticated users to the Login/Guest flow seamlessly.
4. **[State]** Fix potential guest redirect loops on token expiry by correctly intercepting 401s and switching `isGuest` to true.
5. **[Performance]** Optimize `SplashScreen.tsx` to pre-load heavy fonts and assets faster for immediate guest entry.

### Phase 2: Podcast Module Enhancements
6. **[Podcasts]** Add playback speed controls (1x, 1.5x, 2x) in `PodcastPlayer.tsx`.
7. **[Podcasts]** Implement an animated audio visualizer waveform UI in `PodcastPlayer.tsx`.
8. **[Podcasts]** Enable background audio playback support using `expo-av` configurations.
9. **[UI/UX]** Create a skeleton loader (shimmer effect) for the `PodcastSearch.tsx` results.
10. **[Offline]** Implement robust local storage caching for `OfflinePodcastList.tsx` using AsyncStorage or MMKV.
11. **[Social]** Add "Share Podcast" functionality leveraging the React Native Share API in `PodcastDetail.tsx`.
12. **[UI/UX]** Build engaging empty-state UI designs for `PodcastDiscussion.tsx` (when no discussions exist yet).

### Phase 3: Article & Engagement Features
13. **[Articles]** Implement a reading progress bar (sticky at the top) in the Article Detail screen.
14. **[Accessibility]** Add font-size adjustment controls (A-, A+) in the Article reading view.
15. **[Articles]** Implement the UI for a "Save for later" bookmark feature in the article feed.
16. **[UI/UX]** Create modern shimmer loading effects for the `HomeScreen.tsx` paginated article feeds.
17. **[UX]** Add pull-to-refresh (`RefreshControl`) functionality in `HomeScreen.tsx` to fetch the latest articles.
18. **[Bug Fix]** Resolve `KeyboardAvoidingView` overlapping issues in `CommentScreen.tsx` on smaller iOS/Android devices.

### Phase 4: User Profile & Gamification
19. **[Profile]** Design and integrate Contribution Badges (e.g., Bronze, Silver, Gold) UI in `UserProfileScreen.tsx`.
20. **[Profile]** Integrate an image cropper library for avatar uploads in `ProfileEditScreen.tsx`.
21. **[Gamification]** Build a "Reading/Listening Streak" counter component for daily active users.
22. **[Settings]** Implement a smooth animated transition for the Dark/Light mode toggle switch in `ProfileScreen.tsx`.
23. **[Social]** Add GitHub/Twitter profile linking UI fields in `SocialScreen.tsx`.
24. **[Settings]** Implement granular toggle switches for specific push notification categories in `NotificationPreferencesScreen.tsx`.

### Phase 5: Testing, Tech Debt, & Performance
25. **[Testing]** Setup Jest unit tests for `UserSlice.ts` (specifically testing `isGuest` logic vs authenticated state).
26. **[Testing]** Write React Native Testing Library tests for the `PodcastDetail.tsx` rendering logic.
27. **[Tech Debt]** Audit and replace all hardcoded HEX colors with Tamagui theme variables across the `screens/auth` directory.
28. **[Performance]** Fix memory leaks in `ChatbotScreen.tsx` by properly clearing intervals/timeouts on component unmount.
29. **[Performance]** Migrate large list rendering from `FlatList` to Shopify's `FlashList` in `HomeScreen.tsx` for 60fps scrolling.
30. **[Tech Debt]** Audit and remove unused dependencies from `package.json` to reduce the Expo bundle size.

## Verification Plan
### Manual Verification
- Await user approval on the scope and distribution of these 30 issues across the mobile app modules.
- Once approved, these issues can be converted into GitHub Issue markdown templates for easy deployment.
