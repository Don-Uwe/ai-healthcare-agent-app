import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {GET_REPORT_REASONS} from '../helper/APIUtils';
import {ReportReason} from '../type';

const reasonsFunc = async () => {
  try{
    const {data: categoryData} = await axios.get(
    GET_REPORT_REASONS
  );

  return categoryData as ReportReason[];
  }catch(err){
    console.log("GET CATEGORY ERR", err);
    return null;
  }
};

export const useGetReasons = (isConnected: boolean): UseQueryResult<
  ReportReason[] | null,
  AxiosError
> => {
  return useQuery({
    queryKey: ['get-report-reasons'],
    queryFn: reasonsFunc,
    enabled: isConnected
  });
};
