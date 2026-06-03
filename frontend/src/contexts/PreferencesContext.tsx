import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';  // ✅ ADD THIS IMPORT
import {
  secureStoreItem,
  secureRetrieveItem,
  SECURE_KEYS,
} from '../helper/SecureStorageUtils';
import { LanguageCode, isValidLanguageCode } from '../constants/languages';

interface PreferencesContextType {
  preferredLanguages: LanguageCode[];
  setPreferredLanguages: (languages: LanguageCode[]) => Promise<void>;
  addLanguagePreference: (language: LanguageCode) => Promise<void>;
  removeLanguagePreference: (language: LanguageCode) => Promise<void>;
  isLoading: boolean;
  hasLanguagePreferences: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
}

/**
 * PreferencesProvider - Manages user preferences including language preferences
 * Persists to expo-secure-store and maintains in-memory state
 */
export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({
  children,
}) => {
  const [preferredLanguages, setInternalPreferredLanguages] = useState<
    LanguageCode[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await secureRetrieveItem(
          SECURE_KEYS.LANGUAGE_PREFERENCES
        );
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as LanguageCode[];
            // Validate all languages
            const validLanguages = parsed.filter(lang =>
              isValidLanguageCode(lang)
            );
            setInternalPreferredLanguages(validLanguages);
          } catch (parseError) {
            console.error(
              '[PreferencesContext] Failed to parse stored languages:',
              parseError
            );
            setInternalPreferredLanguages([]);
          }
        }
      } catch (error) {
        console.error(
          '[PreferencesContext] Error loading preferences:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to secure storage
  const savePreferencesToStorage = useCallback(
    async (languages: LanguageCode[]): Promise<void> => {
      try {
        if (languages.length === 0) {
          // ✅ FIXED: Delete the key when preferences are cleared
          await SecureStore.deleteItemAsync(SECURE_KEYS.LANGUAGE_PREFERENCES);
          return;
        }
        await secureStoreItem(
          SECURE_KEYS.LANGUAGE_PREFERENCES,
          JSON.stringify(languages)
        );
      } catch (error) {
        console.error(
          '[PreferencesContext] Error saving preferences:',
          error
        );
      }
    },
    []
  );

  const setPreferredLanguages = useCallback(
    async (languages: LanguageCode[]): Promise<void> => {
      const validLanguages = languages.filter(lang =>
        isValidLanguageCode(lang)
      );
      setInternalPreferredLanguages(validLanguages);
      await savePreferencesToStorage(validLanguages);
    },
    [savePreferencesToStorage]
  );

  // ✅ FIXED: Refactored to avoid race conditions
  const addLanguagePreference = useCallback(
    async (language: LanguageCode): Promise<void> => {
      if (!isValidLanguageCode(language)) {
        console.warn(
          `[PreferencesContext] Invalid language code: ${language}`
        );
        return;
      }
      // Use setPreferredLanguages to avoid race conditions
      if (!preferredLanguages.includes(language)) {
        await setPreferredLanguages([...preferredLanguages, language]);
      }
    },
    [preferredLanguages, setPreferredLanguages]
  );

  // ✅ FIXED: Refactored to avoid race conditions
  const removeLanguagePreference = useCallback(
    async (language: LanguageCode): Promise<void> => {
      // Use setPreferredLanguages to avoid race conditions
      if (preferredLanguages.includes(language)) {
        await setPreferredLanguages(
          preferredLanguages.filter(lang => lang !== language)
        );
      }
    },
    [preferredLanguages, setPreferredLanguages]
  );

  const value: PreferencesContextType = {
    preferredLanguages,
    setPreferredLanguages,
    addLanguagePreference,
    removeLanguagePreference,
    isLoading,
    hasLanguagePreferences: preferredLanguages.length > 0,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

/**
 * Hook to use PreferencesContext
 * Must be called within PreferencesProvider
 */
export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error(
      'usePreferences must be used within a PreferencesProvider'
    );
  }
  return context;
};