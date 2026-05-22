import React, {Fragment, ReactNode} from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CustomStatusBarProps {
  children: ReactNode;
  statusBgColor?: string;
  barStyle?: 'light' | 'dark' | 'auto';
  bgColor?: string;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  children,
  statusBgColor,
  barStyle,
  bgColor,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const defaultStatusBg = isDarkMode ? '#151718' : '#FFFFFF';
  const defaultBarStyle = isDarkMode ? 'light' : 'dark';
  const defaultBgColor = isDarkMode ? '#151718' : '#F0F8FF';

  const finalStatusBgColor = statusBgColor !== undefined ? statusBgColor : defaultStatusBg;
  const finalBarStyle = barStyle !== undefined ? barStyle : defaultBarStyle;
  const finalBgColor = bgColor !== undefined ? bgColor : defaultBgColor;

  return (
    <Fragment>
      <StatusBar style={finalBarStyle} backgroundColor={finalStatusBgColor} translucent={false} />
      <SafeAreaView style={{flex: 0, backgroundColor: finalStatusBgColor}} />
      <SafeAreaView style={{flex: 1, backgroundColor: finalBgColor}}>
        {children}
      </SafeAreaView>
    </Fragment>
  );
};

export default CustomStatusBar;
