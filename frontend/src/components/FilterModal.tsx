import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Text, StyleSheet, View, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CategoriesFlatlistModal from './CategoriesFlatlistModal';
import {PRIMARY_COLOR} from '../helper/Theme';
import {HomeScreenFilterModalProps} from '../type';
import {ttsLanguageList} from '../helper/Utils';

// Helper function to format date as DD/MM/YYY

// Main component
const FilterModal = ({
  bottomSheetModalRef,
  categories,
  handleCategorySelection,
  selectCategoryList,
  handleFilterReset,
  handleFilterApply,
  setSortingType,
  selectedLanguages: externalSelectedLanguages,
  setSelectedLanguages: externalSetSelectedLanguages,
}: HomeScreenFilterModalProps) => {
  // Ref for second bottom sheet modal (category selection)
  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);

  const sortBy = ['recent', 'popular', 'oldest'];
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelectedLanguages, setInternalSelectedLanguages] = useState<string[]>([]);

  // Use external state if provided, otherwise use internal state
  const selectedLanguages = externalSelectedLanguages ?? internalSelectedLanguages;
  const setSelectedLanguages = externalSetSelectedLanguages ?? setInternalSelectedLanguages;
  // Function to present the second bottom sheet modal
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef2.current?.present();
  }, []);

  // Get safe area insets for top margin adjustment
  const insets = useSafeAreaInsets();

  // Define snap points for the bottom sheet
  const snapPoints = useMemo(() => ['20%', '65%', '95%'], []);

  // Close the bottom sheet modal
  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, [bottomSheetModalRef]);

  // Render backdrop for bottom sheet
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
      />
    ),
    [],
  );

  // Shuffle array helper function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Filter and shuffle categories, showing only 2
  const filteredCategories = useMemo(() => {
    const filtered = !searchQuery.trim()
      ? categories
      : categories.filter(cat =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Shuffle and return only 2 categories
    const shuffled = shuffleArray(filtered);
    return shuffled.slice(0, 2);
  }, [categories, searchQuery]);

  // Handle language selection
  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code)
        ? prev.filter(lang => lang !== code)
        : [...prev, code]
    );
  };

  // Reset all filters
  const handleReset = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedLanguages([]);
    handleFilterReset();
    handleDismissModalPress();
  };

  return (
    <BottomSheetModal
    //style={{backgroundColor: '#ffffff'}}
      ref={bottomSheetModalRef}
      index={1}
      backdropComponent={renderBackdrop}
      snapPoints={snapPoints}
      stackBehavior="push"
      style={{
        zIndex: -1,
        marginTop: insets.top,
        marginBottom: insets.bottom,
        backgroundColor: '#ffffff',
      }}>
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters & Search</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismissModalPress}>
            <MaterialIcons name="close" size={24} color={'#6b7280'} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            {/* Search Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                <MaterialIcons name="search" size={18} color="#222" /> Search Categories
              </Text>
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search categories..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialIcons name="close" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                <MaterialIcons name="sort" size={18} color="#222" /> Sort By
              </Text>
              <View style={styles.chipContainer}>
                {sortBy.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chip,
                      selectedCategory === item && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(item);
                      setSortingType(item);
                    }}>
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory === item && styles.chipTextSelected,
                      ]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                    {selectedCategory === item && (
                      <MaterialIcons name="check-circle" size={16} color="white" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Language Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                <MaterialIcons name="language" size={18} color="#222" /> Language
              </Text>
              <View style={styles.chipContainer}>
                {ttsLanguageList.slice(0, 6).map((lang, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chip,
                      selectedLanguages.includes(lang.code) && styles.chipSelected,
                    ]}
                    onPress={() => toggleLanguage(lang.code)}>
                    <Text
                      style={[
                        styles.chipText,
                        selectedLanguages.includes(lang.code) && styles.chipTextSelected,
                      ]}>
                      {lang.name}
                    </Text>
                    {selectedLanguages.includes(lang.code) && (
                      <MaterialIcons name="check-circle" size={16} color="white" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {selectedLanguages.length > 0 && (
                <View style={styles.selectedCount}>
                  <Text style={styles.selectedCountText}>
                    {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected
                  </Text>
                </View>
              )}
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.categoryHeader}>
                <Text style={styles.sectionLabel}>
                  <MaterialIcons name="category" size={18} color="#222" /> Categories
                </Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={handlePresentModalPress}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <MaterialIcons name="chevron-right" color={PRIMARY_COLOR} size={20} />
                </TouchableOpacity>
              </View>

              {selectCategoryList.length > 0 && (
                <View style={styles.selectedCategoriesContainer}>
                  <Text style={styles.selectedCategoriesLabel}>Selected:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.selectedCategoriesChips}>
                      {selectCategoryList.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.selectedCategoryChip}
                          onPress={() => handleCategorySelection(item)}>
                          <Text style={styles.selectedCategoryChipText}>
                            {item.name}
                          </Text>
                          <MaterialIcons name="close" size={14} color="white" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              <View style={styles.categoryGrid}>
                {filteredCategories.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryCard,
                      selectCategoryList.some(i => i.id === item?.id) && styles.categoryCardSelected,
                    ]}
                    onPress={() => handleCategorySelection(item)}>
                    <Text
                      style={[
                        styles.categoryCardText,
                        selectCategoryList.some(i => i.id === item?.id) && styles.categoryCardTextSelected,
                      ]}>
                      {item?.name}
                    </Text>
                    {selectCategoryList.some(i => i.id === item?.id) && (
                      <View style={styles.checkBadge}>
                        <MaterialIcons name="check" size={14} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {searchQuery && filteredCategories.length === 0 && (
                <View style={styles.noResults}>
                  <MaterialIcons name="search-off" size={32} color="#9ca3af" />
                  <Text style={styles.noResultsText}>No categories found</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons - Fixed at bottom */}
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}>
            <MaterialIcons name="refresh" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              handleFilterApply();
              handleDismissModalPress();
            }}>
            <MaterialIcons name="check" size={20} color="white" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>

       

        <CategoriesFlatlistModal
          bottomSheetModalRef2={bottomSheetModalRef2}
          categories={categories}
          handleCategorySelection={handleCategorySelection}
          selectCategoryList={selectCategoryList}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default FilterModal;

// Styles for the component
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: 'white',
  },
  checkIcon: {
    marginLeft: 2,
  },
  selectedCount: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedCountText: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  selectedCategoriesContainer: {
    marginBottom: 12,
  },
  selectedCategoriesLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  selectedCategoriesChips: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    gap: 6,
  },
  selectedCategoryChipText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: '47%',
    flexGrow: 1,
  },
  categoryCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: PRIMARY_COLOR,
  },
  categoryCardText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  categoryCardTextSelected: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
    gap: 6,
  },
  resetButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    gap: 6,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
