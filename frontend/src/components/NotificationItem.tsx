import moment from 'moment';
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Notification} from '../type';
import {fp, hp} from '../helper/Metric';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BUTTON_COLOR} from '../helper/Theme';

export default function NotificationItem({
  item,
  handleDeleteAction,
  handleClick,
}: {
  item: Notification;
  handleDeleteAction: (item: Notification) => void;
  handleClick: (item: Notification) => void;
}) {
  return (
    <Pressable
      onPress={() => {
        handleClick(item);
      }}>
      <View style={styles.cardContainer}>
        {/* Share Icon */}

        <View style={styles.textContainer}>
          {/* title */}
          <Text style={styles.title}>{item?.title}</Text>

          <Text style={styles.footerText}>
            {item?.message} {''}
          </Text>
          <Text style={styles.footerText}>
            Received at: {''}
            {moment(new Date(item?.timestamp)).format('hh:mm A DD/MM/YYYY')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Alert',
              'Are you sure you want to delete this notification.',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => {
                    // delete notification api
                    handleDeleteAction(item);
                  },
                },
              ],
              {cancelable: false},
            );
          }}>
          <MaterialCommunityIcon
            name="delete-empty-outline"
            size={30}
            color={BUTTON_COLOR}
            style={{alignSelf: 'center'}}
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 0,
    width: '100%',
    maxHeight: 360,
    backgroundColor: 'white',
    flexDirection: 'row',
    marginVertical: 4,
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
    paddingHorizontal: 14,
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
  shareIconContainer: {
    position: 'absolute',
    top: 2,
    right: 1,
    zIndex: 1,
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
