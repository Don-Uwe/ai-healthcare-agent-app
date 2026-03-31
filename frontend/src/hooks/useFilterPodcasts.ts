import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {Category, PodcastData} from '../type';
import axios, {AxiosError} from 'axios';
import {FILTER_PODCAST} from '../helper/APIUtils';

type FilterReq = {
  selectedCategoryList: Category[];
  sortingType: string;
};
export const useFilterPodcasts = (): UseMutationResult<
  PodcastData[],
  AxiosError,
  FilterReq
> => {
  return useMutation({
    mutationKey: ['apply-filter-on-podcast'],
    mutationFn: async (req: FilterReq) => {
      const res = await axios.post(FILTER_PODCAST, {
        tags: req.selectedCategoryList.map(item => item._id),
        sortType: req.sortingType === 'oldest' ? 0 : -1,
      });
      return res.data as PodcastData[];
    },
  });
};
