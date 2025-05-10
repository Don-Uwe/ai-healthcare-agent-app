import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SocialScreenProps, User} from './type';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from './helper/Theme';
import {FOLLOW_USER, GET_SOCIALS, GET_STORAGE_DATA} from './helper/APIUtils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import {useSocket} from '../SocketContext';

export default function Socialcreen({navigation, route}: SocialScreenProps) {
  const insets = useSafeAreaInsets();
  //const socials = route.params.socials;
  const {type, articleId} = route.params;
  const socket = useSocket();
  const [userid, setUserId] = useState<string>('');
  const queryClient = useQueryClient();
  const {user_id, user_token, user_handle, social_user_id} = useSelector(
    (state: any) => state.user,
  );

  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ['get-user-socials']});
    navigation.setOptions({
      headerTitle:
        type == 1 ? 'Follower' : type == 2 ? 'Followings' : 'Contributors',
      headerTitleAlign: 'center',
    });
  }, [navigation, type]);

  const {
    data: socials,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['get-user-socials'],
    queryFn: async () => {
      let url = articleId
        ? `${GET_SOCIALS}?type=${type}&articleId=${articleId}`
        : `${GET_SOCIALS}?type=${type}`;

      url =
        social_user_id && social_user_id !== ''
          ? `${url}&social_user_id=${social_user_id}`
          : url;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      console.log('Response', response.data.followers);
      return response.data.followers as User[];
    },
  });

  const updateFollowMutation = useMutation({
    mutationKey: ['update-follow-status'],

    mutationFn: async (userid: string) => {
      if (!user_token || user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        FOLLOW_USER,
        {
          followUserId: userid,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data.followStatus as boolean;
    },

    onSuccess: data => {
      //console.log('follow success');
      if (data) {
        socket.emit('notification', {
          type: 'userFollow',
          userId: userid,
          message: {
            title: `${user_handle} has followed you`,
            body: '',
          },
        });
      }
      refetch();
      // refetchProfile();
    },

    onError: err => {
      console.log('Update Follow mutation error', err);
      Alert.alert('Try Again!');
      //console.log('Follow Error', err);
    },
  });

  return (
    <View style={styles.container}>
      {socials && socials.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.message}>No following user found</Text>
        </View>
      )}
      {socials &&
        socials.map((follower, index) => (
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

            {follower && user_id !== follower._id && (
              <>
                {updateFollowMutation.isPending ? (
                  <ActivityIndicator size={40} color={PRIMARY_COLOR} />
                ) : (
                  <TouchableOpacity
                    style={styles.followButton}
                    onPress={() => {
                      setUserId(follower._id);
                      updateFollowMutation.mutate(follower._id);
                    }}>
                    <Text style={styles.followButtonText}>
                      {follower.followers &&
                      follower.followers.includes(user_id)
                        ? 'Following'
                        : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
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
