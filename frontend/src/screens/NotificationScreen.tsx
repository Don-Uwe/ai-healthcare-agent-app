import {FlatList, StyleSheet, Text, View, Image} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import NotificationItem from '../components/NotificationItem';
import {useDispatch, useSelector} from 'react-redux';
import {Notification, NotificationType} from '../type';
import Loader from '../components/Loader';
import Snackbar from 'react-native-snackbar';
import {hp} from '../helper/Metric';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useGetAllNotifications} from '../hooks/useGetAllNotifications';
import {useMarkNotificationAsRead} from '../hooks/useMarkNoticationAsRead';
import {useDeleteNotification} from '../hooks/useDeleteNotification';
import {NoNotificationState} from '../components/EmptyStates';

type PendingDelete = {
  item: Notification;
  index: number;
  timer: ReturnType<typeof setTimeout>;
};

const UNDO_TIMEOUT_MS = 3500;

// PodcastsScreen component displays the list of podcasts and includes a PodcastPlayer
const NotificationScreen = ({navigation}: any) => {
  //const notifications = [];
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const {isConnected} = useSelector((state: any) => state.network);
  const [notificationsData, setNotificationsData] =
    React.useState<Notification[]>([]);
  const [openSwipeItemId, setOpenSwipeItemId] = useState<string | null>(null);
  const pendingDeletesRef = useRef<Map<string, PendingDelete>>(new Map());
  const isMountedRef = useRef(true);

  const dispatch = useDispatch();
  const {mutate: markNotification} = useMarkNotificationAsRead();
  const {mutate: deleteNotification} = useDeleteNotification();

  const {
    data: notificationsRes,
    isLoading,
    refetch,
  } = useGetAllNotifications(page, isConnected);

  useEffect(() => {
    if (notificationsRes) {
      if (Number(page) === 1) {
        if (notificationsRes.totalPages) {
          const totalPage = notificationsRes.totalPages;
          setTotalPages(totalPage);
        }
        setNotificationsData(notificationsRes.notifications);
      } else {
        if (notificationsRes.notifications) {
          const oldNotif = notificationsData ?? [];
          setNotificationsData([
            ...oldNotif,
            ...notificationsRes.notifications,
          ]);
        }
      }
    }
  }, [notificationsRes, page]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      pendingDeletesRef.current.forEach(pendingDelete => {
        clearTimeout(pendingDelete.timer);
        deleteNotification(pendingDelete.item._id);
      });
      pendingDeletesRef.current.clear();
    };
  }, [deleteNotification]);

  useEffect(() => {
    if (isConnected) {
      markNotification(
        {},
        {
          onSuccess: async () => {
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
        },
      );
    }

    return () => {};
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const restoreDeletedNotification = useCallback(
    (snapshot: PendingDelete) => {
      setNotificationsData(previous => {
        const current = previous ?? [];

        if (current.some(notification => notification._id === snapshot.item._id)) {
          return current;
        }

        const nextNotifications = [...current];
        const insertionIndex = Math.min(snapshot.index, nextNotifications.length);
        nextNotifications.splice(insertionIndex, 0, snapshot.item);
        return nextNotifications;
      });
    },
    [],
  );

  const clearPendingDelete = useCallback((id: string) => {
    const pendingDelete = pendingDeletesRef.current.get(id);

    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      pendingDeletesRef.current.delete(id);
    }
  }, []);

  const commitDeleteNotification = useCallback(
    (snapshot: PendingDelete) => {
      deleteNotification(snapshot.item._id, {
        onSuccess: () => {
          pendingDeletesRef.current.delete(snapshot.item._id);

          if (isMountedRef.current) {
            refetch();
          }
        },

        onError: error => {
          console.log(error);
          pendingDeletesRef.current.delete(snapshot.item._id);

          if (isMountedRef.current) {
            restoreDeletedNotification(snapshot);
            Snackbar.show({
              text: 'Internal server error, failed to delete notification!',
              duration: Snackbar.LENGTH_SHORT,
            });
          }
        },
      });
    },
    [deleteNotification, refetch, restoreDeletedNotification],
  );

  const handleDeleteAction = useCallback(
    (item: Notification) => {
      console.log('Notification ID', item?._id);

      if (!isConnected) {
        Snackbar.show({
          text: 'Please check your internet connection',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      if (pendingDeletesRef.current.has(item._id)) {
        return;
      }

      setOpenSwipeItemId(previous => (previous === item._id ? null : previous));

      let snapshot: Omit<PendingDelete, 'timer'> | null = null;

      setNotificationsData(previous => {
        const current = previous ?? [];
        const index = current.findIndex(notification => notification._id === item._id);

        if (index === -1) {
          return current;
        }

        snapshot = {
          item,
          index,
        };

        return current.filter(notification => notification._id !== item._id);
      });

      if (!snapshot) {
        return;
      }

      const timer = setTimeout(() => {
        const pendingDelete = pendingDeletesRef.current.get(item._id);

        if (!pendingDelete) {
          return;
        }

        commitDeleteNotification(pendingDelete);
      }, UNDO_TIMEOUT_MS);

      pendingDeletesRef.current.set(item._id, {
        ...snapshot,
        timer,
      });

      Snackbar.show({
        text: 'Notification deleted',
        duration: Snackbar.LENGTH_LONG,
        action: {
          text: 'UNDO',
          textColor: '#ffffff',
          onPress: () => {
            const pendingDelete = pendingDeletesRef.current.get(item._id);

            if (!pendingDelete) {
              return;
            }

            clearPendingDelete(item._id);
            restoreDeletedNotification(pendingDelete);
            Snackbar.show({
              text: 'Deletion undone',
              duration: Snackbar.LENGTH_SHORT,
            });
          },
        },
      });
    },
    [clearPendingDelete, commitDeleteNotification, isConnected, restoreDeletedNotification],
  );

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
        authorId: item.userId._id,
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
          article: item.articleId,
        });
      }
    } else if (
      (item.type === NotificationType.Podcast ||
        item.type === NotificationType.PodcastLike) &&
      item.podcastId
    ) {
      navigation.navigate('PodcastDetail', {
        trackId: item.podcastId._id,
        audioUrl: item.podcastId.audio_url,
      });
    } else if (item.type === NotificationType.ArticleCommentLike) {
      if (item.articleId) {
        navigation.navigate('CommentScreen', {
          articleId: item.articleId._id,
          mentionedUsers: item.articleId.mentionedUsers,
        });
      }
    } else if (item.type === NotificationType.ArticleReview) {
      if (item.articleId) {
        navigation.navigate('ReviewScreen', {
          articleId: item.articleId._id,
          authorId: item.articleId.authorId,
          recordId: item.articleId.pb_recordId,
        });
      }
    } else if (item.type === NotificationType.ArticleRevisionReview) {
      if (item.revisonId) {
        navigation.navigate('ImprovementReviewScreen', {
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
        isOpen={openSwipeItemId === item._id}
        onOpenSwipe={setOpenSwipeItemId}
        onCloseSwipe={id => {
          setOpenSwipeItemId(previous => (previous === id ? null : previous));
        }}
      />
    );
  };

  if (isLoading && notificationsData.length === 0) {
    return <Loader />;
  }

  return (
    // Main container
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notificationsData}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={[
          styles.flatListContentContainer,
          (!notificationsData || notificationsData.length === 0) && {
            flexGrow: 1,
            justifyContent: 'center',
          },
        ]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <NoNotificationState onRefresh={onRefresh} />
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

  flatListContentContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    paddingBottom: 120,
  },
});
