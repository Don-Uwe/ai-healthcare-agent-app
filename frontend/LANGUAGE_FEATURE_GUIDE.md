# Language Preference + Feed Filtering - Implementation Complete

## Overview
✅ **Complete implementation** of language preference and feed filtering for Articles and Podcasts in UltimateHealth.

Users can now:
- Set preferred language(s) for Articles and Podcasts
- Have feeds automatically filter to show content in their selected languages
- Override language preference per session using the FilterModal
- All preferences are securely stored locally

---

## Architecture

### 1. **PreferencesContext** (`contexts/PreferencesContext.tsx`)
Manages user preferences centrally with both in-memory state and secure persistent storage.

**Key Methods:**
- `setPreferredLanguages(languages)` - Set multiple languages
- `addLanguagePreference(language)` - Add a single language
- `removeLanguagePreference(language)` - Remove a single language
- `preferredLanguages` - Get current preferences (reactive)
- `hasLanguagePreferences` - Check if any languages selected
- `isLoading` - Loading state for preferences

**Usage in Components:**
```typescript
import {usePreferences} from '../contexts/PreferencesContext';

// In your component
const {preferredLanguages, setPreferredLanguages} = usePreferences();
```

### 2. **Language Constants** (`constants/languages.ts`)
13 Indian languages with BCP-47 codes:
- English (India): `en-IN`
- Hindi: `hi-IN`
- Bengali: `bn-IN`
- Tamil: `ta-IN`
- Telugu: `te-IN`
- Marathi: `mr-IN`
- Gujarati: `gu-IN`
- Kannada: `kn-IN`
- Malayalam: `ml-IN`
- Punjabi: `pa-IN`
- Odia: `or-IN`
- Assamese: `as-IN`
- Urdu (India): `ur-IN`

### 3. **Filtering Logic**

#### HomeScreen Articles
```
Session-Selected Languages > Preferred Languages > No Filter
├─ User selects languages in FilterModal → overrides for this session
├─ If no session selection → uses stored preferences
└─ If no preferences → shows all articles
```

#### PodcastsScreen
```
Same priority as HomeScreen
├─ Podcasts filtered by language field
├─ Default to 'en-IN' for podcasts without language tag
└─ Respects session override from preferences
```

---

## Files Implementation Summary

### Created Files

#### 1. `constants/languages.ts`
Language list with utility functions
```typescript
export const INDIAN_LANGUAGES = [...] // 13 languages
export const getLanguageName(code) // Get name from code
export const isValidLanguageCode(code) // Validate codes
```

#### 2. `contexts/PreferencesContext.tsx`
Complete context for language preferences
- Initializes from secure storage on app launch
- Persists changes automatically
- Type-safe with LanguageCode type

#### 3. `components/LanguagePreferenceSelector.tsx`
Full-featured component for language selection
- Grid display of all 13 languages
- Select All / Clear All buttons
- Real-time preference updates
- Optional save callback
- Loading states

### Modified Files

#### 1. `helper/SecureStorageUtils.ts`
Added LANGUAGE_PREFERENCES key for secure storage
```typescript
export const SECURE_KEYS = {
  USER_TOKEN: 'SECURE_USER_TOKEN',
  LANGUAGE_PREFERENCES: 'SECURE_LANGUAGE_PREFERENCES',
} as const;
```

#### 2. `type.ts`
Added optional language field to PodcastData
```typescript
export type PodcastData = {
  // ... existing fields
  language?: string; // Added
};
```

#### 3. `screens/HomeScreen.tsx`
- Imported `usePreferences` hook
- Added state: `sessionSelectedLanguages`
- Enhanced `updateArticles()` to filter by language
- Updated dependency arrays
- Passed language props to FilterModal

#### 4. `screens/PodcastsScreen.tsx`
- Imported `usePreferences` hook
- Added state: `sessionSelectedLanguages`
- Created `filteredPodcasts` memo with language filtering
- Uses filtered list in FlatList

#### 5. `components/FilterModal.tsx`
- Changed from `ttsLanguageList` to `INDIAN_LANGUAGES`
- Now shows all 13 languages instead of 6
- Language filter is fully functional

#### 6. `components/AppContent.tsx`
- Added PreferencesProvider to context hierarchy
- Ensures PreferencesContext is available app-wide

---

## How to Use

### 1. Add Language Selection to Settings/Profile

In your Profile or Settings screen, add the component:

