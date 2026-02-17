import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useEffect, useState} from 'react';
import {fp} from '../helper/Metric';
import {ArticleCardProps, ArticleData, User} from '../type';
import moment from 'moment';
import {useSelector} from 'react-redux';
import axios from 'axios';
import AntDesign from '@expo/vector-icons/AntDesign';
import IonIcons from '@expo/vector-icons/Ionicons';
import {useMutation, useQuery} from '@tanstack/react-query';
import {
  GET_ARTICLE_CONTENT,
  GET_IMAGE,
  GET_PROFILE_API,
  LIKE_ARTICLE,
  SAVE_ARTICLE,
} from '../helper/APIUtils';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {
  formatCount,
  requestStoragePermissions,
  StatusEnum,
} from '../helper/Utils';
import {
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ArticleFloatingMenu from './ArticleFloatingMenu';
//import io from 'socket.io-client';
import Entypo from '@expo/vector-icons/Entypo';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
//import {RNHTMLtoPDF} from 'react-native-html-to-pdf';
import {generatePDF} from 'react-native-html-to-pdf';
import {useSocket} from '../../SocketContext';
import EditRequestModal from './EditRequestModal';
import {FontAwesome, FontAwesome6} from '@expo/vector-icons';
import Snackbar from 'react-native-snackbar';

const ArticleCard = ({
  item,
  navigation,
  setSelectedCardId,
  success,
  handleRepostAction,
  handleReportAction,
  handleEditRequestAction,
  source,
}: ArticleCardProps) => {
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  //const socket = io('http://51.20.1.81:8084');
  const socket = useSocket();
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);
  const [requestModalVisible, setRequestModalVisible] =
    useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState(false);

  //console.log("Repost users", item.repostUsers);
  //console.log('Image Utils', item?.imageUtils[0]);
  const handleShare = async () => {
    try {
      const url =
        `https://uhsocial.in/api/share/article?articleId=${item._id}` +
        `&authorId=${item.authorId._id}` +
        `&recordId=${item.pb_recordId}`;

      const result = await Share.open({
        title: item.title,
        message: `${item.title} : Check out this awesome post on UltimateHealth app!`,
        // Most Recent APK: 0.7.4
        url: url,
        subject: 'Article Post',
      });
      console.log(result);
      setMenuVisible(false);
    } catch (error) {
      console.log('Error sharing:', error);
      Alert.alert('Error', 'Something went wrong while sharing.');
      // dispatch(
      //   showAlert({
      //     title: 'Error!',
      //     message: 'Something went wrong while sharing.',
      //   }),
      // );
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connection established');
    });
  }, [socket]);
  const {data: user} = useQuery({
    queryKey: ['get-my-profile'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data.profile as User;
    },
  });

  const updateSaveStatusMutation = useMutation({
    mutationKey: ['update-view-count'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        // dispatch(
        //   showAlert({
        //     title: 'Alert!',
        //     message: 'No token found',
        //   }),
        // );
        return;
      }
      const res = await axios.post(
        SAVE_ARTICLE,
        {
          article_id: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data as any;
    },
    onSuccess: async () => {
      success();
    },

    onError: () => {
      //console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
      // dispatch(
      //   showAlert({
      //     title: 'Server error',
      //     message: 'Try again!',
      //   }),
      // );
    },
  });

  const updateLikeMutation = useMutation({
    mutationKey: ['update-like-status'],

    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        // dispatch(
        //   showAlert({
        //     title: 'Alert!',
        //     message: 'No token found',
        //   }),
        // );
        return;
      }
      const res = await axios.post(
        LIKE_ARTICLE,
        {
          article_id: item._id,
          //user_id: user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data.data as {
        article: ArticleData;
        likeStatus: boolean;
      };
    },

    onSuccess: data => {
      //dispatch(setArticle({article: data}));

      //console.log('author', data);
      if (data?.likeStatus) {
        // data.userId, data.articleId, data.podcastId, data.articleRecordId, data.title, data.message
        socket.emit('notification', {
          type: 'likePost',
          userId: data?.article?.authorId,
          articleId: data?.article?._id,
          podcastId: null,
          articleRecordId: data?.article?.pb_recordId,
          title: user
            ? `${user?.user_handle} liked your post`
            : 'Someone liked your post',
          message: data?.article?.title,
        });
      }
      success();
    },

    onError: () => {
      Alert.alert('Try Again!');
      //console.log('Like Error', err);
      // dispatch(
      //   showAlert({
      //     title: 'Server error',
      //     message: 'Please try again',
      //   }),
      // );
    },
  });

  const onChange = () => {
   
    setMenuVisible(true);
     console.log('Menu visible',menuVisible);
  };

  const generatePDFFromUrl = async (recordId: string, title: string) => {
    try {
      const storageGranted = await requestStoragePermissions();
      if (!storageGranted) {
        Alert.alert('Storage permission denied');
        return;
      }
      if (!isConnected) {
        Snackbar.show({
          text: 'Please check your internet connection!',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }
      const response = await axios.get(`${GET_ARTICLE_CONTENT}/${recordId}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      if (response.data.htmlContent) {
        console.log('Response', response.data.htmlContent);
        const htmlContent = response.data.htmlContent;
        await generatePDFData(title, htmlContent);
        setMenuVisible(false);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Something went wrong while creating the PDF.');
      // dispatch(
      //   showAlert({
      //     title: 'Error!',
      //     message: 'Something went wrong while creating the PDF.',
      //   }),
      // );
    }
  };

  const generatePDFData = async (title: string, htmlContent: string) => {
    try {
      const safeTitle = title.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeTitle}.pdf`;

      const customDirectory =
        Platform.OS === 'android'
          ? RNFS.ExternalDirectoryPath
          : RNFS.DocumentDirectoryPath;

      const filePath = `${customDirectory}/${fileName}`;

      const directoryExists = await RNFS.exists(customDirectory);

      if (!directoryExists) {
        await RNFS.mkdir(customDirectory);
      }

      const options = {
        html: htmlContent,
        fileName: safeTitle,
        directory: '',
        base64: true,
      };

      console.log('File flow reach upto now');
      const file = await generatePDF(options);

      await RNFS.moveFile(file.filePath, filePath);
      console.log('File flow reach upto move');

      Alert.alert('PDF created successfully!', `Saved at: ${filePath}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Something went wrong while creating the PDF.');
    }
  };

  return (
    <Pressable
      onPress={() => {
        if (isConnected) {
          width.value = withTiming(0, {duration: 250});
          yValue.value = withTiming(100, {duration: 250});
          setSelectedCardId('');
          navigation.navigate('ArticleScreen', {
            articleId: Number(item._id),
            authorId: item.authorId,
            recordId: item.pb_recordId,
          });
        } else {
          Snackbar.show({
            text: 'Please connect to the internet to view this article.',
            duration: Snackbar.LENGTH_LONG,
          });
          Alert.alert(
            'No Internet 🚫',
            'Internet connection required. Offline mode will be available in the next update.',
            [{text: 'OK'}],
          );
        }
      }}>
      <View style={styles.cardContainer}>
        {/* Image Section */}
        <Image
          source={{
            uri: item?.imageUtils[0]
              ? item?.imageUtils[0].startsWith('http')
                ? item?.imageUtils[0]
                : `${GET_IMAGE}/${item?.imageUtils[0]}`
              : undefined,
          }}
          style={styles.coverImage}
        />

        <View style={styles.contentContainer}>
          {/* Share Icon */}

          {source === 'home' && item.status === StatusEnum.PUBLISHED && (
            <ArticleFloatingMenu
              items={[
                {
                  articleId: item._id,
                  name: 'Share this post',
                  action: () => {
                    handleShare();
                    //handleAnimation();
                  },
                  icon: 'share-alt',
                },
                {
                  articleId: item._id,
                  name: 'Repost in your feed',
                  action: () => {
                    handleRepostAction(item);
                    //handleAnimation();
                    setMenuVisible(false);
                  },
                  icon: 'fork',
                },
                {
                  articleId: item._id,
                  name: 'Download as pdf',
                  action: () => {
                    //handleAnimation();
                    console.log('click card');

                    generatePDFFromUrl(item?.pb_recordId, item?.title);
                  },
                  icon: 'download',
                },
                {
                  articleId: item._id,
                  name: 'Request to edit',
                  action: () => {
                    if (!isConnected) {
                      console.log('click improvement');
                      Snackbar.show({
                        text: 'Please check your internet connection',
                        duration: Snackbar.LENGTH_SHORT,
                      });
                      return;
                    }
                    setMenuVisible(false);
                    setRequestModalVisible(true);
                    console.log('modal visible', requestModalVisible);
                    // handleAnimation();
                  },
                  icon: 'edit',
                },
                {
                  articleId: item._id,
                  name: 'Report this post',
                  action: () => {
                    setMenuVisible(false);
                    handleReportAction(item);
                    // handleAnimation();
                  },
                  icon: 'aim',
                },
              ]}
              visible={menuVisible}
              onDismiss={() => {
                setMenuVisible(false);
              }}
            />
          )}

          {/* Title & Footer Text */}
          <Text style={styles.footerText}>
            {item?.tags.map(tag => tag.name).join(' | ')}
          </Text>
          <Text style={styles.title}>{item?.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.footerText1}>{item?.authorName}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.footerText1}>
              {formatCount(item?.viewUsers?.length || 0)} views
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.footerText1}>
              {moment(item?.lastUpdated).format('DD MMM')}
            </Text>
          </View>

          <EditRequestModal
            visible={requestModalVisible}
            callback={(reason: string) => {
              //onclick(item, 1, reason);
              handleEditRequestAction(item, 1, reason);
              setRequestModalVisible(false);
            }}
            dismiss={() => {
              setRequestModalVisible(false);
            }}
          />

          {/* Like, Save, and Comment Actions */}
          <View style={styles.likeSaveContainer}>
            {updateLikeMutation.isPending ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  //width.value = withTiming(0, {duration: 250});
                  //yValue.value = withTiming(100, {duration: 250});
                  if (isConnected) {
                    updateLikeMutation.mutate();
                  } else {
                    Snackbar.show({
                      text: 'Please check your network connection',
                      duration: Snackbar.LENGTH_SHORT,
                    });
                  }
                }}
                style={styles.likeSaveChildContainer}>
                {item.likedUsers.some(
                  it =>
                    (it._id && it._id.toString() === user_id) ||
                    it.toString() === user_id,
                ) ? (
                  <AntDesign name="heart" size={24} color={PRIMARY_COLOR} />
                ) : (
                  <FontAwesome name="heart-o" size={24} color={'black'} />
                )}
                <Text
                  style={{
                    ...styles.title,
                    marginStart: 3,
                    fontWeight: '500',
                    color: 'black',
                  }}>
                  {formatCount(item.likedUsers.length)}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CommentScreen', {
                  articleId: item._id,
                  mentionedUsers: item.mentionedUsers
                    ? item.mentionedUsers
                    : [],
                  article: item,
                });
              }}
              style={styles.likeSaveChildContainer}>
              <FontAwesome name="commenting" size={27} color={'#414A4C'} />
            </TouchableOpacity>

            {source === 'home' && (
              <TouchableOpacity
                onPress={() => {
                  // width.value = withTiming(0, {duration: 300});
                  // yValue.value = withTiming(100, {duration: 300});
                  handleRepostAction(item);
                }}
                style={styles.likeSaveChildContainer}>
                <FontAwesome6
                  name="arrows-rotate"
                  size={24}
                  color={'#414A4C'}
                />
                <Text
                  style={{
                    ...styles.title,
                    fontWeight: '500',
                    marginStart: 3,
                    color: 'black',
                  }}>
                  {formatCount(item.repostUsers.length)}
                </Text>
              </TouchableOpacity>
            )}

            {source === 'home' && (
              <TouchableOpacity
                onPress={() => {
                  // width.value = withTiming(0, {duration: 300});
                  // yValue.value = withTiming(100, {duration: 300});
                  handleShare();
                }}
                style={styles.likeSaveChildContainer}>
                <FontAwesome
                  name="share-alt"
                  size={24}
                  color={'#414A4C'}
                />
              
              </TouchableOpacity>
            )}

            {updateSaveStatusMutation.isPending ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (isConnected) {
                    width.value = withTiming(0, {duration: 250});
                    yValue.value = withTiming(100, {duration: 250});
                    updateSaveStatusMutation.mutate();
                  } else {
                    Snackbar.show({
                      text: 'Please check your network connection',
                      duration: Snackbar.LENGTH_SHORT,
                    });
                  }
                }}
                style={styles.likeSaveChildContainer}>
                {item.savedUsers.includes(user_id) ? (
                  <IonIcons name="bookmark" size={24} color={PRIMARY_COLOR} />
                ) : (
                  <IonIcons name="bookmark-outline" size={24} color={'#414A4C'} />
                )}
              </TouchableOpacity>
            )}

            {source === 'home' && item.status === StatusEnum.PUBLISHED && (
              <TouchableOpacity
                style={styles.likeSaveChildContainer}
                onPress={onChange}>
                <Entypo name="dots-three-vertical" size={20} color={'#414A4C'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ArticleCard;

// const styles = StyleSheet.create({
//   cardContainer: {
//     width: '100%',
//     backgroundColor: '#ffffff',
//     flexDirection: 'row',
//     marginVertical: 10,
//     borderRadius: 12,
//     overflow: 'hidden',
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   image: {
//     flex: 0.4,
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   textContainer: {
//     flex: 0.6,
//     backgroundColor: 'white',
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     justifyContent: 'space-between',
//   },

//   title: {
//     fontSize: fp(5.5),
//     fontWeight: '700',
//     color: '#191C1B',
//     marginBottom: 4,
//   },
//   footerText: {
//     fontSize: fp(3.5),
//     fontWeight: '600',
//     color: PRIMARY_COLOR,
//     marginBottom: 3,
//   },
//   footerText1: {
//     fontSize: fp(3.5),
//     fontWeight: '400',
//     color: '#778599',
//     marginBottom: 2,
//   },
//   likeSaveContainer: {
//     flexDirection: 'row',
//     width: '100%',
//     marginTop: 10,
//     justifyContent: 'space-between',
//   },
//   likeSaveChildContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   shareIconContainer: {
//     position: 'absolute',
//     top: 5,
//     right: 5,
//     zIndex: 1,
//   },
// });

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },

  coverImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },

  contentContainer: {
    padding: 14,
  },

  footerText: {
    fontSize: fp(3.4),
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 6,
  },

  title: {
    fontSize: fp(5.8),
    fontWeight: '700',
    color: '#121212',
    lineHeight: 26,
    marginBottom: 6,
  },

  footerText1: {
    fontSize: fp(3.5),
    color: '#7A869A',
    marginBottom: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  dot: {
    marginHorizontal: 6,
    color: '#B0B0B0',
  },

  likeSaveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  likeSaveChildContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  shareIconContainer: {
    position: 'absolute',
    top: 2,
    right: 12,
    backgroundColor: ON_PRIMARY_COLOR,
    padding: 6,
    borderRadius: 20,
  },
});

/*
const styles = StyleSheet.create({
  cardContainer: {
    flex: 0,
    width: '100%',
    maxHeight: 390,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    marginVertical: 14,
    overflow: 'hidden',
    elevation: 4,

    borderRadius: 12,
  },
  image: {
    flex: 0.8,
    resizeMode: 'cover',
  },

  likeSaveContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 6,
    justifyContent: 'space-between',
  },

  likeSaveChildContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginHorizontal: hp(0),
    marginVertical: hp(1),
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 13,
  },
  title: {
    fontSize: fp(5.5),
    fontWeight: 'bold',
    color: '#121a26',
    marginBottom: 4,
    fontFamily: 'Lobster-Regular',
  },
  description: {
    fontSize: fp(3),
    fontWeight: '500',
    lineHeight: 18,
    color: '#778599',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  footerText: {
    fontSize: fp(3.9),
    fontWeight: '700',
    color: BUTTON_COLOR,
    marginBottom: 3,
  },

  footerText1: {
    fontSize: fp(3.5),
    fontWeight: '600',
    color: '#121a26',
    marginBottom: 3,
  },

  footerContainer: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  shareIconContainer: {
    position: 'absolute',
    top: 2,
    right: 1,
    zIndex: 1,
  },
 
});
*/
