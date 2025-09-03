import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import React, {useEffect} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import NotificationItem from '../components/NotificationItem';
import {useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import Config from 'react-native-config';
import {Notification, NotificationType} from '../type';
import Loader from '../components/Loader';
import Snackbar from 'react-native-snackbar';
import { hp } from '../helper/Metric';

// PodcastsScreen component displays the list of podcasts and includes a PodcastPlayer
const NotificationScreen = ({navigation}) => {
  //const notifications = [];
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [notificationsData, setNotificationsData] = React.useState<Notification[]>();

 // console.log(user_token);
//  console.log('user_token');

  const {
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get-all-notifications', page],
    queryFn: async () => {
      try {
        const response = await axios.get(`${Config.PROD_URL}/notifications?role=2&page=${page}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        if(Number(page) === 1){
          if(response.data.totalPages){
          const totalPage = response.data.totalPages;
          setTotalPages(totalPage);
          }
          setNotificationsData(response.data.notifications);
        }else{
          const oldNotif = notificationsData ?? [];
          setNotificationsData([...oldNotif, ...response.data.notifications]);
        }
        // console.log('Notification Response', response);
        return response.data.notifications as Notification[];
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
    enabled: !!user_token && !!page,
  });

  // Mark Notification as read api integration
  const markNotificationMutation = useMutation({
    mutationKey: ['mark-notification-as-read'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.put(
        `${Config.PROD_URL}/notifications/mark-as-read?role=2`,
        {
          role: 2,
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
      //success();

      Snackbar.show({
        text: 'All notifications marked as read',
        duration: Snackbar.LENGTH_SHORT,
      });
    },

    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Internal server error, cannot mark the notification as read!',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationKey: ['delete-notification-by-id'],
    mutationFn: async ({id}: {id: string}) => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.delete(
        `${Config.PROD_URL}/notification/${id}`,

        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data as any;
    },
    onSuccess: async () => {
      //success();
      refetch();
      Snackbar.show({
        text: 'Notification deleted',
        duration: Snackbar.LENGTH_SHORT,
      });
    },

    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Internal server error, failed to delete notification!',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  useEffect(() => {
    markNotificationMutation.mutate();

    return () => {};
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const handleNotificationClick = (item: Notification) => {
    if (
      (item.type === NotificationType.PodcastCommentMention ||
        item.type === NotificationType.PodcastComment ||
        item.type === NotificationType.PodcastCommentLike) &&
      item.podcastId
    ) {
      navigation.navigate('PodcastDiscussion', {
        podcastId: item.podcastId._id,
        mentionedUsers: item.podcastId.mentionedUsers,
      });
    } else if (
      (item.type === NotificationType.ArticleCommentMention ||
        item.type === NotificationType.ArticleRepost ||
        item.type === NotificationType.Article ||
        item.type === NotificationType.EditRequest ||
        item.type === NotificationType.ArticleLike ||
        item.type === NotificationType.ArticleComment) &&
      item.articleId
    ) {
      navigation.navigate('ArticleScreen', {
        articleId: Number(item.articleId._id),
        authorId: item.articleId.authorId,
        recordId: item.articleId.pb_recordId,
      });
    } else if (item.type === NotificationType.UserFollow && item.userId) {
      navigation.navigate('UserProfileScreen', {
        userId: item.userId._id,
      });
    } else if (item.type === NotificationType.CommentLike) {
      if (item.podcastId) {
        navigation.navigate('PodcastDiscussion', {
          podcastId: item.podcastId._id,
          mentionedUsers: item.podcastId.mentionedUsers,
        });
      } else if (item.articleId) {
        navigation.navigate('CommentScreen', {
          articleId: item.articleId._id,
          mentionedUsers: item.articleId.mentionedUsers,
        });
      }
    } else if (
      (item.type === NotificationType.Podcast ||
        item.type === NotificationType.PodcastLike) &&
      item.podcastId
    ) {
      navigation.navigate('PodcastDetail', {
        trackId: item.podcastId._id,
      });
    }
    else if(item.type === NotificationType.ArticleCommentLike){
      if(item.articleId){
        navigation.navigate('CommentScreen', {
        articleId: item.articleId._id,
        mentionedUsers: item.articleId.mentionedUsers,
      });
      }
    }
    else if(item.type === NotificationType.ArticleReview){

      if(item.articleId){
        navigation.navigate('ReviewScreen',{
        articleId: item.articleId._id,
        authorId: item.articleId.authorId,
        recordId: item.articleId.pb_recordId,
      });
      }
    }
    else if(item.type === NotificationType.ArticleRevisionReview){
      if(item.revisonId){
        navigation.navigate('ImprovementReviewScreen',{
          requestId: item.revisonId._id,
          authorId: item.revisonId.user_id,
          recordId: item.revisonId.pb_recordId,
          articleRecordId: item.revisonId.article_recordId,
        });
      }
    }
  };

  const renderItem = ({item}: {item: Notification}) => {
    return (
      <NotificationItem
        item={item}
        handleDeleteAction={handleDeleteAction}
        handleClick={handleNotificationClick}
      />
    );
  };

  const handleDeleteAction = (item: Notification) => {
    console.log('Notification ID', item?._id);
    deleteNotificationMutation.mutate({
      id: item?._id,
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    // Main container
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notificationsData}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={styles.flatListContentContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
              <Image
                  source={require('../assets/no_results.jpg')}
                  style={styles.emptyImgStyle}
                />

            <Text style={styles.message}>No Notifications Found</Text>
          </View>
        }
         onEndReached={() => {
              if (page < totalPages) {
                setPage(prev => prev + 1);
              }
        }}
         onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    justifyContent: 'center',
    //marginTop: 16,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
   // paddingBottom: hp(3),
  },
  content: {
    marginTop: hp(3),
    paddingHorizontal: 16,
  },
  recentPodcastsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentPodcastsTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },

  message: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    top: 70,
  },

  flatListContentContainer: {
    paddingHorizontal: 16,
    marginTop: 40,
    paddingBottom: 120,
  },
  emptyImgStyle: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
});