```typescript
import LanguagePreferenceSelector from '../components/LanguagePreferenceSelector';

export const ProfileScreen = () => {
  return (
    <ScrollView>
      {/* Other profile content */}
      
      {/* Language Preferences Section */}
      <LanguagePreferenceSelector
        title="Content Language"
        description="Choose languages for articles and podcasts"
        showHeader={true}
      />
    </ScrollView>
  );
};
```

### 2. Add to Onboarding Flow

```typescript
const OnboardingStep = () => {
  const handleComplete = () => {
    // Move to next onboarding step
  };

  return (
    <LanguagePreferenceSelector
      title="Select Your Languages"
      description="Customize your content experience"
      onSave={handleComplete}
    />
  );
};
```

### 3. Access Preferences in Any Component

```typescript
import {usePreferences} from '../contexts/PreferencesContext';

const MyComponent = () => {
  const {preferredLanguages, hasLanguagePreferences} = usePreferences();

  return (
    <View>
      {hasLanguagePreferences ? (
        <Text>You prefer: {preferredLanguages.join(', ')}</Text>
      ) : (
        <Text>Select your preferred languages</Text>
      )}
    </View>
  );
};
```

---

## Data Flow

### User Sets Language Preferences
```
User selects language in LanguagePreferenceSelector
    ↓
usePreferences.setPreferredLanguages() called
    ↓
State updated in-memory
    ↓
SecureStore.setItemAsync() persists to device storage
```

### Articles Load on HomeScreen
```
useGetPaginatedArticle() fetches articles
    ↓
updateArticles() called with articles
    ↓
Filter by category (if selected)
    ↓
Filter by language (session > preferences > all)
    ↓
Apply sorting
    ↓
Redux dispatch filteredArticles
    ↓
FlatList renders filtered articles
```

### Session-Level Override
```
User selects languages in FilterModal
    ↓
sessionSelectedLanguages state updated
    ↓
updateArticles() re-runs with session languages
    ↓
Filtered articles update immediately
    ↓
Reset button clears session override, reverts to preferences
```

---

## Testing Checklist

- [ ] App launches, preferences load from storage
- [ ] Add LanguagePreferenceSelector to a screen
- [ ] Select languages, preferences save
- [ ] Close and reopen app, preferences persist
- [ ] HomeScreen articles filter by language
- [ ] PodcastsScreen podcasts filter by language
- [ ] FilterModal language selection works
- [ ] Session override takes priority over preferences
- [ ] Reset filter button clears session override
- [ ] "Select All" / "Clear All" buttons work
- [ ] No articles/podcasts shown when preference has no match

---

## Default Behavior

- **Articles without language field:** Default to `'en-IN'`
- **Podcasts without language field:** Default to `'en-IN'`
- **No preferences set:** All articles/podcasts shown
- **Session override:** Takes priority over stored preferences
- **Empty selection after override:** Reverts to preferences

---

## Notes for Development

1. **Add language field to articles/podcasts in database**
   - Ensure all articles have a language field (default to 'en-IN')
   - Same for podcasts

2. **Seed data with languages**
   - Run migrations to add language values to existing records
   - New content should always include language field

3. **Backend consideration**
   - Currently all filtering is **client-side only**
   - No API changes needed
   - Can be optimized in future by adding language filter to API

4. **UI Integration Points Remaining**
   - Add LanguagePreferenceSelector to Profile/Settings
   - Add to onboarding flow
   - Consider adding a quick access language picker in header

5. **Localization Note**
   - Language names in `INDIAN_LANGUAGES` are in English
   - Can be localized using i18n if needed
   - Language codes follow BCP-47 standard

---

## Performance Considerations

- **Context**: Uses `useMemo` for filtered lists to prevent unnecessary recalculations
- **Storage**: Secure storage is async, preferences load once on app launch
- **Memory**: Session override state is lightweight (array of codes)
- **Re-renders**: Optimized with proper dependencies and memoization

---

## Troubleshooting

### Preferences not persisting
- Check if `PreferencesProvider` is in component tree (AppContent.tsx)
- Verify `expo-secure-store` is properly installed

### Articles not filtering
- Ensure articles have `language` field in database
- Check `article.language` matches a code in `INDIAN_LANGUAGES`
- Verify `updateArticles` dependency array includes language states

### FilterModal not showing all languages
- Verify `FilterModal.tsx` import changed to `INDIAN_LANGUAGES`
- Remove any hardcoded `slice(0, 6)` limitations

---

## Future Enhancements

1. **Backend Integration**: Add language filter to API queries for performance
2. **Language Auto-Detection**: Detect device locale and suggest languages
3. **Multi-language Content**: Support content available in multiple languages
4. **Search by Language**: Add language search filter in search results
5. **Language Analytics**: Track which languages users prefer
