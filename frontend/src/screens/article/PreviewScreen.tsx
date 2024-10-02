import React, {useRef} from 'react';
import {StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {WebView} from 'react-native-webview';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {PreviewScreenProp} from '../../type';
import {createHTMLStructure} from '../../helper/Utils';

export default function PreviewScreen({navigation, route}: PreviewScreenProp) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {article, title, description, image, selectedGenres} = route.params;
  const webViewRef = useRef<WebView>(null);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.textWhite}>Post</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  return (
    <WebView
      style={{
        padding: 10,
        margin: 10,
        width: '99%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      ref={webViewRef}
      originWhitelist={['*']}
      source={{
        html: createHTMLStructure(title, description, selectedGenres, '', ''),
      }} // author name required
      javaScriptEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  text: {
    fontWeight: 'bold',
    fontSize: 20,
  },

  textWhite: {
    fontWeight: '600',
    fontSize: 17,
    color: 'white',
  },
  button: {
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: PRIMARY_COLOR,
    width: 75,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
});
