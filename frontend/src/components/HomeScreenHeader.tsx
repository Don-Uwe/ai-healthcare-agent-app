import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {fp, wp} from '../helper/Metric';
import {PRIMARY_COLOR} from '../helper/Theme';
import {HomeScreenHeaderProps} from '../type';

const HomeScreenHeader = ({
  handlePresentModalPress,
  onTextInputChange,
}: HomeScreenHeaderProps) => {
  return (
    <View style={[styles.header]}>
      <View>
        <View style={styles.headerTitleContainer}>
          {/* header title */}
          <Text style={styles.headerTitle}>Discover</Text>
          {/* header subtitle */}
          <Text style={styles.headerSubtitle}>
            Retrieve the health data, Provide your valuable insights
          </Text>
        </View>
        <View style={styles.search}>
          <View style={styles.searchIcon}>
            <FeatherIcon color="#778599" name="search" size={20} />
          </View>
          <TextInput
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Search articles..."
            placeholderTextColor="#778599"
            onChangeText={onTextInputChange}
            style={styles.searchControl}
          />
          <TouchableOpacity
            style={styles.filterIcon}
            onPress={handlePresentModalPress}>
            <Ionicon color="black" name="filter-sharp" size={28} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreenHeader;

const styles = StyleSheet.create({
  // header
  header: {
    width: '100%',
    flex: 0,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',

    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitleContainer: {
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: fp(8),
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Lobster-Regular',
  },
  headerSubtitle: {
    fontSize: fp(3),
    fontWeight: '400',
    marginVertical: 5,
    color: 'white',
    fontFamily: 'monospace',
  },
  search: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  filterIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 2,
    width: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  searchControl: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingLeft: wp(9),
    paddingRight: wp(9),
    width: '100%',
    fontSize: fp(4),
    fontWeight: '500',
    fontFamily: 'Lobster-regular',
  },
});
