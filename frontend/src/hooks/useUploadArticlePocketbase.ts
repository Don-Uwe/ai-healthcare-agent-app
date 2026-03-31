import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {ArticleData, PocketBaseResponse} from '../type';
import {UPLOAD_ARTICLE_TO_POCKETBASE} from '../helper/APIUtils';

interface Props {
  title: string;
  articleData?: ArticleData | null;
  htmlContent: string;
}

export const useUploadArticleToPocketbase = () => {
  return useMutation({
    mutationKey: ['upload-article-to-pocketbase-key'],
    mutationFn: async ({title, articleData, htmlContent}: Props) => {
      const response = await axios.post(UPLOAD_ARTICLE_TO_POCKETBASE, {
        title: title,
        htmlContent: htmlContent,
        record_id: articleData ? articleData.pb_recordId : null,
      });

      return response.data as PocketBaseResponse;
    },
  });
};
