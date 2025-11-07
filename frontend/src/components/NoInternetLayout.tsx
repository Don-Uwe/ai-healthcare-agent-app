import React, { JSX } from 'react';
import { Text, Image} from 'react-native';
import GlobalStyles from '../styles/GlobalStyle';
import Icon from '@expo/vector-icons/Feather';
import {BUTTON_COLOR} from '../helper/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NoInternetLayout(): JSX.Element {
  // Use useSelector with the proper type

  return (
    <SafeAreaView
      style={{
        ...GlobalStyles.container,
        ...GlobalStyles.main,
        flexDirection: 'column',
      }}>
      <Image
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
        source={require('../../assets/svg/EllipseSvg')}
      />
      <Icon
        name="wifi-off"
        size={50}
        color={BUTTON_COLOR}
        style={{marginBottom: 20}}
      />
      <Text style={GlobalStyles.text}>No internet connection</Text>
    </SafeAreaView>
  );
}


