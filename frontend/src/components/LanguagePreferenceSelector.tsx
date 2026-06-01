import React, {useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {INDIAN_LANGUAGES} from '../constants/languages';
import {usePreferences} from '../contexts/PreferencesContext';
import {PRIMARY_COLOR} from '../helper/Theme';

interface LanguagePreferenceSelectorProps {
  /** Optional title for the selector */
  title?: string;
  /** Optional description/help text */
  description?: string;
  /** Whether to show the component in a modal/dialog style (with header) */
  showHeader?: boolean;
  /** Callback when preferences are saved */
  onSave?: () => void;
  /** Whether to show only a subset of languages */
  maxLanguagesToSelect?: number;
}

/**
 * LanguagePreferenceSelector - Component for users to select preferred languages
 * Saves preferences to PreferencesContext which persists to secure storage
 */
export const LanguagePreferenceSelector: React.FC<LanguagePreferenceSelectorProps> = ({
  title = 'Select Preferred Languages',
  description = 'Choose the languages you want to see articles and podcasts in',
  showHeader = true,
  onSave,
  maxLanguagesToSelect,
}) => {
  const {preferredLanguages, setPreferredLanguages, isLoading} = usePreferences();

  const toggleLanguage = useCallback(
    (languageCode: string) => {
      const isSelected = preferredLanguages.includes(languageCode as any);
      let updated: string[];

      if (isSelected) {
        updated = preferredLanguages.filter(lang => lang !== languageCode);
      } else {
        // Check max limit if specified
        if (maxLanguagesToSelect && preferredLanguages.length >= maxLanguagesToSelect) {
          return; // Don't allow selecting more than max
        }
        updated = [...preferredLanguages, languageCode as any];
      }

      setPreferredLanguages(updated as any);
    },
    [preferredLanguages, setPreferredLanguages, maxLanguagesToSelect]
  );

  const selectAll = useCallback(() => {
    const allCodes = INDIAN_LANGUAGES.map(lang => lang.code as any);
    setPreferredLanguages(allCodes);
  }, [setPreferredLanguages]);

  const clearAll = useCallback(() => {
    setPreferredLanguages([]);
  }, [setPreferredLanguages]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.quickActionButton, {borderColor: PRIMARY_COLOR}]}
          onPress={selectAll}>
          <MaterialIcons name="select-all" size={16} color={PRIMARY_COLOR} />
          <Text style={[styles.quickActionText, {color: PRIMARY_COLOR}]}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, {borderColor: '#ef4444'}]}
          onPress={clearAll}>
          <MaterialIcons name="clear-all" size={16} color="#ef4444" />
          <Text style={[styles.quickActionText, {color: '#ef4444'}]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selection Grid */}
      <ScrollView
        style={styles.languagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.languagesContentContainer}>
        {INDIAN_LANGUAGES.map((language, index) => {
          const isSelected = preferredLanguages.includes(language.code);
          const isDisabled =
            maxLanguagesToSelect &&
            !isSelected &&
            preferredLanguages.length >= maxLanguagesToSelect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.languageChip,
                isSelected && styles.languageChipSelected,
                isDisabled && styles.languageChipDisabled,
              ]}
              onPress={() => toggleLanguage(language.code)}
              disabled={isDisabled}
              activeOpacity={isDisabled ? 1 : 0.7}>
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                  isDisabled && styles.checkboxDisabled,
                ]}>
                {isSelected && (
                  <MaterialIcons name="check" size={14} color="white" />
                )}
              </View>
              <Text
                style={[
                  styles.languageName,
                  isSelected && styles.languageNameSelected,
                  isDisabled && styles.languageNameDisabled,
                ]}>
                {language.name}
              </Text>
              <Text
                style={[
                  styles.languageCode,
                  isSelected && styles.languageCodeSelected,
                  isDisabled && styles.languageCodeDisabled,
                ]}>
                {language.code}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selection Summary */}
      {preferredLanguages.length > 0 && (
        <View style={styles.summaryContainer}>
          <MaterialIcons name="info" size={16} color={PRIMARY_COLOR} />
          <Text style={styles.summaryText}>
            {preferredLanguages.length} language{preferredLanguages.length > 1 ? 's' : ''}{' '}
            selected for personalized content
          </Text>
        </View>
      )}

      {/* Save Button (if callback provided) */}
      {onSave && (
        <TouchableOpacity
          style={[styles.saveButton, preferredLanguages.length === 0 && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={preferredLanguages.length === 0}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: '#f8f9fa',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  languagesContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  languagesContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  languageChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: PRIMARY_COLOR,
  },
  languageChipDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  checkboxDisabled: {
    borderColor: '#d1d5db',
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  languageNameSelected: {
    color: PRIMARY_COLOR,
  },
  languageNameDisabled: {
    color: '#9ca3af',
  },
  languageCode: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  languageCodeSelected: {
    color: PRIMARY_COLOR,
  },
  languageCodeDisabled: {
    color: '#d1d5db',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
  },
  summaryText: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: '500',
    flex: 1,
  },
  saveButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default LanguagePreferenceSelector;
