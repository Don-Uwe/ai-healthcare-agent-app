import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  Pressable,
  useColorScheme,
} from 'react-native';
import React from 'react';
import EllipseSvg from '../../assets/svg/EllipseSvg';
import {PRIMARY_COLOR} from '../helper/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcon from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import {RootStackParamList} from '../type';
import {NavigationProp} from '@react-navigation/native';
import {fp, hp, wp} from '../helper/Metric';
import {ProfileHeaderProps} from '../type';

import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';

const ProfileHeader = ({
  isDoctor,
  username,
  userhandle,
  profileImg,
  userPhoneNumber,
  userEmailID,
  specialization,
  experience,
  qualification,
  navigation,
  other,
  followers,
  followings,
  onFollowerPress,
  onFollowingPress,
  isFollowing,
  onFollowClick,
  onOverviewClick,
}: ProfileHeaderProps) => {
  const {isConnected} = useSelector((state: any) => state.network);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themeColors = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#111827',
    textSecondary: isDark ? '#9ca3af' : '#6b7280',
    card: isDark ? '#1f2937' : '#ffffff',
    border: isDark ? '#374151' : '#e5e7eb',
    iconBackground: isDark ? '#374151' : '#f3f4f6',
  };

  const handleCall = (phone: string | undefined) => {
    if (!phone) return;
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
      phoneNumber = `telprompt:+91 ${phone}`;
    } else {
      phoneNumber = `tel:+91 ${phone}`;
    }
    Linking.openURL(phoneNumber).catch(() => Alert.alert('Unable to phone!'));
  };

  const handleMail = (mail: string | undefined) => {
    if (!mail) return;
    Linking.openURL(`mailto: ${mail}`).catch(() =>
      Alert.alert('Unable to open mail!'),
    );
  };

  // Safe image parsing
  const getProfileImageUrl = () => {
    if (!profileImg) return undefined;
    return profileImg.startsWith('https')
      ? profileImg
      : `${GET_STORAGE_DATA}/${profileImg}`;
  };

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      <EllipseSvg style={styles.ellipseSvg} />
      <View style={styles.contentContainer}>
        {/* Profile Image & Basic Info */}
        <Image
          source={{ uri: getProfileImageUrl() }}
          style={[
            styles.profileImage,
            !profileImg && {borderWidth: 1, borderColor: themeColors.border},
            { backgroundColor: themeColors.iconBackground }
          ]}
        />
        <Text style={[styles.nameText, {color: themeColors.text}]} numberOfLines={1}>
          {username || 'Unknown User'}
        </Text>
        <Text style={[styles.usernameText, {color: PRIMARY_COLOR}]} numberOfLines={1}>
          @{userhandle || 'username'}
        </Text>
        
        {isDoctor && experience && (
          <View style={styles.experienceContainer}>
            <FontAwesome name="stethoscope" size={hp(2.5)} color={themeColors.textSecondary} />
            <Text style={[styles.experienceText, {color: themeColors.textSecondary}]}>
              {experience} years experience
            </Text>
          </View>
        )}

        {/* Primary Actions */}
        <View style={styles.primaryActionContainer}>
          {isDoctor ? (
            <View style={styles.contactContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleCall(userPhoneNumber)}
                style={[styles.iconButton, {backgroundColor: PRIMARY_COLOR}]}>
                <MaterialIcons name="phone-in-talk" size={22} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleMail(userEmailID)}
                style={[styles.iconButton, {backgroundColor: PRIMARY_COLOR}]}>
                <MaterialIcons name="email" size={22} color="#ffffff" />
              </TouchableOpacity>
              {other && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.iconButton, {backgroundColor: PRIMARY_COLOR}]}
                  onPress={() => (navigation as any).navigate('ProfileEditScreen')}>
                  <Feather name="edit-3" size={22} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          ) : other ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => (navigation as any).navigate('ProfileEditScreen')}
              style={styles.primaryBtn}
            >
              <MaterialIcons name="edit" size={20} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={onFollowClick} 
              style={[
                styles.primaryBtn, 
                { 
                  backgroundColor: isFollowing ? 'transparent' : PRIMARY_COLOR, 
                  borderWidth: isFollowing ? 1.5 : 0, 
                  borderColor: PRIMARY_COLOR 
                }
              ]}
            >
              <MaterialIcons
                name={isFollowing ? "person-outline" : "person-add"}
                size={20}
                color={isFollowing ? PRIMARY_COLOR : '#ffffff'}
              />
              <Text style={[styles.primaryBtnText, { color: isFollowing ? PRIMARY_COLOR : '#ffffff' }]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Cards */}
        {isDoctor && (
          <View style={[styles.statsCard, styles.doctorInfoCard, styles.shadowProps, {backgroundColor: themeColors.card, borderColor: themeColors.border}]}>
            <View style={styles.statItem}>
              <Text style={[styles.doctorInfoValue, {color: PRIMARY_COLOR}]} numberOfLines={2}>{specialization || 'N/A'}</Text>
              <Text style={[styles.statLabel, {color: themeColors.textSecondary}]}>Specialization</Text>
            </View>
            <View style={[styles.statDividerFull, {backgroundColor: themeColors.border}]} />
            <View style={styles.statItem}>
              <Text style={[styles.doctorInfoValue, {color: PRIMARY_COLOR}]} numberOfLines={2}>{qualification || 'N/A'}</Text>
              <Text style={[styles.statLabel, {color: themeColors.textSecondary}]}>Qualification</Text>
            </View>
          </View>
        )}

        <View style={[styles.statsCard, styles.shadowProps, {backgroundColor: themeColors.card, borderColor: themeColors.border}]}>
          <Pressable onPress={onFollowerPress} style={styles.statItem}>
            <Text style={[styles.statValue, {color: themeColors.text}]} numberOfLines={1}>{followers || 0}</Text>
            <Text style={[styles.statLabel, {color: themeColors.textSecondary}]}>
              {followers === 1 ? 'Follower' : 'Followers'}
            </Text>
          </Pressable>
          <View style={[styles.statDivider, {backgroundColor: themeColors.border}]} />
          <Pressable onPress={onFollowingPress} style={styles.statItem}>
            <Text style={[styles.statValue, {color: themeColors.text}]} numberOfLines={1}>{followings || 0}</Text>
            <Text style={[styles.statLabel, {color: themeColors.textSecondary}]}>Following</Text>
          </Pressable>
        </View>

        {/* Secondary Actions List */}
        {other && (
          <View style={styles.secondaryActionContainer}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={onOverviewClick} 
              style={[styles.listButton, {backgroundColor: themeColors.card, borderColor: themeColors.border}]}
            >
              <View style={[styles.listButtonIconBg, { backgroundColor: themeColors.iconBackground }]}>
                 <MaterialCommunityIcon name="view-dashboard" size={22} color={PRIMARY_COLOR} />
              </View>
              <Text style={[styles.listButtonText, {color: themeColors.text}]}>Your Workspace</Text>
              <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.listButton, {backgroundColor: themeColors.card, borderColor: themeColors.border}]}
              onPress={() => {
                if (isConnected) {
                  (navigation as NavigationProp<RootStackParamList>).navigate('NotificationPreferencesScreen');
                } else {
                  Snackbar.show({ text: 'Please check your internet connection!', duration: Snackbar.LENGTH_SHORT });
                }
              }}>
              <View style={[styles.listButtonIconBg, { backgroundColor: themeColors.iconBackground }]}>
                 <MaterialCommunityIcon name="bell-cog-outline" size={22} color={PRIMARY_COLOR} />
              </View>
              <Text style={[styles.listButtonText, {color: themeColors.text}]}>Notification Preferences</Text>
              <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.listButton, {backgroundColor: themeColors.card, borderColor: themeColors.border}]}
              onPress={() => {
                if (isConnected) {
                  (navigation as any).navigate('LogoutScreen', { profile_image: profileImg, username: username });
                } else {
                  Snackbar.show({ text: 'Please check your internet connection!', duration: Snackbar.LENGTH_SHORT });
                }
              }}>
              <View style={[styles.listButtonIconBg, { backgroundColor: themeColors.iconBackground }]}>
                <MaterialIcons name="logout" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.listButtonText, {color: '#EF4444'}]}>Logout</Text>
              <MaterialIcons name="chevron-right" size={24} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    paddingBottom: hp(3),
    flex: 1,
  },
  ellipseSvg: {
    position: 'absolute',
    top: -1,
    width: '100%',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2.5),
    paddingHorizontal: wp(5),
  },
  profileImage: {
    height: wp(30),
    width: wp(30),
    borderRadius: wp(15),
    resizeMode: 'cover',
    marginTop: hp(1),
  },
  nameText: {
    fontSize: fp(6),
    fontWeight: 'bold',
    marginTop: hp(1.5),
    textAlign: 'center',
  },
  usernameText: {
    fontSize: fp(4.2),
    fontWeight: '500',
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  experienceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(1),
  },
  experienceText: {
    fontSize: fp(3.8),
    fontWeight: '500',
  },
  primaryActionContainer: {
    marginVertical: hp(2.5),
    width: '100%',
    alignItems: 'center',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(5),
  },
  iconButton: {
    height: wp(13),
    width: wp(13),
    borderRadius: wp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10),
    gap: wp(2),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryBtnText: {
    fontSize: fp(4.2),
    fontWeight: '600',
  },
  statsCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: hp(1),
    borderRadius: 16,
    paddingVertical: hp(2.5),
    borderWidth: 1,
  },
  shadowProps: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(2),
  },
  statDivider: {
    width: 1,
    height: '60%',
  },
  statValue: {
    fontSize: fp(5.5),
    fontWeight: 'bold',
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  doctorInfoValue: {
    fontSize: fp(4.5),
    fontWeight: 'bold',
    marginBottom: hp(0.5),
    textAlign: 'center',
    flexShrink: 1,
  },
  doctorInfoCard: {
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    alignItems: 'stretch',
    minHeight: hp(10),
  },
  statDividerFull: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: hp(1),
  },
  statLabel: {
    fontSize: fp(3.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryActionContainer: {
    width: '100%',
    marginTop: hp(2),
    gap: hp(1.5),
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderWidth: 1,
  },
  listButtonIconBg: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.5),
  },
  listButtonText: {
    flex: 1,
    fontSize: fp(4.2),
    fontWeight: '600',
  },
});
