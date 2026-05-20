import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {SafeAreaView} from 'react-native-safe-area-context';
import Snackbar from 'react-native-snackbar';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {fp, hp, wp} from '../helper/Metric';
import {Category, NotificationPreferencesScreenProp} from '../type';
import {useGetCategories} from '../hooks/useGetArticleTags';
import {useGetNotificationPreferences} from '../hooks/useGetNotificationPreferences';
import {useUpdateNotificationPreferences} from '../hooks/useUpdateNotificationPreferences';
import LoadingSpinner from '../components/LoadingSpinner';

const NotificationPreferencesScreen = ({
  navigation,
}: NotificationPreferencesScreenProp) => {
  const queryClient = useQueryClient();
  const {isConnected} = useSelector((state: any) => state.network);
  const {isGuest} = useSelector((state: any) => state.user);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch all article tags
  const {data: categories, isLoading: tagsLoading} =
    useGetCategories(isConnected);

  // Fetch the user's saved preferences
  const {data: preferencesData, isLoading: prefsLoading} =
    useGetNotificationPreferences(isConnected);

  console.log("Preference data", preferencesData);
  // Mutation to save
  const {mutate: updatePreferences, isPending: isSaving} =
    useUpdateNotificationPreferences();

  // Pre-fill selections once both data sets are ready
  useEffect(() => {
    console.log('Fetched Preferences Data:', preferencesData);
    if (preferencesData) {
      // Support both { preferences: { contentClusters: [] } } and { contentClusters: [] }
      const clusters =
        preferencesData.preferences?.contentClusters ||
        preferencesData.contentClusters;

      console.log("Clusters", clusters);

      if (Array.isArray(clusters)) {
        setSelectedIds(clusters.map(cluster => cluster._id));
      }
    }
  }, [preferencesData]);

  const toggleTag = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    if (isGuest) {
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in to save your notification preferences.',
        iconName: 'bell-cog-outline',
      });
      return;
    }

    if (!isConnected) {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    const payload = (categories ?? []).filter(cat =>
      selectedIds.includes(cat._id),
    );

    updatePreferences(
      {contentClusters: payload},
      {
        onSuccess: () => {
          console.log('Preferences saved successfully:', selectedIds);
          queryClient.invalidateQueries({
            queryKey: ['notification-preferences'],
          });
          Snackbar.show({
            text: '✓ Notification preferences saved!',
            duration: Snackbar.LENGTH_SHORT,
          });
        },
        onError: err => {
          console.error('Preferences update error:', err);
          Alert.alert(
            'Save Failed',
            'Could not update your preferences. Please try again.',
          );
        },
      },
    );
  };

  const isLoading = tagsLoading || prefsLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Header banner */}
      <View style={styles.headerBanner}>
        <MaterialCommunityIcons
          name="bell-cog-outline"
          size={30}
          color="white"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Content Interests</Text>
          <Text style={styles.headerSubtitle}>
            Choose topics to receive personalised notifications
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <LoadingSpinner text="Loading preferences..." />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Select all that apply</Text>

            <View style={styles.chipsContainer}>
              {(categories ?? []).map((tag: Category) => {
                const isSelected = selectedIds.includes(tag._id);
                return (
                  <TouchableOpacity
                    key={tag._id}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => toggleTag(tag._id)}>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color="white"
                        style={styles.chipIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Select All / Clear All */}
            <View style={styles.bulkActionsRow}>
              <TouchableOpacity
                style={styles.bulkBtn}
                onPress={() =>
                  setSelectedIds((categories ?? []).map(t => t._id))
                }>
                <Text style={styles.bulkBtnText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkBtn, styles.bulkBtnClear]}
                onPress={() => setSelectedIds([])}>
                <Text style={[styles.bulkBtnText, {color: '#6b7280'}]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              You will receive push notifications and emails for new articles
              in the topics you select.{'\n'}Health articles are always
              broadcast to everyone.
            </Text>
          </ScrollView>

          {/* Save button */}
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}>
              {isSaving ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default NotificationPreferencesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000A60',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3.5),
    gap: wp(3),
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(1),
  },
  headerTitle: {
    color: 'white',
    fontSize: fp(6),
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingTop: wp(2)
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: hp(2),
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3.5),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'white',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
    elevation: 4,
    shadowOpacity: 0.25,
  },
  chipIcon: {
    marginRight: 5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  chipTextSelected: {
    color: 'white',
  },
  bulkActionsRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(3),
  },
  bulkBtn: {
    borderRadius: 8,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'white',
  },
  bulkBtnClear: {
    borderColor: '#d1d5db',
  },
  bulkBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  helperText: {
    marginTop: hp(3),
    fontSize: 12.5,
    color: '#9ca3af',
    lineHeight: 18,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_COLOR,
    paddingLeft: wp(3),
  },
  saveContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: ON_PRIMARY_COLOR,
  },
  saveBtn: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
