import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {CHECK_USER_HANDLE} from '../helper/APIUtils';

type CheckUserHandleResponse = {
  status?: boolean;
  message?: string;
};

export type UserHandleAvailability = {
  isAvailable: boolean;
  isTaken: boolean;
  message: string;
};

/**
 * Determines user handle availability from the API response.
 *
 * API contract:
 * - Available handle: { status: false, message: "User handle is available." }
 * - Taken handle:     { status: true, message: "User handle is already in use." }
 *
 * The function uses message-based detection as the primary check,
 * with the `status` field as a fallback.
 */
const getUserHandleAvailability = (
  data: CheckUserHandleResponse,
): UserHandleAvailability => {
  const message = data.message?.toLowerCase() ?? '';

  const hasTakenMessage =
    message.includes('already') ||
    message.includes('in use') ||
    message.includes('taken') ||
    message.includes('exist') ||
    message.includes('unavailable') ||
    message.includes('not available');

  const hasAvailableMessage =
    message.includes('available') && !hasTakenMessage;

  let isAvailable: boolean;

  if (hasAvailableMessage) {
    // Message explicitly says the handle is available
    isAvailable = true;
  } else if (hasTakenMessage) {
    // Message explicitly says the handle is taken
    isAvailable = false;
  } else {
    // Fallback to status field: status === false means handle is available
    isAvailable = data.status === false;
  }

  return {
    isAvailable,
    isTaken: !isAvailable,
    message: data.message ?? '',
  };
};

export const useCheckUserHandleAvailability = (handle: string) => {
  const trimmedHandle = handle.trim();

  return useQuery<UserHandleAvailability>({
    queryKey: ['check-user-handle', trimmedHandle],
    queryFn: async () => {
      const response = await axios.post(CHECK_USER_HANDLE, {
        userHandle: trimmedHandle,
      });

      return getUserHandleAvailability(response.data);
    },
    enabled: trimmedHandle.length > 2,
    retry: false,
  });
};
