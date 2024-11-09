import React, {useCallback, useEffect, useState} from 'react';
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import {PRIMARY_COLOR} from '../helper/Theme';
import {useSelector} from 'react-redux';
import {Alert, View, SafeAreaView,  KeyboardAvoidingView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useMutation, useQuery} from '@tanstack/react-query';
import {
  GET_PROFILE_API,
  GET_STORAGE_DATA,
  VULTR_CHAT_URL,
} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';
import {ChatBotScreenProps} from '../type';

interface ChatbotResponse {
  id: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
}

interface Message {
  role: string;
  content: string;
}

const ChatbotScreen = ({navigation}: ChatBotScreenProps) => {
  const {user_id, user_token} = useSelector((state: any) => state.user);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const token = 'GPMFAQIV2BGXCWYMCVQ3IPVXSOOLI53H5NYA'; //token

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

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: PRIMARY_COLOR,
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 15,
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
          },
          left: {
            backgroundColor: 'white',
            borderBottomRightRadius: 15,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
          },
        }}
      />
    );
  };

  const renderInputToolBar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          borderRadius: 16,
          backgroundColor: 'white',
          marginHorizontal: 8,
          marginVertical: 5,
          borderTopWidth: 0,
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={{marginBottom: 10}}>
          <Ionicons name="send" size={24} color={PRIMARY_COLOR} />
        </View>
      </Send>
    );
  };

  useEffect(() => {
    navigation.setOptions({tabBarVisible: false});
    setTimeout(() => {
      setIsTyping(false);
      setMessages([
        {
          _id: 1,
          text: "Hello! 👋 I'm here to assist you. How can I help you today?",
          createdAt: new Date(),
          user: {
            _id: 2,
            avatar:
              'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
          },
        },
      ]);
    }, 3000);
  }, []);

  const sendChatbotRequestMutation = useMutation<
    ChatbotResponse,
    AxiosError,
    string
  >({
    mutationKey: ['chatbot-response'],
    mutationFn: async (message: string) => {
      const response = await axios.post(
        `${VULTR_CHAT_URL}`,
        {
          model: 'zephyr-7b-beta-f32',
          collection: 'care_companion',
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    },
    onSuccess: (responseData: ChatbotResponse) => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, {
          _id: responseData.id,
          text: responseData.choices[0].message.content,
          createdAt: new Date(),
          user: {
            _id: 2,
            avatar:
              'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
          },
        }),
      );
    },
    onError: (error: AxiosError) => {
      console.log('Error', error);
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 401:
            Alert.alert('Authentication Error', 'Unauthorized Access');
            break;
          case 422:
            Alert.alert(
              'Bad Request',
              'Invalid request. Please check your input.',
            );
            break;
          case 500:
            Alert.alert(
              'Server Error',
              'An internal server error occurred. Please try again later.',
            );
            break;
          default:
            Alert.alert(
              'Unknown Error',
              'An unexpected error occurred. Please try again later.',
            );
        }
      } else {
        if (error.message === 'Network Error') {
          Alert.alert(
            'Network Error',
            'Unable to connect. Please check your internet connection and try again.',
          );
        } else {
          Alert.alert('Error', 'Something went wrong. Please try again.');
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
    <KeyboardAvoidingView style={{flex: 1, paddingBottom: 10}}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        renderBubble={renderBubble}
        user={{
          _id: 1,
          avatar:
            user && user?.Profile_image
              ? `${GET_STORAGE_DATA}/${user?.Profile_image}`
              : 'https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png',
        }}
        alignTop
        showUserAvatar
        isTyping={isTyping || sendChatbotRequestMutation.isPending}
        renderTime={() => null}
        renderDay={() => null}
        showAvatarForEveryMessage
        alwaysShowSend
        messagesContainerStyle={{paddingTop: 10}}
        renderInputToolbar={renderInputToolBar}
        renderSend={renderSend}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatbotScreen;
