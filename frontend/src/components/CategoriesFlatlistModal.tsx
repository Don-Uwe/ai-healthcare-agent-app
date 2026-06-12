import {StyleSheet, Text, View, TextInput} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import AccessibleTouchable from './common/AccessibleTouchable';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {HomeScreenCategoriesFlatlistProps, Category} from '../type';

import {PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';


const CategoriesFlatlistModal = ({
  bottomSheetModalRef2,
  categories,
  handleCategorySelection,
  selectCategoryList,
}: HomeScreenCategoriesFlatlistProps) => {
  const SEARCH_DEBOUNCE_DELAY = 300; // ms
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
      />
    ),
    [],
  );

  // Define snap points for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '75%', '95%'], []);

  // Debounce search input to avoid filtering categories on every keystroke
  useEffect(() => {

    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return categories;
    return categories.filter(cat =>
      cat && cat.name && typeof cat.name === 'string' &&
      cat.name.toLowerCase().includes((debouncedSearchQuery || '').toLowerCase())
    );
  }, [categories, debouncedSearchQuery]);

  // Memoize selected category identifiers for constant-time lookup during item rendering
  const selectCategoryKeys = useMemo(() => {

    const keys = new Set<string>();

    selectCategoryList.forEach((category) => {
      if(category.id !== undefined){
        keys.add(`id:${category.id}`);
      }

      if(category._id !== undefined){
        keys.add(`_id:${category._id}`);
      }

      if(category.name !== undefined){
        keys.add(`name:${category.name}`);
      }
    });

    return keys;
  }, [selectCategoryList]);

  // Function to render each category item
  const renderItem = useCallback(
    ({item}: {item: Category}) => {

      const isSelected = 
        (item?.id !== undefined && selectCategoryKeys.has(`id:${item.id}`)) ||
        (item?._id !== undefined && selectCategoryKeys.has(`_id:${item._id}`)) ||
        (item?.name !== undefined && selectCategoryKeys.has(`name:${item.name}`));

      return (
        <AccessibleTouchable
          accessibilityLabel={item.name}
          accessibilityHint="Selects this category"
          style={[
            styles.item,
            isSelected && {
              backgroundColor: '#EEF2FF',
              borderColor: PRIMARY_COLOR,
            },
          ]}
          onPress={() => {
            handleCategorySelection(item);
          }}>
          <Text
            style={[
              styles.itemText,
              isSelected && {
                color: PRIMARY_COLOR,
                fontWeight: '600',
              },
            ]}>
            {item?.name}
          </Text>
          {isSelected && (
            <MaterialIcons name="check-circle" size={22} color={PRIMARY_COLOR} />
          )}
        </AccessibleTouchable>
      );
    },
    [handleCategorySelection, selectCategoryList],
  );

  // Function to close the bottom sheet modal
  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef2.current?.close();
  }, [bottomSheetModalRef2]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef2}
      snapPoints={snapPoints}
      index={1}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      style={{backgroundColor: 'white'}}>
      <View style={styles.header}>
        <AccessibleTouchable
          accessibilityLabel="Close categories"
          accessibilityHint="Closes category selection modal"
          style={styles.headerButton}
          onPress={handleDismissModalPress}>
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </AccessibleTouchable>
        <Text style={styles.title}>All Categories</Text>
        <View style={{width: 24}} />
      </View>

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
          <AccessibleTouchable
            accessibilityLabel="Clear search"
            accessibilityHint="Clears category search text"
            onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#9ca3af" />
          </AccessibleTouchable>
        )}
      </View>

      {filteredCategories.length === 0 ? (
        <View style={styles.noResults}>
          <MaterialIcons name="search-off" size={48} color="#9ca3af" />
          <Text style={styles.noResultsText}>No categories found</Text>
          <Text style={styles.noResultsSubText}>Try a different search term</Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={filteredCategories}
          keyExtractor={(item: Category) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
          contentInsetAdjustmentBehavior={'always'}
          extraData={selectCategoryList}
        />
      )}
    </BottomSheetModal>
  );
};

export default CategoriesFlatlistModal;

// Styles for the component
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginVertical: 16,
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
  contentContainer: {
    paddingTop: 8,
    backgroundColor: 'white',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  item: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: hp(1.4),
    paddingHorizontal: 16,
    marginBottom: 10,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
