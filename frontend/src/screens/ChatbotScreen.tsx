import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import {PRIMARY_COLOR} from '../helper/Theme';
import {useDispatch, useSelector} from 'react-redux';
import {
  Alert,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Tts from 'react-native-tts';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {AxiosError} from 'axios';
import {ChatBotScreenProps, Message} from '../type';
import {hp} from '../helper/Metric';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useGetProfile} from '../hooks/useGetProfile';
import {useSendMessageToGemini} from '../hooks/useSendMessageToGemini';
import {useLoadAIConversations} from '../hooks/useLoadAIChats';
import Snackbar from 'react-native-snackbar';
import {verifyChatbotResponse} from '../chatbot-response-verification';

// interface ChatbotResponse {
//   id: string;
//   created: number;
//   model: string;
//   choices: Choice[];
//   usage: Usage;
// }

// interface Usage {
//   prompt_tokens: number;
//   completion_tokens: number;
//   total_tokens: number;
// }

const ASSISTANT_USER_ID = 2;

const ChatbotScreen = ({navigation}: ChatBotScreenProps) => {
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMountedRef = useRef(true);
  const dispatch = useDispatch();
  const {data: user} = useGetProfile();
  // const token = 'GPMFAQIV2BGXCWYMCVQ3IPVXSOOLI53H5NYA'; //token

  const [activeSpeakingId, setActiveSpeakingId] = useState<string | number | null>(null);

  const initTts = async () => {
    try {
      await Tts.getInitStatus();
      const voices = await Tts.voices();
      const availableVoices = voices.filter(
        (v: any) =>
          !v.networkConnectionRequired &&
          !v.notInstalled &&
          (v.language === 'en-IN' || v.language === 'en-US' || v.language.startsWith('en')),
      );
      if (availableVoices && availableVoices.length > 0) {
        const defaultVoice = availableVoices[0];
        if (defaultVoice) {
          try {
            await Tts.setDefaultLanguage(defaultVoice.language);
          } catch (err) {
            console.warn(`Failed to set TTS language to ${defaultVoice.language}`, err);
          }
          await Tts.setDefaultVoice(defaultVoice.id);
        }
      }
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);
    } catch (error) {
      console.warn('Failed to initialize TTS voices in ChatbotScreen', error);
    }
  };

  useEffect(() => {
    initTts();

    const onStart = () => {};
    const onFinish = () => {
      setActiveSpeakingId(null);
    };
    const onCancel = () => {
      setActiveSpeakingId(null);
    };
    const onError = () => {
      setActiveSpeakingId(null);
    };

    const startSub = Tts.addEventListener('tts-start', onStart);
    const finishSub = Tts.addEventListener('tts-finish', onFinish);
    const cancelSub = Tts.addEventListener('tts-cancel', onCancel);
    const errorSub = Tts.addEventListener('tts-error', onError);

    return () => {
      Tts.stop();
      if (startSub) startSub.remove();
      if (finishSub) finishSub.remove();
      if (cancelSub) cancelSub.remove();
      if (errorSub) errorSub.remove();
    };
  }, []);

  const toggleSpeech = useCallback((message: IMessage) => {
    if (activeSpeakingId === message._id) {
      Tts.stop();
      setActiveSpeakingId(null);
    } else {
      Tts.stop();
      if (message.text) {
        setActiveSpeakingId(message._id);
        Tts.speak(message.text);
      }
    }
  }, [activeSpeakingId]);

  //console.log("User Token", user_token);

  const {mutate: sendMessageToAI, isPending: messageProcessPending} =
    useSendMessageToGemini();
  const isPending = messageProcessPending || isLoading;
  const {data: conversations, isLoading: conversationLoading} =
    useLoadAIConversations(isConnected);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetMessages = useCallback(
    (updater: React.SetStateAction<IMessage[]>) => {
      if (isMountedRef.current) {
        setMessages(updater);
      }
    },
    [],
  );

  const safeSetIsTyping = useCallback((typing: boolean) => {
    if (isMountedRef.current) {
      setIsTyping(typing);
    }
  }, []);

  useEffect(() => {
    if (conversations) {
      const refined = convertToGiftedFormat(conversations);
      safeSetMessages([
        {
          _id: refined.length + 1,
          text: "Hello! 👋 I'm here to assist you. How can I help you today?",
          createdAt: new Date(),
          user: {
            _id: ASSISTANT_USER_ID,
            avatar:
              'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
          },
        },
        ...refined.reverse(),
      ]);

      safeSetIsTyping(false);
    }
  }, [conversations, safeSetIsTyping, safeSetMessages]);

  const convertToGiftedFormat = (items: Message[]): IMessage[] => {
    return items.map(m => ({
      _id: m._id,
      text: m.text,
      createdAt: new Date(m.timestamp),
      user: {
        _id: m.role === 'user' ? 1 : ASSISTANT_USER_ID,
        avatar: m.profileImage
          ? `${GET_STORAGE_DATA}/${m.profileImage}`
          : m.role === 'assistant'
            ? 'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg'
            : undefined,
      },
    }));
  };


  const performSendMessage = useCallback((prompt: string) => {
    if (!isConnected) {
      const errorId = `error-${Date.now()}`;
      safeSetMessages(previousMessages =>
        GiftedChat.append(previousMessages, [
          {
            _id: errorId,
            text: 'Unable to connect. Please check your internet connection and try again.',
            createdAt: new Date(),
            user: {
              _id: ASSISTANT_USER_ID,
              avatar:
                'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
            },
            customError: true,
            originalPrompt: prompt,
          } as any,
        ]),
      );
      Snackbar.show({
        text: 'Please check your internet connection and try again!',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    setIsLoading(true);

    sendMessageToAI(prompt, {
      onSuccess: (responseData: Message) => {
        setIsLoading(false);
        const verification = verifyChatbotResponse(responseData.text);
        safeSetMessages(previousMessages =>
          GiftedChat.append(previousMessages, [
            {
              _id: responseData._id,
              text: responseData.text,
              createdAt: new Date(),
              user: {
                _id: ASSISTANT_USER_ID,
                avatar:
                  'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
              },
              metadata: {
                status: verification.status,
                confidence: verification.confidence,
              },
            } as any,
          ]),
        );
      },
      onError: (error: AxiosError) => {
        setIsLoading(false);
        if (!isMountedRef.current) {
          return;
        }
        console.log('Error', error);
        let errorMsg = 'Something went wrong. Please try again.';
        if (error.response) {
          const statusCode = error.response.status;
          switch (statusCode) {
            case 401:
              errorMsg = 'Unauthorized access. Please log in again.';
              break;
            case 422:
              errorMsg = 'Invalid request. Please check your input.';
              break;
            case 429:
              errorMsg = 'You’ve reached your daily limit. You can ask up to 5 questions per day';
              break;
            case 500:
              errorMsg = 'An internal server error occurred. Please try again later.';
              break;
              case 503:
  safeSetMessages(previousMessages =>
    GiftedChat.append(previousMessages, [
      {
        _id: Date.now(),
        text: "⚠️ AI service is temporarily unavailable. Please try again later.",
        createdAt: new Date(),
        user: {
          _id: ASSISTANT_USER_ID,
          avatar:
            'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo.jpg',
        },
      },
    ]),
  );
  break;
              

            default:
              errorMsg = 'An unexpected error occurred. Please try again later.';
          }
        } else {
          if (error.message === 'Network Error') {
            errorMsg = 'Unable to connect. Please check your internet connection and try again.';
          }
        }

        safeSetMessages(previousMessages =>
          GiftedChat.append(previousMessages, [
            {
              _id: `error-${Date.now()}`,
              text: errorMsg,
              createdAt: new Date(),
              user: {
                _id: ASSISTANT_USER_ID,
                avatar:
                  'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
              },
              customError: true,
              originalPrompt: prompt,
            } as any,
          ]),
        );
      },
    });
  }, [isConnected, safeSetMessages, sendMessageToAI, setIsLoading]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    if (isPending) {
      return;
    }
    const prompt = newMessages[0]?.text ?? 'AI in health within 100 words';
    
    safeSetMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages),
    );

    performSendMessage(prompt);
  }, [isPending, safeSetMessages, performSendMessage]);

  const handleRetry = useCallback((failedMessage: any) => {
    if (isPending) {
      return;
    }
    safeSetMessages(previousMessages =>
      previousMessages.filter(m => m._id !== failedMessage._id)
    );

    performSendMessage(failedMessage.originalPrompt);
  }, [isPending, safeSetMessages, performSendMessage]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}} edges={['top']}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: '#dbeafe',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={20}
              color="#3b82f6"
            />
          </View>
        </View>

        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, fontWeight: '600', color: '#111827'}}>
            Care Companion AI
          </Text>

          {(isTyping || isPending) && (
            <Text style={{fontSize: 13, color: '#3b82f6'}}>
              {isPending ? 'Generating response...' : 'typing...'}
            </Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={{flex: 1, backgroundColor: '#f9fafb'}}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{
              _id: 1,
              avatar:
                user && user?.Profile_image
                  ? `${GET_STORAGE_DATA}/${user?.Profile_image}`
                  : 'https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png',
            }}
            isTyping={isTyping || isPending}
            //alwaysShowSend={true}
            //keyboardShouldPersistTaps="handled"
            minInputToolbarHeight={52}
            maxComposerHeight={110}
            //bottomOffset={Platform.OS === "ios" ? 12 : 0}
            //messagesContainerStyle={{ paddingTop: 10 }}
            messagesContainerStyle={{
              paddingTop: 10,
              paddingBottom: 20,
            }}
            textInputProps={{
              editable: !isPending,
            }}
            renderBubble={props => {
              const currentMessage = props.currentMessage as any;
              if (currentMessage?.customError) {
                return (
                  <View style={{
                    backgroundColor: '#fee2e2',
                    borderColor: '#fca5a5',
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    marginVertical: 4,
                    maxWidth: '85%',
                    alignSelf: 'flex-start',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="alert-circle" size={20} color="#dc2626" />
                      <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 15 }}>
                        Failed to send message
                      </Text>
                    </View>
                    <Text style={{ color: '#7f1d1d', fontSize: 15, marginTop: 4, lineHeight: 22 }}>
                      {currentMessage.text}
                    </Text>
                    {currentMessage.originalPrompt && (
                      <TouchableOpacity
                        onPress={() => handleRetry(currentMessage)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#dc2626',
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          marginTop: 10,
                          alignSelf: 'flex-start',
                          gap: 6,
                        }}
                      >
                        <Ionicons name="refresh" size={16} color="white" />
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                          Retry
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
              const isAssistant = currentMessage.user?._id === ASSISTANT_USER_ID;
              const isSpeaking = activeSpeakingId === currentMessage._id;
              return (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Bubble
                    {...props}
                    wrapperStyle={{
                      right: {backgroundColor: PRIMARY_COLOR},
                      left: {backgroundColor: '#f3f4f6'},
                    }}
                    textStyle={{
                      right: {color: 'white', fontSize: 17, lineHeight: 24},
                      left: {color: '#111827', fontSize: 17, lineHeight: 24},
                    }}
                  />
                  {isAssistant && (
                    <TouchableOpacity
                      onPress={() => toggleSpeech(currentMessage)}
                      style={{
                        padding: 8,
                        marginLeft: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                      accessibilityLabel={isSpeaking ? 'Stop speaking message' : 'Listen to message'}
                    >
                      <Ionicons
                        name={isSpeaking ? 'stop-circle' : 'volume-medium'}
                        size={24}
                        color={isSpeaking ? PRIMARY_COLOR : '#6b7280'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            renderInputToolbar={props => (
              <InputToolbar
                {...props}
                containerStyle={{
                  borderWidth: 0.5,
                  borderColor: '#ccc',
                  backgroundColor: 'white',
                  borderRadius: 12,
                  paddingVertical: 10,
                  marginHorizontal: 10,
                  marginBottom: hp(2),
                }}
              />
            )}
            renderSend={props => (
              <Send
                {...props}
                containerStyle={{justifyContent: 'center'}}
              >
                <View style={{marginRight: 12, marginBottom: 8}}>
                  <Ionicons
                    name="send"
                    size={26}
                    color={
                      props.text?.trim().length && !isPending
                        ? PRIMARY_COLOR
                        : '#9ca3af'
                    }
                  />
                </View>
              </Send>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatbotScreen;
