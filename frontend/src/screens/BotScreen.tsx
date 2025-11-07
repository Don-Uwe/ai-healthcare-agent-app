import {useEffect, useState} from 'react';
import { BackHandler} from 'react-native';
import BpWidget from '../components/Bots/BpWidget';
import BpIncommingMessagesListener from '../components/Bots/BpIncomingMessageListener';
import {useRef} from 'react';
import {useSelector} from 'react-redux';
import GlobalStyles from '../styles/GlobalStyle';
import NoInternetLayout from '../components/NoInternetLayout';
import CustomStatusBar from '../components/CustomStatusBar';
import Loader from '../components/Loader';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BotScreen({navigation}) {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); 

    return () => {
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const backAction = () => {
    navigation.goBack();
    return true;
  };

  const botpressWebChatRef = useRef();
  const isConnected = useSelector(state => state.network.isConnected);
  const testingConfig = {
    composerPlaceholder: 'Talk with our assistance',
    botConversationDescription:
      'This chatbot was built surprisingly fast with Botpress',
    botId: '33aeb8de-fd6e-47c7-afc7-c4aef40930f3',
    hostUrl: 'https://cdn.botpress.cloud/webchat/v1',
    messagingUrl: 'https://messaging.botpress.cloud',
    clientId: '33aeb8de-fd6e-47c7-afc7-c4aef40930f3',
    webhookId: '5a69a81e-b214-4598-bf08-90aedbe72116',
    lazySocket: true,
    themeName: 'prism',
    stylesheet:
      'https://webchat-styler-css.botpress.app/prod/code/4971646c-0b82-4e1d-80a1-64cc5881a4d2/v73813/style.css',
    frontendVersion: 'v1',
    showPoweredBy: true,
    theme: 'prism',
    themeColor: '#2563eb',
  };

  if (isConnected) {
    return (
      <CustomStatusBar>
        <SafeAreaView
          style={{...GlobalStyles.container, flexDirection: 'column'}}>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <BpWidget
                ref={botpressWebChatRef}
                botConfig={testingConfig}
                onMessage={event => {
                  console.log('event from widget', event);
                }}
              />
              {/**
          <Button
            onPress={sendEvent}
            title="Toggle webchat"
          />

          <Button
            onPress={sendPayload}
            title="send message"
          />
           */}

              {/* In case your webchat is not rendered and you want to catch bot messages */}
              <BpIncommingMessagesListener
                botConfig={testingConfig}
                onBotMessage={event => {
                  console.log('bot message', event);
                }}
              />
            </>
          )}
        </SafeAreaView>
      </CustomStatusBar>
    );
  } else {
    return isLoading ? <Loader /> : <NoInternetLayout />;
  }
}
