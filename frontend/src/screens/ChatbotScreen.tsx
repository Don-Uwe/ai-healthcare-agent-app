import React, {useCallback, useState} from 'react';
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
import {useMutation, useQuery} from '@tanstack/react-query';
import {
  CHAT_URL,
  GET_PROFILE_API,
  GET_STORAGE_DATA,
  SEND_MESSAGE_TO_GEMINI,
} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';
import {ChatBotScreenProps, Message, User} from '../type';
import {hp} from '../helper/Metric';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {showAlert} from '../store/alertSlice';

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

// interface Choice {
//   index: number;
//   message: Message;
//   finish_reason: string;
// }

const ChatbotScreen = ({navigation}: ChatBotScreenProps) => {
  const {user_id, user_token} = useSelector((state: any) => state.user);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const dispatch = useDispatch();
  // const token = 'GPMFAQIV2BGXCWYMCVQ3IPVXSOOLI53H5NYA'; //token

  //console.log("User Token", user_token);

  const convertToGiftedFormat = (items: Message[]): IMessage[] => {
    return items.map(m => ({
      _id: m._id,
      text: m.text,
      createdAt: new Date(m.timestamp),
      user: {
        _id: m.role === 'user' ? 1 : 2,
        avatar: m.profileImage
          ? `${GET_STORAGE_DATA}/${m.profileImage}`
          : m.role === 'assistant'
          ? 'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg'
          : undefined,
      },
    }));
  };

  const {
    data: user,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data.profile as User;
    },
  });

  useQuery({
    queryKey: ['load-user-conversations'],
    queryFn: async () => {
      const response = await axios.get(`${CHAT_URL}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      const d = response.data.messages as Message[];
      const refined = convertToGiftedFormat(d);
      setMessages([
        {
          _id: refined.length + 1,
          text: "Hello! 👋 I'm here to assist you. How can I help you today?",
          createdAt: new Date(),
          user: {
            _id: 2,
            avatar:
              'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
          },
        },
        ...refined.reverse(),
      ]);

      setIsTyping(false);
      return response.data.messages as Message[];
    },
  });

  const sendChatbotRequestMutation = useMutation<Message, AxiosError, string>({
    mutationKey: ['chatbot-response'],
    mutationFn: async (message: string) => {
      const response = await axios.post(
        `${SEND_MESSAGE_TO_GEMINI}`,
        {
          text: message,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data.message as Message;
    },
    onSuccess: (responseData: Message) => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [
          {
            _id: responseData._id,
            text: responseData.text,
            createdAt: new Date(),
            user: {
              _id: 2,
              avatar:
                'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
            },
          },
        ]),
      );
    },
    onError: (error: AxiosError) => {
      console.log('Error', error);
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 401:
            // Alert.alert('Authentication Error', 'Unauthorized Access');
            dispatch(
              showAlert({
                title: 'Authentication Error',
                message: 'Unauthorized access',
              }),
            );
            break;
          case 422:
            // Alert.alert(
            //   'Bad Request',
            //   'Invalid request. Please check your input.',
            // );
            dispatch(
              showAlert({
                title: 'Bad Request',
                message: 'Invalid request. Please check your input.',
              }),
            );
            break;
          case 429:
            setMessages(previousMessages =>
              GiftedChat.append(previousMessages, [
                {
                  _id: previousMessages.length + 1,
                  text: 'You’ve reached your daily limit. You can ask up to 5 questions per day',
                  createdAt: new Date(),
                  user: {
                    _id: 2,
                    avatar:
                      'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
                  },
                },
              ]),
            );
            break;

          case 500:
            //Alert.alert(
            // 'Server Error',
            // 'An internal server error occurred. Please try again later.',
            //);
            dispatch(
              showAlert({
                title: 'Server Error',
                message:
                  'An internal server error occurred. Please try again later.',
              }),
            );
            break;
          default:
            // Alert.alert(
            //   'Unknown Error',
            //   'An unexpected error occurred. Please try again later.',
            // );
            dispatch(
              showAlert({
                title: 'Unknown Error',
                message:
                  'An unexpected error occurred. Please try again later.',
              }),
            );
        }
      } else {
        if (error.message === 'Network Error') {
          // Alert.alert(
          //   'Network Error',
          //   'Unable to connect. Please check your internet connection and try again.',
          // );

          dispatch(
            showAlert({
              title: 'Network Error',
              message: 'Unable to connect. Please check your internet connection and try again.',
            }),
          );
        } else {
         // Alert.alert('Error', 'Something went wrong. Please try again.');
         dispatch(
            showAlert({
              title: 'Error',
              message: 'Something went wrong. Please try again.',
            }),
          );
        }
      }
    },
  });

  const onSend = useCallback((messages: IMessage[] = []) => {
    sendChatbotRequestMutation.mutate(messages[0]?.text ?? 'Nothing found');
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          {isTyping && (
            <Text style={{fontSize: 13, color: '#3b82f6'}}>typing...</Text>
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
            isTyping={isTyping}
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
            renderBubble={props => (
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
            )}
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
              <Send {...props} containerStyle={{justifyContent: 'center'}}>
                <View style={{marginRight: 12, marginBottom: 8}}>
                  <Ionicons
                    name="send"
                    size={26}
                    color={
                      props.text?.trim().length ? PRIMARY_COLOR : '#9ca3af'
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
