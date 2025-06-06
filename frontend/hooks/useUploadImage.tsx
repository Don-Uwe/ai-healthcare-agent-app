import {useState} from 'react';
import axios from 'axios';
import {UPLOAD_STORAGE} from '../src/helper/APIUtils';
import {Alert} from 'react-native';

const useUploadImage = () => {
  const [loading, setLoading] = useState(false);

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      // Extract filename and type
      let filename: string = uri.split('/').pop() || 'image';
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : 'image';

      const formData = new FormData();
      formData.append('file', {uri, name: filename, type});

      //formData.append('file', uri);

      const response = await axios.post(UPLOAD_STORAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      //  console.log('Image upload res', response.data);
      return response.data.key as string;
    } catch (err) {
      console.log('Image upload failed', err);
      Alert.alert('Low network connection, failed to upload image');
      //throw err;
    } finally {
      setLoading(false);
    }
  };

  return {uploadImage, loading};
};

export default useUploadImage;
