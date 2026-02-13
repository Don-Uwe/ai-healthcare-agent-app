import React, {Fragment, ReactNode} from 'react';
import { StatusBar, StatusBarStyle} from 'react-native';
import {PRIMARY_COLOR} from '../helper/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CustomStatusBarProps {
  children: ReactNode;
  statusBgColor?: string;
  barStyle?: StatusBarStyle;
  bgColor?: string;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  children,
  statusBgColor = PRIMARY_COLOR,
  barStyle = 'light-content',
  bgColor = PRIMARY_COLOR,
}) => {
  return (
    <Fragment>
      <StatusBar backgroundColor={statusBgColor} barStyle={barStyle} />
      <SafeAreaView style={{flex: 0, backgroundColor: statusBgColor}} />
      <SafeAreaView style={{flex: 1, backgroundColor: bgColor}}>
        {children}
      </SafeAreaView>
    </Fragment>
  );
};

export default CustomStatusBar;
