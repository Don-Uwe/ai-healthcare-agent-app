import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Text, StyleSheet, View, FlatList, ScrollView} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CategoriesFlatlistModal from './CategoriesFlatlistModal';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {HomeScreenFilterModalProps} from '../type';
import {hp} from '../helper/Metric';

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
}: HomeScreenFilterModalProps) => {
  // Ref for second bottom sheet modal (category selection)
  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);

  const sortBy = ['recent', 'popular', 'oldest'];
  const [selectedCategory, setSelectedCategory] = useState('');
  // Function to present the second bottom sheet modal
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef2.current?.present();
  }, []);

  /*
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
    setSortingType(selectedCategory);
    hideDatePicker();
  };
  */

  // Get safe area insets for top margin adjustment
  const insets = useSafeAreaInsets();

  // Define snap points for the bottom sheet
  const snapPoints = useMemo(() => ['20%', '50%', '90%'], []);

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
          <View style={styles.footer}>
            <View style={styles.footerButtonContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory('');
                  handleFilterReset();
                  handleDismissModalPress();
                }}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerButtonContainer}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  handleFilterApply();
                  handleDismissModalPress();
                }}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Sort By</Text>
            {/**
             *  <DateTimePickerModal
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
             */}
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {sortBy?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{
                    ...styles.button,
                    backgroundColor:
                      selectedCategory === item ? PRIMARY_COLOR : 'white',
                    borderColor:
                      selectedCategory === item ? 'white' : '#808080',
                  }}
                  onPress={() => {
                    setSelectedCategory(item);
                    setSortingType(item);
                  }}>
                  <Text
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                      ...styles.labelStyle,
                      color: selectedCategory === item ? 'white' : 'black',
                    }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.input}>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={handlePresentModalPress}>
              <Text style={styles.inputLabel}>Category</Text>

              <View
                style={{justifyContent: 'flex-start', flexDirection: 'row'}}>
                <Text style={{...styles.inputLabel, fontSize: 16}}>
                  See all
                </Text>
                <MaterialIcons name="chevron-right" color={'black'} size={25} />
              </View>
            </TouchableOpacity>
            <View style={styles.categoryListContainer}>
              <FlatList
                numColumns={4}
                data={selectCategoryList}
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.categoryList}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    key={item}
                    onPress={() => {
                      handleCategorySelection(item);
                    }}>
                    <Text style={styles.categoryItemText}>{`${
                      item.length < 5 ? item : item.substring(0, 5)
                    }..`}</Text>
                  </TouchableOpacity>
                )}
                contentInsetAdjustmentBehavior={'always'}
                extraData={selectCategoryList}
              />
            </View>

            {categories.slice(0, 5).map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  {
                    backgroundColor: selectCategoryList.includes(item?.name)
                      ? PRIMARY_COLOR
                      : 'white',
                  },
                ]}
                onPress={() => {
                  handleCategorySelection(item?.name);
                }}>
                <Text
                  style={[
                    styles.itemText,
                    {
                      color: selectCategoryList.includes(item?.name)
                        ? 'white'
                        : '#1F2024',
                    },
                  ]}>
                  {item?.name}
                </Text>
                {selectCategoryList.includes(item?.name) && (
                  <MaterialIcons name="check" size={26} color={'white'} />
                )}
              </TouchableOpacity>
            ))}
            <CategoriesFlatlistModal
              bottomSheetModalRef2={bottomSheetModalRef2}
              categories={categories}
              handleCategorySelection={handleCategorySelection}
              selectCategoryList={selectCategoryList}
            />
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
    fontSize: 19,
    fontWeight: '500',
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
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: hp(2),
    backgroundColor: BUTTON_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 5,
  },
  categoryItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 6,
    gap: 9,
    marginBottom: 10,
  },
  footerButtonContainer: {
    flex: 1,
  },
  resetButton: {
    padding: 6,
    borderRadius: hp(10),
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  resetButtonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: hp(10),
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },

  button: {
    flex: 0,
    borderRadius: 8,
    marginHorizontal: hp(1),
    marginVertical: 4,
    padding: hp(1.5),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontWeight: '500',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  item: {
    borderWidth: 0.5,
    borderRadius: 15,
    paddingVertical: hp(2),
    paddingHorizontal: 15,
    marginBottom: 10,
    borderColor: '#C5C6CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'regular',
  },
});
