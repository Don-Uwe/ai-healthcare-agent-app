/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PRIMARY_COLOR} from '../helper/Theme';

const Message = ({message, isUserMessage}) => {
  return (
    <View
      style={[
        styles.messageContainer,
        {alignItems: isUserMessage ? 'flex-end' : 'flex-start'},
      ]}>
      <View
        style={[
          styles.messageBubble,
          isUserMessage
            ? {
                backgroundColor: PRIMARY_COLOR,
                borderBottomRightRadius: 0,
              }
            : {
                backgroundColor: 'white',
                borderBottomLeftRadius: 0,
              },
        ]}>
        <Text
          style={[
            styles.senderText,
            {color: isUserMessage ? 'white' : PRIMARY_COLOR},
          ]}>
          {isUserMessage ? 'You' : 'Chatbot'}
        </Text>
        <Text
          style={[
            styles.messageText,
            {color: isUserMessage ? 'white' : 'black'},
          ]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    width: '100%',
    marginBottom: 15,
  },
  messageBubble: {
    maxWidth: '90%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 2,
  },
  senderText: {
    fontSize: 14,
  },
  messageText: {
    marginTop: 5,
    fontSize: 15,
  },
});

export default Message;
