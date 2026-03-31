import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {ARTICLE_TAGS_API, PROD_URL} from '../helper/APIUtils';
import {Category} from '../type';

const categoryFunc = async () => {
  try{
     const {data: categoryData} = await axios.get(
    `${PROD_URL + ARTICLE_TAGS_API}`,
  );

  return categoryData as Category[];
  }catch(err){
    console.log("GET CATEGORY ERR", err);
    return null;
  }
};

export const useGetCategories = (isConnected: boolean): UseQueryResult<
  Category[] | null,
  AxiosError
> => {
  return useQuery({
    queryKey: ['get-categories'],
    queryFn: categoryFunc,
    enabled: isConnected
  });
};
