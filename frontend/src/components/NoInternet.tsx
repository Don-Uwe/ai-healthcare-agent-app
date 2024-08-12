import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {hp, wp} from '../helper/Metric';
import {PRIMARY_COLOR} from '../helper/Theme';

const NoInternet = ({onRetry}) => {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Image
          source={require('../assets/no-internet-icon.png')}
          style={styles.image_wifi}
        />
        <Image
          source={require('../assets/cloud-thunder-icon.png')}
          style={styles.image_cloud}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 30,
    padding: 25,
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
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 50,
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '50%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NoInternet;
