import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {fp, hp} from '../helper/Metric';
import {ImprovementCardProps} from '../type';
import moment from 'moment';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {StatusEnum} from '../helper/Utils';
//import io from 'socket.io-client';
import AntDesign from 'react-native-vector-icons/AntDesign';
import WebView from 'react-native-webview';

const ImprovementCard = ({item, onNavigate}: ImprovementCardProps) => {
  const backgroundColor =
    item?.status === StatusEnum.PUBLISHED
      ? 'green'
      : item?.status === StatusEnum.DISCARDED
      ? 'red'
      : BUTTON_COLOR;

  return (
    <Pressable>
      <View style={styles.cardContainer}>
        {/* Image Section */}

        <View style={styles.textContainer}>
          {/* Share Icon */}

          {/* Title & Footer Text */}
          {item && item.article && item?.article.tags && (
            <Text style={styles.footerText}>
              {item?.article.tags.map(tag => tag.name).join(' | ')}
            </Text>
          )}
          <Text
            style={
              styles.title
            }>{`Article Title: ${item?.article?.title}`}</Text>

          <Text style={styles.title}>{'Request Reason: '}</Text>

          <View style={{height: 50, marginBottom: 10}}>
            <WebView
              originWhitelist={['*']}
              source={{html: `${item?.edit_reason}`}}
              style={{flex: 1}}
              scrollEnabled={true}
            />
          </View>

          <Text style={styles.footerText1}>
            Last updated: {''}
            {moment(new Date(item?.last_updated)).format('DD/MM/YYYY')}
          </Text>

          <View style={styles.viewContainer}>
            <Text
              style={{
                ...styles.footerText1,
                color: backgroundColor,
                // fontSize: 16,
                fontWeight: '700',
                marginTop: 3,
              }}>
              {item?.status ? item.status.toLocaleUpperCase() : 'Not found'}
            </Text>

            <TouchableOpacity
              style={styles.viewInnnerContainer}
              onPress={() => {
                // onclick(item);
                onNavigate(item);
              }}>
              <Text style={styles.viewText}>View</Text>
              <AntDesign
                name="arrowright"
                size={16}
                color={PRIMARY_COLOR}
                style={{marginTop: 2}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ImprovementCard;

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
    //alignItems:"center"
  },
  title: {
    fontSize: fp(5.5),
    fontWeight: 'bold',
    color: '#121a26',
    marginBottom: 4,
    fontFamily: 'Lobster-Regular',
    //alignSelf: 'center',
  },
  description: {
    fontSize: fp(3),
    fontWeight: '600',
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
  viewContainer: {
    //flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 2,
  },
  viewInnnerContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: 2,
  },
  viewText: {
    fontSize: fp(4),
    textDecorationLine: 'underline',
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginRight: 2,
  },
});
