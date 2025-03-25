import React from 'react';
import {View} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import getBotpressWebchat from './getBotpressWebchat';

interface BotConfig {
  botId: string;
  // Add any other properties from botConfig if needed
}

interface BpIncommingMessagesListenerProps {
  botConfig: BotConfig;
  onMessage: (event: WebViewMessageEvent) => void;
}

const broadcastBotMessages = `  
window.botpressWebChat.onEvent(
  (event) => {
    window.ReactNativeWebView.postMessage(JSON.stringify(event));
  },
  ['MESSAGE_RECEIVED']
);
true; // note: this is required, or you'll sometimes get silent failures
`;

const BpIncommingMessagesListener: React.FC<
  BpIncommingMessagesListenerProps
> = props => {
  const {botConfig, onMessage} = props;

  const {html, baseUrl} = getBotpressWebchat(botConfig, false);

  return (
    <View style={{position: 'absolute', top: 0, left: 0}}>
      <WebView
        source={{
          baseUrl,
          html,
        }}
        onMessage={onMessage} // Fixed: the correct prop is onMessage
        injectedJavaScript={broadcastBotMessages}
      />
    </View>
  );
};

export default BpIncommingMessagesListener;
