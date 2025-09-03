import React, {useMemo, useRef} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {Comment} from '../type';
import moment from 'moment';
import WebView from 'react-native-webview';
import { baseHeight, height } from '../helper/Metric';

export default function ReviewItem({item}: {item: Comment}) {
  const webViewRef = useRef<WebView>(null);

  const formatWithOrdinal = date => {
    return moment(date).format('D MMM, ddd, h:mm a');
  };

  const cssCode = `
    const style = document.createElement('style');
    style.innerHTML = \`
      body {
        font-size: 46px;
        line-height: 1.5;
        color: #333;
      }
    \`;
    document.head.appendChild(style);
  `;

  const scalePerChar = 1 / 1000;
    const maxMultiplier = 4.3;
    const baseMultiplier = 0.8;
  
    const minHeight = useMemo(() => {
      const scaleFactor = Math.min(item.content.length * scalePerChar, maxMultiplier);
      const scaledHeight = height * (baseMultiplier + scaleFactor);
      const cappedHeight = Math.min(scaledHeight, height * 6);
      return cappedHeight;
    }, [ item.content.length, scalePerChar]);
  return (
    <View style={styles.commentContainer}>
      <Image
        source={{
          uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
        }}
        style={[styles.profileImage, {borderWidth: 0.5, borderColor: 'black'}]}
      />

      <View style={styles.commentContent}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
          <Text style={styles.username}>
            {item.isReview ? 'Moderator' : 'Author'}
          </Text>
          {item.isEdited && (
            <Text style={{...styles.comment, marginStart: 4, marginTop: 2}}>
              (edited)
            </Text>
          )}
        </View>

        {/*** Webview will be render here */}
        <View style={styles.descriptionContainer}>
          <WebView
            style={{
              padding: 7,
              //width: '99%',
             // minHeight: item.content.length-20 ,
               minHeight: minHeight,
              // flex:7,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            ref={webViewRef}
            originWhitelist={['*']}
            injectedJavaScript={cssCode}
            source={{html: item.content}}
            textZoom={100}
          />
        </View>
        <Text style={styles.timestamp}>
          Last updated {formatWithOrdinal(item.updatedAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginTop: 5, // Reduced top margin
  },
  profileImage: {
    height: 50,
    width: 50,
    borderRadius: 30,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 6,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginEnd: 4, // Small gap between user handle and content
  },
  comment: {
    fontSize: 15,
    color: '#555',
    marginVertical: 0, // Remove vertical margin for no extra space
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    marginStart: 3,
    marginVertical: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  mention: {
    color: 'blue', // Mention text color
    fontWeight: 'bold',
    paddingTop: 4,
  },
  shareIconContainer: {
    position: 'absolute',
    top: 1,
    right: 7,
    zIndex: 1,
  },
  descriptionContainer: {
    flex: 0,
    width: '90%',
    marginVertical: 5,
  },
});
