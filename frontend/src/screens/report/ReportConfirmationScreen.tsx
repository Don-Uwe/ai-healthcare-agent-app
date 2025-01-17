import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {ReportConfirmationScreenProp} from '../../type';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {hp, wp} from '../../helper/Metric';

export default function ReportConfirmationScreen({
  navigation,
  route,
}: ReportConfirmationScreenProp) {
  return (
    <View style={styles.container}>
      <Image
        style={styles.imageStyle}
        source={require('../../assets/icon.png')}
      />

      <Text style={styles.header}>Thanks for helping our community</Text>
      <Text style={styles.text}>
        Your report helps us protect the community from harmful content
      </Text>

      <Text style={styles.text2}>
        If you think someone is in immediate danger, please call your local law
        enforcement
      </Text>

      <Text style={styles.header}>What you can expect</Text>

      <Text style={styles.text2}>
        If this author has serious and repeated violations, we may temporarily
        restrict their ability to take any further actions, throughout our app.
      </Text>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => {
          navigation.navigate('TabNavigation');
        }}>
        <Text style={styles.btnText}>Ok</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 18,
  },

  header: {
    fontSize: 18,
    color: 'black',
    fontWeight: '700',
    marginVertical: 14,
  },

  text: {
    fontSize: 16,
    color: '#28282B',
    marginTop: 10,
    fontWeight: '400',
  },
  text2: {
    fontSize: 16,
    color: '#28282B',
    marginTop: 10,
    fontWeight: '400',
  },
  imageStyle: {
    height: 130,
    width: 130,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  btnText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },

  reportButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(10),
    justifyContent: 'center',
    marginVertical: 26,
    alignItems: 'center',
    borderRadius: 20,
    width: '96%',
  },
});
