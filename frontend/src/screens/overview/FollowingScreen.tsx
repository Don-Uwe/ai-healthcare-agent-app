import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import {FollowingScreenProps} from '../../type';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {GET_STORAGE_DATA} from '../../helper/APIUtils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

export default function FollowingScreen({
  navigation,
  route,
}: FollowingScreenProps) {
  const insets = useSafeAreaInsets();
  const followings = route.params.followings;
  const {user_id} = useSelector((state: any) => state.user);

  return (
    <View style={styles.container}>
      {followings.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.message}>No following user found</Text>
        </View>
      )}
      {followings.map((follower, index) => (
        <View
          key={index}
          style={[
            styles.footer,
            {
              paddingBottom:
                Platform.OS === 'ios' ? insets.bottom : insets.bottom + 20,
            },
          ]}>
          <View style={styles.authorContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('UserProfileScreen', {
                  authorId: follower._id,
                  author_handle: undefined,
                });
              }}>
              {follower.Profile_image && follower.Profile_image !== '' ? (
                <Image
                  source={{
                    uri: follower.Profile_image.startsWith('http')
                      ? follower.Profile_image
                      : `${GET_STORAGE_DATA}/${follower.Profile_image}`,
                  }}
                  style={styles.authorImage}
                />
              ) : (
                <Image
                  source={{
                    uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
                  }}
                  style={styles.authorImage}
                />
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.authorName}>
                {follower ? follower?.user_name : ''}
              </Text>
              <Text style={styles.authorFollowers}>
                {follower.followers
                  ? follower.followers.length > 1
                    ? `${follower.followers.length} followers`
                    : `${follower.followers.length} follower`
                  : '0 follower'}
              </Text>
            </View>
          </View>

          {/**
             *
             * {follower && user_id !== follower._id && (
            <>
              {updateFollowMutation.isPending && authorId === follower._id ? (
                <ActivityIndicator size={40} color={PRIMARY_COLOR} />
              ) : (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => {
                    handleFollow(follower._id);
                  }}>
                  <Text style={styles.followButtonText}>
                    {follower.followers && follower.followers.includes(user_id)
                      ? 'Following'
                      : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
             */}

          {follower &&
            user_id !== follower._id &&
            follower.followers &&
            follower.followers.includes(user_id) && (
              <Pressable style={styles.followButton}>
                <Text style={styles.followButtonText}>Following</Text>
              </Pressable>
            )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: ON_PRIMARY_COLOR,
    position: 'relative',
    bottom: 0,
    zIndex: 10,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorImage: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 15,
  },
  authorFollowers: {
    fontWeight: '400',
    fontSize: 13,
  },
  followButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 10,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
