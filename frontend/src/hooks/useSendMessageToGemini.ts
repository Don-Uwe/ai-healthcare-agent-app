import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {Message} from '../type';
import {SEND_MESSAGE_TO_GEMINI} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';

export const useSendMessageToGemini = (): UseMutationResult<
  Message,
  AxiosError,
  string
> => {
  return useMutation({
    mutationKey: ['chatbot-response'],
    mutationFn: async (message: string) => {
      const response = await axios.post(`${SEND_MESSAGE_TO_GEMINI}`, {
        text: message,
      });
      return response.data.message as Message;
    },
  });
};
