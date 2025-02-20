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
import AntDesign from 'react-native-vector-icons/AntDesign';
import {fp, hp, wp} from '../helper/Metric';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {HomeScreenHeaderProps} from '../type';

const HomeScreenHeader = ({
  handlePresentModalPress,
  onTextInputChange,
  onNotificationClick,
  unreadCount,
}: HomeScreenHeaderProps) => {
  // Get unread notification count api integration

  return (
    <View style={[styles.header]}>
      <View>
        <View style={styles.headerTitleContainer}>
          {/* header title */}

          {/* header subtitle */}
          <View
            style={{
              flexDirection: 'row',
              flex: 0,
              justifyContent: 'space-between',
            }}>
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
                <AntDesign color="black" name="menu-fold" size={20} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onNotificationClick}>
              <View style={{position: 'relative'}}>
                <Ionicon
                  name="notifications"
                  color={PRIMARY_COLOR}
                  size={34}
                  style={{marginTop: 7}}
                />

                {/* Red dot */}
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 2,
                      width: 15,
                      height: 15,
                      borderRadius: 8,
                      backgroundColor: 'red',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {/* Optionally show the unread count */}
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
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
    backgroundColor: ON_PRIMARY_COLOR,
    alignItems: 'center',
    marginTop: hp(2),
    justifyContent: 'center',
    paddingHorizontal: 19,
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
    //position: 'relative',
    backgroundColor: 'white',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '93%',
    borderWidth: 1,
    borderColor: PRIMARY_COLOR
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
