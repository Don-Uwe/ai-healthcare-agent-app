import {useState} from 'react';
import axios from 'axios';
import {UPLOAD_STORAGE} from '../src/helper/APIUtils';

const useUploadImage = () => {
  const [loading, setLoading] = useState(false);

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      // Extract filename and type
      let filename: string = uri.split('/').pop() || 'image';
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('recFile', {uri, name: filename, type});

      const response = await axios.post(UPLOAD_STORAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.key as string;
    } catch (err) {
      console.error('Image upload failed', err);
      //throw err;
    } finally {
      setLoading(false);
    }
  };

  return {uploadImage, loading};
};

export default useUploadImage;
