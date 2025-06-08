import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {RenderSuggestionProp} from '../../type';
import WebView from 'react-native-webview';
import {createHTMLStructure} from '../../helper/Utils';
import {useRef} from 'react';
import {useDispatch} from 'react-redux';
import {setSuggestionAccepted} from '../../store/articleSlice';

export default function RenderSuggestion({
  navigation,
  route,
}: RenderSuggestionProp) {
  const {htmlContent} = route.params;
  const dispatch = useDispatch();
  const webViewRef = useRef<WebView>(null);

  const handleAccept = () => {
    dispatch(setSuggestionAccepted({selection: true}));
    navigation.goBack();
  };

  const handleCancel = () => {
    dispatch(setSuggestionAccepted({selection: false}));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <WebView
        style={{
          padding: 20,
          margin: 10,
          width: '99%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{
          html: createHTMLStructure('', htmlContent, [], '', ''),
        }} // author name required
        javaScriptEnabled={true}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  webview: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
