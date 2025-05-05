import React from 'react';
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import {FollowerScreenProps, User} from '../../type';
import {GET_FOLLOWERS, GET_STORAGE_DATA} from '../../helper/APIUtils';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

export default function FollowerScreen({navigation}: FollowerScreenProps) {
  const insets = useSafeAreaInsets();
  //const followers = route.params.followers;
  const {user_id, user_token} = useSelector((state: any) => state.user);

  const {
    data: followers,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['get-user-followers'],
    queryFn: async () => {
      const response = await axios.get(GET_FOLLOWERS, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data as User[];
    },
  });
  return (
    <View style={styles.container}>
      {followers && followers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.message}>No followers found</Text>
        </View>
      )}
      {followers &&
        followers.map((follower, index) => (
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
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
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
