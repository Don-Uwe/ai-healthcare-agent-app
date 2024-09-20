import {View, Image} from 'react-native';
import React from 'react';

const ActivityOverview = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}>
      <Image
        source={{
          uri: 'https://i.ibb.co/T2WNVJZ/Whats-App-Image-2024-07-14-at-12-46-02-AM-1.jpg',
        }}
        style={{width: '95%', height: 600, resizeMode: 'contain'}}
      />
    </View>
  );
};



export default ActivityOverview;
