import {useState} from 'react';
import { showAlert } from '@/src/store/alertSlice';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { UPLOAD_STORAGE } from '../helper/APIUtils';
import { fetchWithTimeout } from '../helper/ApiTimeout';

const useUploadImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const dispatch = useDispatch();

  const uploadImage = async (uri: string) => {

    try {
      setLoading(true);
      // Extract filename and type
      let filename: string = uri.split('/').pop() || `image_${Date.now()}`;
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : 'image';


      const formData = new FormData();
      formData.append('file', {uri, name: filename, type} as any);
      if (__DEV__) console.log('Type:', type);

      //formData.append('file', uri);

      const response = await fetchWithTimeout(UPLOAD_STORAGE, {
        method: 'POST',
        
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        if (__DEV__) console.log('Image upload failed with status', response.status, errorBody);
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      if (__DEV__) console.log('Image upload res', data);
      setError(false);
      return data.key as string;
    } catch (err) {
   
      if (__DEV__) console.log('Image upload failed', err);
      Alert.alert('Low network connection, failed to upload image');
    //  dispatch(showAlert({
    //        title: "Upload falied",
    //        message: 'Unable to upload image. Please check your connection.'
    //       }));
      setError(true);
      //throw err;
    } finally {
      setLoading(false);
    }
  };

  return {uploadImage, loading, error};
};

export default useUploadImage;
