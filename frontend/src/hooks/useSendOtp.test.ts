import axios from 'axios';
import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {useSendOtpMutation} from '../useSendOtp';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
  });
  return ({children}: {children: React.ReactNode}) =>
    React.createElement(QueryClientProvider, {client: queryClient}, children);
}

describe('useSendOtpMutation', () => {
  afterEach(() => jest.clearAllMocks());

  it('does NOT return an otp field from the mutation result', async () => {
    // Backend returns otp in body (current server behaviour before backend fix)
    mockedAxios.post.mockResolvedValueOnce({
      data: {message: 'OTP sent', otp: '123456'},
    });

    const {result} = renderHook(() => useSendOtpMutation(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate({email: 'test@example.com'});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The hook must resolve to void — not the otp string
    expect(result.current.data).toBeUndefined();
  });

  it('resolves to void on a clean success response', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {message: 'OTP sent'},
    });

    const {result} = renderHook(() => useSendOtpMutation(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate({email: 'user@example.com'});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeUndefined();
  });

  it('propagates network errors via onError', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.post.mockRejectedValueOnce(networkError);

    const {result} = renderHook(() => useSendOtpMutation(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate({email: 'user@example.com'});

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });

  it('posts to the correct endpoint with the provided email', async () => {
    mockedAxios.post.mockResolvedValueOnce({data: {message: 'OTP sent'}});

    const {result} = renderHook(() => useSendOtpMutation(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate({email: 'check@example.com'});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('forgotpassword'),
      {email: 'check@example.com'},
    );
  });
});