import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {fp, hp} from '../helper/Metric';
import {ArticleCardProps, ArticleData} from '../type';
import moment from 'moment';
import {useSelector} from 'react-redux';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {useMutation} from '@tanstack/react-query';
import {
  GET_IMAGE,
  LIKE_ARTICLE,
  SAVE_ARTICLE,
  UPDATE_VIEW_COUNT,
} from '../helper/APIUtils';
import {PRIMARY_COLOR} from '../helper/Theme';
import {formatCount} from '../helper/Utils';

const ArticleCard = ({item, navigation, success}: ArticleCardProps) => {
  const {user_token, user_id} = useSelector((state: any) => state.user);
  console.log('Image Utils', item?.imageUtils[0]);
  const updateViewCountMutation = useMutation({
    mutationKey: ['update-view-count'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        UPDATE_VIEW_COUNT,
        {
          article_id: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.article as ArticleData;
    },
    onSuccess: async data => {
      navigation.navigate('ArticleScreen', {
        articleId: Number(item._id),
        authorId: item.authorId,
      });
    },

    onError: error => {
      console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  const updateSaveStatusMutation = useMutation({
    mutationKey: ['update-view-count'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
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

    onError: error => {
      console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  const updateLikeMutation = useMutation({
    mutationKey: ['update-like-status'],

    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
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
      return res.data.article as ArticleData;
    },

    onSuccess: data => {
      // dispatch(setArticle({article: data}));
      success();
    },

    onError: err => {
      Alert.alert('Try Again!');
      console.log('Like Error', err);
    },
  });

  return (
    <Pressable
      onPress={() => {
        // handle onPress
        updateViewCountMutation.mutate();
      }}>
      <View style={styles.cardContainer}>
        {/* image */}
        {item?.imageUtils[0] && item?.imageUtils[0].length !== 0 ? (
          <Image
            source={{
              uri: item?.imageUtils[0].startsWith('http')
                ? item?.imageUtils[0]
                : `${GET_IMAGE}/${item?.imageUtils[0]}`,
            }}
            style={styles.image}
          />
        ) : (
          <Image
            source={require('../assets/article_default.jpg')}
            style={styles.image}
          />
        )}

        <View style={styles.textContainer}>
          {/* title */}
          <Text style={styles.footerText}>
            {item?.tags.map(tag => tag.name).join(' | ')}
          </Text>
          <Text style={styles.title}>{item?.title}</Text>
          {/* description */}
          {/**  <Text style={styles.description}>{item?.description}</Text> */}
          {/* displaying the categories, author name, and last updated date */}
          {updateViewCountMutation.isPending && (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          )}
          <Text style={styles.footerText}>
            {item?.authorName} {''}
          </Text>
          <Text style={{...styles.footerText, marginBottom: 3}}>
            {item?.viewUsers
              ? item?.viewUsers.length > 1
                ? `${formatCount(item?.viewUsers.length)} views`
                : `${item?.viewUsers.length} view`
              : '0 view'}
          </Text>
          <Text style={styles.footerText}>
            Last updated: {''}
            {moment(new Date(item?.lastUpdated)).format('DD/MM/YYYY')}
          </Text>

          <View style={styles.likeSaveContainer}>
            {updateLikeMutation.isPending ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  updateLikeMutation.mutate();
                }}
                style={styles.likeSaveChildContainer}>
                {item.likedUsers.includes(user_id) ? (
                  <AntDesign name="heart" size={26} color={PRIMARY_COLOR} />
                ) : (
                  <AntDesign name="hearto" size={26} color={'black'} />
                )}
                <Text style={{...styles.title, marginStart: 3}}>
                  {formatCount(item.likedUsers.length)}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CommentScreen', {
                  articleId: item.id,
                });
              }}
              style={styles.likeSaveChildContainer}>
              <FontAwesome name="comment-o" size={30} color={'#B0BEC5'} />
            </TouchableOpacity>
            {updateSaveStatusMutation.isPending ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  updateSaveStatusMutation.mutate();
                }}
                style={styles.likeSaveChildContainer}>
                {item.savedUsers.includes(user_id) ? (
                  <IonIcons name="bookmark" size={26} color={PRIMARY_COLOR} />
                ) : (
                  <IonIcons name="bookmark-outline" size={26} color={'black'} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Pressable>
    // future card
    // <TouchableOpacity style={styles.card}>
    //   <Image source={{uri: item?.imageUtils}} style={styles.image} />
    //   <View style={styles.content}>
    //     <Text style={styles.title}>{item?.title}</Text>
    //     <Text style={styles.author}>
    //       by {item?.author_name} | {item?.date_updated}
    //     </Text>
    //     <Text style={styles.description}>{item?.description}</Text>
    //     <View style={styles.categoriesContainer}>
    //       {item?.category.map((value, key) => (
    //         <View key={key} style={styles.category}>
    //           <Text style={styles.categoryText}>{value}</Text>
    //         </View>
    //       ))}
    //     </View>
    //   </View>
    // </TouchableOpacity>
  );
};

export default ArticleCard;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 0,
    width: '100%',
    maxHeight: 260,
    backgroundColor: '#E6E6E6',
    flexDirection: 'row',
    marginVertical: 14,
    overflow: 'hidden',
    elevation: 4,

    borderRadius: 12,
  },
  image: {
    flex: 0.6,
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
    flex: 0.9,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 13,
  },
  title: {
    fontSize: fp(4.5),
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
    fontSize: fp(3.3),
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
  // future card styles
  //   card: {
  //     marginBottom: 20,
  //     backgroundColor: 'white',
  //     padding: 15,
  //     borderRadius: 10,
  //   },
  //   image: {
  //     width: '100%',
  //     height: 200,
  //     borderRadius: 10,
  //     resizeMode: 'cover',
  //   },
  //   content: {
  //     padding: 10,
  //   },
  //   title: {
  //     fontSize: 20,
  //     fontWeight: 'bold',
  //     marginBottom: 10,
  //   },
  //   author: {
  //     fontSize: 14,
  //     color: '#999',
  //     marginBottom: 10,
  //   },
  //   description: {
  //     fontSize: 14,
  //   },
  //   categoriesContainer: {
  //     flexDirection: 'row',
  //     marginTop: 10,
  //     gap: 5,
  //   },
  //   category: {
  //     padding: 10,
  //     borderRadius: 50,
  //     backgroundColor: PRIMARY_COLOR,
  //     marginTop: 5,
  //   },
  //   categoryText: {
  //     color: 'white',
  //     fontWeight: '600',
  //   },
});
