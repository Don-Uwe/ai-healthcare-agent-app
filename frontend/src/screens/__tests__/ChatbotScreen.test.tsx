import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import ChatbotScreen from '../ChatbotScreen';
import {GiftedChat} from 'react-native-gifted-chat';

jest.mock('react-native-gifted-chat', () => {
  const React = require('react');
  const {View, Text, TextInput} = require('react-native');
  
  const GiftedChatMock = ({messages, onSend, renderBubble, isTyping}: any) => {
    return (
      <View testID="mock-gifted-chat">
        {isTyping && <Text testID="typing-indicator">typing animation</Text>}
        <View testID="messages-list">
          {messages.map((m: any) => {
            if (renderBubble) {
              return (
                <View key={m._id} testID={`bubble-container-${m._id}`}>
                  {renderBubble({currentMessage: m})}
                </View>
              );
            }
            return (
              <View key={m._id} testID={`bubble-${m._id}`}>
                <Text>{m.text}</Text>
              </View>
            );
          })}
        </View>
        <TextInput
          testID="chat-input"
          onSubmitEditing={(e: any) => onSend([{text: e.nativeEvent.text, _id: Date.now(), createdAt: new Date(), user: {_id: 1}}])}
        />
      </View>
    );
  };

  GiftedChatMock.append = (currentMessages: any[] = [], newMessages: any[], invert = true) => {
    if (invert) {
      return [...newMessages, ...currentMessages];
    }
    return [...currentMessages, ...newMessages];
  };

  const BubbleMock = ({currentMessage}: any) => {
    return (
      <View testID={`bubble-${currentMessage._id}`}>
        <Text>{currentMessage.text}</Text>
      </View>
    );
  };

  return {
    GiftedChat: GiftedChatMock,
    Bubble: BubbleMock,
    Send: ({children}: any) => children,
    InputToolbar: ({children}: any) => children,
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSendMessageToAI = jest.fn();

jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return ({name}: any) => React.createElement(Text, null, name);
});

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return ({name}: any) => React.createElement(Text, null, name);
});

jest.mock('react-native-snackbar', () => ({
  show: jest.fn(),
  LENGTH_SHORT: 0,
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('../../hooks/useGetProfile', () => ({
  useGetProfile: jest.fn(() => ({
    data: {Profile_image: 'user_avatar.png'},
  })),
}));

jest.mock('../../hooks/useSendMessageToGemini', () => ({
  useSendMessageToGemini: jest.fn(),
}));

jest.mock('../../hooks/useLoadAIChats', () => ({
  useLoadAIConversations: jest.fn(),
}));

const mockUseSelector = require('react-redux').useSelector as jest.Mock;
const mockUseSendMessageToGemini = require('../../hooks/useSendMessageToGemini').useSendMessageToGemini as jest.Mock;
const mockUseLoadAIConversations = require('../../hooks/useLoadAIChats').useLoadAIConversations as jest.Mock;

describe('ChatbotScreen', () => {
  let initialConversations: any[];

  beforeEach(() => {
    jest.clearAllMocks();
    initialConversations = [];

    mockUseSelector.mockImplementation((selector: any) =>
      selector({
        user: {
          user_id: 'user-1',
          user_token: 'token-xyz',
        },
        network: {
          isConnected: true,
        },
      }),
    );

    mockUseLoadAIConversations.mockReturnValue({
      data: initialConversations,
      isLoading: false,
    });

    mockUseSendMessageToGemini.mockReturnValue({
      mutate: mockSendMessageToAI,
      isPending: false,
    });
  });

  const renderScreen = () =>
    render(
      <ChatbotScreen
        navigation={{navigate: mockNavigate, goBack: mockGoBack} as any}
        route={{} as any}
      />,
    );

  it('renders the chatbot title and the default welcome message', () => {
    const {getByText} = renderScreen();
    expect(getByText('Care Companion AI')).toBeTruthy();
    expect(getByText("Hello! 👋 I'm here to assist you. How can I help you today?")).toBeTruthy();
  });

  it('shows the typing indicator and status when a message is pending', () => {
    mockUseSendMessageToGemini.mockReturnValue({
      mutate: mockSendMessageToAI,
      isPending: true, // Simulate pending response
    });

    const {getByText} = renderScreen();
    expect(getByText('Generating response...')).toBeTruthy();
  });

  it('appends an error message card if the AI request fails', async () => {
    let onErrorCallback: any = null;
    mockSendMessageToAI.mockImplementation((prompt: string, options: any) => {
      onErrorCallback = options.onError;
    });

    const {getByTestId, getByText, findByText} = renderScreen();

    // Trigger onSend
    const giftedChat = getByTestId('mock-gifted-chat');
    fireEvent(giftedChat, 'onSend', [{text: 'What is stress?', _id: 1, createdAt: new Date(), user: {_id: 1}}]);

    expect(mockSendMessageToAI).toHaveBeenCalledWith('What is stress?', expect.any(Object));

    // Simulate API Error
    const mockAxiosError = {
      response: {
        status: 500,
      },
    };

    expect(onErrorCallback).toBeTruthy();
    onErrorCallback(mockAxiosError);

    // Verify error card is displayed in-line
    const errorTitle = await findByText('Failed to send message');
    const errorText = getByText('An internal server error occurred. Please try again later.');
    const retryBtn = getByText('Retry');

    expect(errorTitle).toBeTruthy();
    expect(errorText).toBeTruthy();
    expect(retryBtn).toBeTruthy();
  });

  it('allows retrying a failed message', async () => {
    let onErrorCallback: any = null;
    mockSendMessageToAI.mockImplementation((prompt: string, options: any) => {
      onErrorCallback = options.onError;
    });

    const {getByTestId, getByText, findByText, queryByText} = renderScreen();

    // 1. Send first message
    const giftedChat = getByTestId('mock-gifted-chat');
    fireEvent(giftedChat, 'onSend', [{text: 'My knee hurts', _id: 1, createdAt: new Date(), user: {_id: 1}}]);

    // 2. Trigger error
    const mockAxiosError = {
      response: {
        status: 500,
      },
    };
    onErrorCallback(mockAxiosError);

    const retryBtn = await findByText('Retry');

    // Reset calls count
    mockSendMessageToAI.mockClear();

    // 3. Press retry
    fireEvent.press(retryBtn);

    // Verify error card is removed and message is re-sent
    expect(queryByText('Failed to send message')).toBeNull();
    expect(mockSendMessageToAI).toHaveBeenCalledWith('My knee hurts', expect.any(Object));
  });

  it('shows an error bubble and snackbar if message sent when offline', async () => {
    mockUseSelector.mockImplementation((selector: any) =>
      selector({
        user: {
          user_id: 'user-1',
          user_token: 'token-xyz',
        },
        network: {
          isConnected: false, // Simulating offline state
        },
      }),
    );

    const {getByTestId, getByText} = renderScreen();

    // Trigger onSend
    const giftedChat = getByTestId('mock-gifted-chat');
    fireEvent(giftedChat, 'onSend', [{text: 'Hello when offline', _id: 1, createdAt: new Date(), user: {_id: 1}}]);

    // Verify it appends the offline error bubble directly
    expect(getByText('Failed to send message')).toBeTruthy();
    expect(getByText('Unable to connect. Please check your internet connection and try again.')).toBeTruthy();
    expect(mockSendMessageToAI).not.toHaveBeenCalled();
  });
});
