import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import React from 'react';
import EllipseSvg from '../../assets/svg/EllipseSvg';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {fp, hp, wp} from '../helper/Metric';
import {ProfileHeaderProps} from '../type';

import {GET_STORAGE_DATA} from '../helper/APIUtils';

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
  articlesPosted,
  onFollowClick,
  onOverviewClick,
  improvementPublished,
}: ProfileHeaderProps) => {
  const handleCall = phone => {
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
      phoneNumber = `telprompt:+91 ${phone}`;
    } else {
      phoneNumber = `tel:+91 ${phone}`;
    }
    Linking.openURL(phoneNumber).catch(() => Alert.alert('Unable to phone!'));
  };
  const handleMail = mail => {
    Linking.openURL(`mailto: ${mail}`).catch(() =>
      Alert.alert('Unable to open mail!'),
    );
  };
  return (
    <View style={styles.container}>
      <EllipseSvg style={styles.ellipseSvg} />
      <View style={styles.contentContainer}>
        <Image
          source={{
            uri: profileImg.startsWith('https')
              ? profileImg
              : `${GET_STORAGE_DATA}/${profileImg}`,
          }}
          style={[
            styles.profileImage,
            !profileImg && {borderWidth: 0.5, borderColor: 'black'},
          ]}
        />
        <Text style={styles.nameText}>{username}</Text>
        <Text style={[styles.usernameText, {color: PRIMARY_COLOR}]}>
          {userhandle}
        </Text>
        {isDoctor && (
          <View style={styles.experienceContainer}>
            <FontAwesome name="stethoscope" size={hp(3.5)} color="black" />
            <Text style={styles.experienceText}>{experience} years</Text>
          </View>
        )}
        {isDoctor ? (
          <View style={styles.contactContainer}>
            <TouchableOpacity
              onPress={() => {
                handleCall(userPhoneNumber);
              }}
              style={[styles.iconButton, {backgroundColor: PRIMARY_COLOR}]}>
              <MaterialIcons name="phone-in-talk" size={25} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleMail(userEmailID);
              }}
              style={[styles.iconButton, {backgroundColor: PRIMARY_COLOR}]}>
              <MaterialIcons name="email" size={25} color="white" />
            </TouchableOpacity>
            {other && (
              <TouchableOpacity
                style={[styles.iconButton, {backgroundColor: PRIMARY_COLOR}]}
                onPress={() => {
                  navigation.navigate('ProfileEditScreen');
                }}>
                <Feather name="edit-3" size={25} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ) : other ? (
          // <TouchableOpacity
          //   style={styles.editProfileButton}
          //   onPress={() => {
          //     navigation.navigate('ProfileEditScreen');
          //   }}>
          //   <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          // </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ProfileEditScreen');
            }}>
            <View style={styles.btnSM}>
              <MaterialIcons name="edit" size={20} color="black" />
              <Text style={styles.btnSMText}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onFollowClick}>
            <View
              style={{
                ...styles.btnSM,
                backgroundColor: isFollowing ? PRIMARY_COLOR : '#fff',
              }}>
              <MaterialIcons
                name="person"
                size={20}
                color={isFollowing ? '#fff' : 'black'}
              />
              <Text
                style={{
                  ...styles.btnSMText,
                  color: isFollowing ? '#fff' : 'black',
                }}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onOverviewClick}>
          {other && (
            <View style={styles.btnSM}>
              <MaterialCommunityIcon
                name="view-dashboard"
                size={20}
                color="black"
              />
              <Text style={styles.btnSMText}>Your Workspace</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('LogoutScreen', {
              profile_image: profileImg,
              username: username,
            });
          }}>
          {other && (
            <View style={styles.btnSM}>
              <MaterialIcons name="logout" size={20} color="black" />
              <Text style={styles.btnSMText}>Logout</Text>
            </View>
          )}
        </TouchableOpacity>

        {isDoctor && (
          <View style={styles.infoContainer}>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoText, {color: PRIMARY_COLOR}]}>
                {specialization}
              </Text>
              <Text style={styles.infoLabel}>Specialization</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={[styles.infoText, {color: PRIMARY_COLOR}]}>
                {qualification}
              </Text>
              <Text style={styles.infoLabel}>Qualification</Text>
            </View>
          </View>
        )}
        <View style={styles.infoContainer}>
          <TouchableOpacity onPress={onFollowerPress} style={styles.infoBlock}>
            <Text style={[styles.infoText, {color: PRIMARY_COLOR}]}>
              {followers}
            </Text>
            <Text style={styles.infoLabel}>
              {followers > 1 ? 'Followers' : 'Follower'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onFollowingPress} style={styles.infoBlock}>
            <Text style={[styles.infoText, {color: PRIMARY_COLOR}]}>
              {followings}
            </Text>
            <Text style={styles.infoLabel}>
              {followings > 1 ? 'Followings' : 'Following'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <TouchableOpacity style={styles.infoBlock}>
            <Text style={[styles.infoText2, {color: PRIMARY_COLOR}]}>
              {improvementPublished > 1
                ? `${improvementPublished} Improvements`
                : `${improvementPublished} Improvement`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoBlock}>
            <Text style={[styles.infoText2, {color: PRIMARY_COLOR}]}>
              {articlesPosted > 1
                ? `${articlesPosted} Articles`
                : `${articlesPosted} Article`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    //marginBottom: 20,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  ellipseSvg: {
    position: 'absolute',
    top: -1,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(5),
    // backgroundColor: ON_PRIMARY_COLOR
  },
  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
  },
  nameText: {
    fontSize: fp(6),
    fontWeight: 'bold',
    color: 'black',
  },
  usernameText: {
    fontSize: fp(4),
    fontWeight: 'regular',
    marginTop: 1,
  },
  experienceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: 'medium',
    color: 'black',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 10,
  },
  iconButton: {
    height: 50,
    width: 50,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editProfileButton: {
    borderWidth: 0.5,
    width: wp(70),
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 5,
    marginVertical: 10,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: 'semibold',
  },
  infoContainer: {
    width: wp(100),
    flexDirection: 'row',
    //numRows: 2,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  infoBlock: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoText2: {
    fontSize: 19,
    fontWeight: '600',
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: 'regular',
    color: 'black',
  },
  btnSM: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    marginVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    width: wp(70),
    gap: 10,
  },
  btnSMText: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '600',
    color: '#374151',
  },
});
