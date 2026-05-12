import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GET_IMPROVEMENT_CONTENT } from '../helper/APIUtils';
import { useSelector } from 'react-redux';

interface Props {
  recordId?: string;
  articleRecordId?: string;
}

export const useGetImprovementContent = ({
  recordId,
  articleRecordId,
}: Props) => {
  const isGuest = useSelector((state: any) => state.user.isGuest);

  return useQuery({
    queryKey: ['get-improvement-content', recordId, articleRecordId],
    queryFn: async () => {
      let url = '';

      if (recordId) {
        url = `${GET_IMPROVEMENT_CONTENT}?articleRecordId=${articleRecordId}`;
      } else {
        url = `${GET_IMPROVEMENT_CONTENT}?recordid=${recordId}&articleRecordId=${articleRecordId}`;
      }

      const response = await axios.get(url);

      return response.data.htmlContent as string;
    },
    enabled: !!articleRecordId && !isGuest,
  });
};