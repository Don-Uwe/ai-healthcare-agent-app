import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArticleData } from '../type';
import { GET_ALL_ARTICLES_FOR_USER } from '../helper/APIUtils';

interface Props {
  page: number;
  selectedStatus: string;
  visit: number;
  setVisit: (v: number) => void;
  setTotalPages: (v: number) => void;
  setArticleData: React.Dispatch<React.SetStateAction<ArticleData[]>>;
  setPublishedLabel: (v: string) => void;
  setProgressLabel: (v: string) => void;
  setDiscardLabel: (v: string) => void;
}

export const useGetAllArticlesForUser = ({
  page,
  selectedStatus,
  visit,
  setVisit,
  setTotalPages,
  setArticleData,
  setPublishedLabel,
  setProgressLabel,
  setDiscardLabel,
}: Props) => {
  return useQuery({
    queryKey: ['get-all-articles-for-user', page, selectedStatus],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_ALL_ARTICLES_FOR_USER}?page=${page}&status=${selectedStatus}`
      );

      const data = response.data;

      if (Number(page) === 1 && data.totalPages) {
        setTotalPages(data.totalPages);
        setArticleData(data.articles);
      } else if (Array.isArray(data.articles)) {
        setArticleData(prev => [...prev, ...data.articles]);
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

      return data.articles as ArticleData[];
    },
    enabled: !!page,
  });
};