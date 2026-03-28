import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React from 'react';
import {fp, hp} from '../helper/Metric';
import {ImprovementCardProps} from '../type';
import moment from 'moment';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {handleExternalClick, StatusEnum} from '../helper/Utils';
//import io from 'socket.io-client';
import AntDesign from '@expo/vector-icons/AntDesign';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';


const ImprovementCard = ({item, onNavigate}: ImprovementCardProps) => {
  const backgroundColor =
    item?.status === StatusEnum.PUBLISHED
      ? 'green'
      : item?.status === StatusEnum.DISCARDED
      ? 'red'
      : BUTTON_COLOR;

 // console.log('ImprovementCard item:', item);

  const extractBody = (html: string) => {
  if (!html) return '<p>No reason provided.</p>';

  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
};

  return (
    <Pressable
      onPress={() => {
        onNavigate(item);
      }}>
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
            {/* <WebView
              originWhitelist={['*']}
              source={{html: `${item?.edit_reason}`}}
              style={{flex: 1}}
              scrollEnabled={true}
            /> */}

            <AutoHeightWebView
              style={{
                width: Dimensions.get('window').width - 15,
                marginTop: 35,
              }}
              customStyle={`* { font-family: 'Times New Roman'; } p { font-size: 16px; color: #121a26; }`}
              onSizeUpdated={size => console.log(size.height)}
              files={[
                {
                  href: 'cssfileaddress',
                  type: 'text/css',
                  rel: 'stylesheet',
                },
              ]}
              originWhitelist={['*']}
              source={{html: extractBody(item?.edit_reason) || '<p>No reason provided.</p>'}}
              scalesPageToFit={true}
              viewportContent={'width=device-width, user-scalable=no'}
              onShouldStartLoadWithRequest={handleExternalClick}
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
                name="arrow-right"
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
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    marginVertical: hp(1.5),
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: fp(4.8),
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: fp(5.8),
    letterSpacing: 0.3,
  },
  description: {
    fontSize: fp(3.4),
    fontWeight: '500',
    lineHeight: 20,
    color: '#666666',
    marginBottom: 12,
  },
  footerText: {
    fontSize: fp(3.5),
    fontWeight: '700',
    color: BUTTON_COLOR,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  footerText1: {
    fontSize: fp(3.3),
    fontWeight: '500',
    color: '#5A5A5A',
    marginBottom: 4,
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
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 8,
  },
  viewContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 2,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewInnnerContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  viewText: {
    fontSize: fp(3.8),
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginRight: 4,
  },
});
