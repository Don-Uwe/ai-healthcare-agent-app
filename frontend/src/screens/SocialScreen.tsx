import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {SocialScreenProps} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useQueryClient} from '@tanstack/react-query';
import {useSocket} from '../../SocketContext';
import Loader from '../components/Loader';
import {useGetUserSocials} from '../hooks/useGetUserSocialCircle';
import {useUpdateFollowStatus} from '../hooks/useUpdateFollowStatus';
import Snackbar from 'react-native-snackbar';
import {GlassStyles, ProfessionalColors} from '../styles/GlassStyles';

export default function Socialcreen({navigation, route}: SocialScreenProps) {
  const insets = useSafeAreaInsets();
  //const socials = route.params.socials;
  const {type, articleId, social_user_id} = route.params;
  const socket = useSocket();
  const [userid, setUserId] = useState<string>('');
  const queryClient = useQueryClient();

  const {mutate: followMutate, isPending: followMutationPending} =
    useUpdateFollowStatus();

  const {user_id, user_handle} = useSelector(
    (state: any) => state.user,
  );

  const {
    data: socials,
    refetch,
    isLoading,
  } = useGetUserSocials({
    type: type,
    articleId: articleId,
    social_user_id: social_user_id,
  });

  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ['get-user-socials']});
    navigation.setOptions({
      headerTitle:
        type === 1 ? 'Follower' : type === 2 ? 'Followings' : 'Contributors',
      headerTitleAlign: 'center',
    });
  }, [navigation, queryClient, type]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {socials && socials.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={[GlassStyles.glassCard, {padding: 32, alignItems: 'center'}]}>
              <Text style={styles.message}>No users found</Text>
            </View>
          </View>
        )}
        {socials &&
          socials.map((follower, index) => (
            <View
              key={index}
              style={[
                styles.userCard,
                {
                  marginBottom: index === socials.length - 1
                    ? (Platform.OS === 'ios' ? insets.bottom + 20 : insets.bottom + 40)
                    : 12,
                },
              ]}>
              <View style={styles.authorContainer}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('UserProfileScreen', {
                      authorId: follower._id,
                      author_handle: undefined,
                    });
                  }}
                  activeOpacity={0.7}>
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
                <View style={styles.userInfo}>
                  <Text style={styles.authorName} numberOfLines={1}>
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
                  {followMutationPending ? (
                    <ActivityIndicator size={24} color={PRIMARY_COLOR} />
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.followButton,
                        follower.followers && follower.followers.includes(user_id)
                          ? styles.followingButton
                          : null
                      ]}
                      onPress={() => {
                        setUserId(follower._id);

                        followMutate(follower._id, {
                          onSuccess: data => {

                            if (data) {
                              socket.emit('notification', {
                                type: 'userFollow',
                                userId: userid,
                                message: {
                                  title: `${user_handle} has followed you`,
                                  body: '',
                                },
                              });
                              refetch();
                            }

                          },

                          onError: err => {
                            console.log('Update Follow mutation error', err);
                            Snackbar.show({
                              text: 'Try again!',
                              duration: Snackbar.LENGTH_SHORT,
                            });
                          },
                        });
                      }}
                      activeOpacity={0.7}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.gray50,
  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    ...GlassStyles.glassCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorImage: {
    height: 56,
    width: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: ProfessionalColors.white,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 16,
    color: ProfessionalColors.gray900,
    marginBottom: 4,
  },
  authorFollowers: {
    fontWeight: '500',
    fontSize: 13,
    color: ProfessionalColors.gray600,
  },
  followButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  followingButton: {
    backgroundColor: ProfessionalColors.gray300,
  },
  followButtonText: {
    color: ProfessionalColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    fontSize: 16,
    color: ProfessionalColors.gray600,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
