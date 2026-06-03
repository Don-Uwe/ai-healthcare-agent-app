import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {CHECK_USER_HANDLE} from '../helper/APIUtils';

export type HandleAvailabilityResult = {
  isAvailable: boolean;
  message: string;
};

/**
 * Normalizes the API response into a stable contract.
 *
 * API contract:
 * - Available handle: { status: false, message: "User handle is available." }
 * - Taken handle:     { status: true, message: "User handle is already in use." }
 *
 * status === false means the handle does NOT exist in the DB, i.e. it's available.
 */
function parseAvailabilityResponse(data: {
  status?: boolean;
  message?: string;
}): HandleAvailabilityResult {
  return {
    isAvailable: data.status === false,
    message: data.message ?? (data.status === false ? 'Handle is available' : 'Handle is unavailable'),
  };
}

export const useCheckUserHandleAvailability = (handle: string) => {
  const trimmedHandle = handle.trim();

  return useQuery<HandleAvailabilityResult>({
    queryKey: ['check-user-handle', trimmedHandle],
    queryFn: async () => {
      const response = await axios.post(CHECK_USER_HANDLE, {
        userHandle: trimmedHandle,
      });

      return parseAvailabilityResponse(response.data);
    },
    enabled: trimmedHandle.length > 2,
    retry: false,
  });
};
