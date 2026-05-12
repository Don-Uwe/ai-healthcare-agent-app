
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GET_SOCIALS } from '../helper/APIUtils';
import { User } from '../type';
import { useSelector } from 'react-redux';

interface Props {
  type: number;
  articleId?: number;
  social_user_id?: string;
}

export const useGetUserSocials = ({
  type,
  articleId,
  social_user_id,
}: Props) => {
  const isGuest = useSelector((state: any) => state.user.isGuest);

  return useQuery({
    queryKey: ['get-user-socials', type, articleId, social_user_id],
    queryFn: async () => {
      let url = articleId
        ? `${GET_SOCIALS}?type=${type}&articleId=${articleId}`
        : `${GET_SOCIALS}?type=${type}`;

      if (social_user_id && social_user_id !== '') {
        url = `${url}&social_user_id=${social_user_id}`;
      }

      console.log('Request Url', url);

      const response = await axios.get(url);

      return response.data.followers as User[];
    },
    enabled:  !!type && !isGuest,
  });
};