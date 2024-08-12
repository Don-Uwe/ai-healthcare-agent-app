import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Text, StyleSheet, View, TextInput, FlatList} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CategoriesFlatlistModal from './CategoriesFlatlistModal';
import {PRIMARY_COLOR} from '../helper/Theme';
import {HomeScreenFilterModalProps} from '../type';

// Helper function to format date as DD/MM/YYYY
const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Main component
const FilterModal = ({
  bottomSheetModalRef,
  categories,
  handleCategorySelection,
  selectCategoryList,
  handleFilterReset,
  handleFilterApply,
  setDate,
  date,
}: HomeScreenFilterModalProps) => {
  // Ref for second bottom sheet modal (category selection)
  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);

  // Function to present the second bottom sheet modal
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef2.current?.present();
  }, []);

  // State for date picker visibility
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Show date picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Hide date picker
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Handle date selection from date picker
  const handleConfirm = (date: Date) => {
    const formattedDate = formatDate(date);
    setDate(formattedDate);
    hideDatePicker();
  };

  // Get safe area insets for top margin adjustment
  const insets = useSafeAreaInsets();

  // Define snap points for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '60%', '80%'], []);

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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      backdropComponent={renderBackdrop}
      snapPoints={snapPoints}
      stackBehavior="push"
      style={{zIndex: -1, marginTop: insets.top}}>
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismissModalPress}>
              <MaterialIcons name="close" size={26} color={'black'} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Filter</Text>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Date</Text>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            <TouchableOpacity
              onPress={showDatePicker}
              touchSoundDisabled={true}
              activeOpacity={1}>
              <View style={styles.datePickerContainer}>
                <TextInput
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  editable={false}
                  value={date}
                />
                <View style={styles.calendarIcon}>
                  <MaterialIcons
                    name="calendar-today"
                    size={24}
                    color={'black'}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={handlePresentModalPress}>
              <Text style={styles.inputLabel}>Category</Text>
              <MaterialIcons name="chevron-right" color={'black'} size={26} />
            </TouchableOpacity>
            <View style={styles.categoryListContainer}>
              <FlatList
                horizontal={true}
                data={selectCategoryList}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    key={item}
                    onPress={() => {
                      handleCategorySelection(item);
                    }}>
                    <Text style={styles.categoryItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                contentInsetAdjustmentBehavior={'always'}
                extraData={selectCategoryList}
              />
            </View>
            <CategoriesFlatlistModal
              bottomSheetModalRef2={bottomSheetModalRef2}
              categories={categories}
              handleCategorySelection={handleCategorySelection}
              selectCategoryList={selectCategoryList}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerButtonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleFilterReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerButtonContainer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleFilterApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default FilterModal;

// Styles for the component
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1d',
    textAlign: 'center',
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  headerRight: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    left: 10,
  },
  closeButton: {
    zIndex: 12,
  },
  filterContainer: {
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 16,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 44,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 0.5,
    borderColor: '#DDDDE3',
    width: '100%',
  },
  datePickerContainer: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  calendarIcon: {
    position: 'absolute',
    right: 10,
    borderLeftWidth: 0.5,
    paddingLeft: 5,
    borderColor: '#DDDDE3',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryList: {
    marginTop: 10,
  },
  categoryItem: {
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 5,
  },
  categoryItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 12,
    gap: 5,
    marginBottom: 10,
  },
  footerButtonContainer: {
    flex: 1,
  },
  resetButton: {
    padding: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  resetButtonText: {
    color: PRIMARY_COLOR,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 100,
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
});
