import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { EditRequest } from '../type';
import { GET_ALL_IMPROVEMENTS_FOR_USER } from '../helper/APIUtils';

interface Props {
  page: number;
  selectedStatus: string;
  visit: number;
  setVisit: (v: number) => void;
  setTotalPages: (v: number) => void;
  setImprovementData: React.Dispatch<React.SetStateAction<EditRequest[]>>;
  setPublishedLabel: (v: string) => void;
  setProgressLabel: (v: string) => void;
  setDiscardLabel: (v: string) => void;
}

export const useGetAllImprovementsForReview = ({
  page,
  selectedStatus,
  visit,
  setVisit,
  setTotalPages,
  setImprovementData,
  setPublishedLabel,
  setProgressLabel,
  setDiscardLabel,
}: Props) => {
  return useQuery({
    queryKey: ['get-all-improvements-for-review', page, selectedStatus],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_ALL_IMPROVEMENTS_FOR_USER}?page=${page}&status=${selectedStatus}`
      );

      const data = response.data;

      if (Number(page) === 1 && data.totalPages) {
        setTotalPages(data.totalPages);
        setImprovementData(data.articles);
      } else if (data.articles) {
        setImprovementData(prev => [...prev, ...data.articles]);
      }

      if (Number(visit) === 1) {
        if (data.publishedCount) {
          setPublishedLabel(`Published(${data.publishedCount})`);
        }

        if (data.progressCount) {
          setProgressLabel(`Progress(${data.progressCount})`);
        }

        if (data.discardCount) {
          setDiscardLabel(`Discarded(${data.discardCount})`);
        }

        setVisit(0);
      }

      return data.articles as EditRequest[];
    },
    enabled:  !!page,
  });
};