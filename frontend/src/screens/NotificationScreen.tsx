import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import NotificationItem from '../components/NotificationItem';
import {useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {EC2_BASE_URL, SAVE_ARTICLE} from '../helper/APIUtils';
import {Notification} from '../type';
import Loader from '../components/Loader';
import Snackbar from 'react-native-snackbar';

// PodcastsScreen component displays the list of podcasts and includes a PodcastPlayer
const NotificationScreen = ({navigation}) => {
  //const notifications = [];
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = React.useState(false);

  console.log(user_token);
  console.log('user_token');

  const {
    data: notifications,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['get-all-notifications'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }
        const response = await axios.get(`${EC2_BASE_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        // console.log('Notification Response', response);
        return response.data as Notification[];
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
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
        `${EC2_BASE_URL}/notifications/mark-as-read`,
        {},
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
        `${EC2_BASE_URL}/notification/${id}`,

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

  const renderItem = ({item}: {item: Notification}) => {
    return (
      <NotificationItem
        item={item}
        handleDeleteAction={handleDeleteAction}
        // isSelected={selectedCardId === item._id}
        // setSelectedCardId={setSelectedCardId}
        // navigation={navigation}
        //  success={onRefresh}
      />
    );
  };

  const handleDeleteAction = (item: Notification) => {
    console.log('Notification ID', item?._id);
    deleteNotificationMutation.mutate({
      id: item?._id
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    // Main container
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={styles.flatListContentContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/**
                 *  <Image
                  source={require('../assets/article_default.jpg')}
                  style={styles.emptyImgStyle}
                />
                 */}
            <Text style={styles.message}>No Article Found</Text>
          </View>
        }
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
    paddingBottom: 20,
  },
  content: {
    marginTop: 15,
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
});
