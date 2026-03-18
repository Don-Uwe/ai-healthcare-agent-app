import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios from 'axios';
import {YearStatus} from '../type';
import {GET_YEARLY_WRITES_REPORT} from '../helper/APIUtils';

export const useGetAuthorYearlyWriteReport = ({
  user_id,
  selectedYear,
  userId,
  others,
  isConnected,
}: {
  user_id: string;
  selectedYear: number;
  userId?: string;
  others?: boolean;
  isConnected?: boolean;
}): UseQueryResult<YearStatus[]> => {
  return useQuery<YearStatus[]>({
    queryKey: ['get-user-yearly-write-report', user_id, userId, others],

    queryFn: async () => {
      if (selectedYear === -1) {
        return [];
      }

      let url = others
        ? `${GET_YEARLY_WRITES_REPORT}?userId=${userId}&year=${selectedYear}`
        : `${GET_YEARLY_WRITES_REPORT}?userId=${user_id}&year=${selectedYear}`;

      const response = await axios.get(url);

      return response.data.yearlyWrites as YearStatus[];
    },

    enabled: !!isConnected && !!(!userId && others) && !!(!user_id && !others),
  });
};
