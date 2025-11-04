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
import {fp, hp, wp} from '../helper/Metric';
import MaterialCommunityIcon from '@expo/vector-icons/MaterialCommunityIcons';
import {BUTTON_COLOR} from '../helper/Theme';
import { MaterialIcons } from '@expo/vector-icons';

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

          <Text style={styles.description}>
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
          <MaterialIcons
            name="delete-forever"
            size={30}
            color={'#778599'}
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
    padding: wp(2.5),

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
    fontSize: fp(4),
    fontWeight: '500',
    lineHeight: 18,
   color: '#121a26',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  footerText: {
    fontSize: fp(3.3),
    fontWeight: '600',
     color: '#778599',
    
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
