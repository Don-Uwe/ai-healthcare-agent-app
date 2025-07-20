import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {hp, wp} from '../helper/Metric';
import {PRIMARY_COLOR} from '../helper/Theme';

const NoInternet = ({onRetry}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Image
          source={require('../assets/no-internet-icon.png')}
          style={styles.image_wifi}
          resizeMode="contain"
        />
        <Image
          source={require('../assets/cloud-thunder-icon.png')}
          style={styles.image_cloud}
          resizeMode="contain"
        />
        <Text style={styles.title}>OOOPS !</Text>
        <Text style={styles.subtitle}>
          It seems there is something wrong with your internet connection!
        </Text>
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    maxWidth: wp(90),
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image_wifi: {
    width: wp(15),
    height: hp(7),
    alignSelf: 'flex-start',
    marginBottom: -30,
  },
  image_cloud: {
    width: wp(32),
    height: hp(15),
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '60%',
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NoInternet;
