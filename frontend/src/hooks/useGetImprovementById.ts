import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {EditRequest} from '../type';
import axios, {AxiosError} from 'axios';
import {GET_IMPROVEMENT_BY_ID} from '../helper/APIUtils';

export const useGetImprovementById = (
  requestId: string,
): UseQueryResult<EditRequest, AxiosError> => {
  return useQuery({
    queryKey: ['get-improvement-by-id', requestId],
    queryFn: async () => {
      const response = await axios.get(`${GET_IMPROVEMENT_BY_ID}/${requestId}`);

      return response.data as EditRequest;
    },
  });
};
