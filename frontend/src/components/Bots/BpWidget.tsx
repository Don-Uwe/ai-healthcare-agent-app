import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {useSelector} from 'react-redux';
import getBotpressWebchat from './getBotpressWebchat';
import { ON_PRIMARY_COLOR, PRIMARY_COLOR } from '../../helper/Theme';

interface BotConfig {
  botId: string;
  // Add other properties that may exist in botConfig if needed
}

interface BpWidgetProps {
  botConfig: BotConfig;
  onMessage: (event: WebViewMessageEvent) => void;
}

interface BpWidgetRef {
  sendEvent: (event: Record<string, any>) => void;
  sendPayload: (payload: Record<string, any>) => void;
  mergeConfig: (config: Record<string, any>) => void;
}

const broadcastAllNotifications = `
window.botpressWebChat.onEvent(
  (event) => {
    window.ReactNativeWebView.postMessage(JSON.stringify(event));
  },
  ['*']
);

true; // note: this is required, or you'll sometimes get silent failures
`;

const BpWidget = forwardRef<BpWidgetRef, BpWidgetProps>((props, ref) => {
  const webref = useRef<WebView>(null);

  const {botConfig, onMessage} = props;
  const theme = useSelector((state: any) => state.network.theme); // Update 'state' type if you have a specific structure

  const {html, baseUrl} = getBotpressWebchat(botConfig);

  const invokeBotpressMethod = (method: string, ...args: any[]) => {
    if (!webref.current) {
      console.log('Webview must be loaded to run commands');
      return;
    }
    const run = `
    window.botpressWebChat.${method}(${args
      .map(arg => JSON.stringify(arg))
      .join(',')});
    true;
    `;
    webref.current.injectJavaScript(run);
  };

  // Expose sendEvent method with react ref
  useImperativeHandle(ref, () => ({
    sendEvent: (event: Record<string, any>) => {
      invokeBotpressMethod('sendEvent', event);
    },
    sendPayload: (payload: Record<string, any>) => {
      invokeBotpressMethod('sendPayload', payload);
    },
    mergeConfig: (config: Record<string, any>) => {
      invokeBotpressMethod('mergeConfig', config);
    },
  }));

  return (
    <WebView
      ref={webref}
      style={{flex: 1, backgroundColor: PRIMARY_COLOR}}
      source={{
        baseUrl,
        html,
      }}
      onMessage={onMessage}
      injectedJavaScript={broadcastAllNotifications}
    />
  );
});

export default BpWidget;
