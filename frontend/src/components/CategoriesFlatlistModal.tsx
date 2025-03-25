import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useMemo} from 'react';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {HomeScreenCategoriesFlatlistProps} from '../type.ts';
import { BUTTON_COLOR, ON_PRIMARY_COLOR } from '../helper/Theme.ts';
import { hp } from '../helper/Metric.ts';
// Main component for the categories modal
const CategoriesFlatlistModal = ({
  bottomSheetModalRef2,
  categories,
  handleCategorySelection,
  selectCategoryList,
}: HomeScreenCategoriesFlatlistProps) => {
  // Function to render the backdrop for the bottom sheet
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

  // Define snap points for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '70%', '90%'], []);

  // Function to render each category item
  const renderItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: selectCategoryList.includes(item?.name)
              ? BUTTON_COLOR
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
    ),
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
      style={{backgroundColor: ON_PRIMARY_COLOR}}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDismissModalPress}>
            <MaterialIcons name="arrow-back" size={26} color={'black'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Category</Text>
      </View>
      <BottomSheetFlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior={'always'}
        extraData={selectCategoryList}
      />
    </BottomSheetModal>
  );
};

export default CategoriesFlatlistModal;

// Styles for the component
const styles = StyleSheet.create({
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
  headerLeft: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    left: 10,
  },
  headerButton: {
    zIndex: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1d',
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 8,
    backgroundColor: 'white',
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  item: {
    borderWidth: 0.5,
    borderRadius: 15,
    //paddingVertical: 16,
    paddingVertical: hp(1.2),
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
