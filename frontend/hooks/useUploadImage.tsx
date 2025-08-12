import {useState} from 'react';
import {UPLOAD_STORAGE} from '../src/helper/APIUtils';
import {Alert} from 'react-native';

const useUploadImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const uploadImage = async (uri: string) => {

    try {
      setLoading(true);
      // Extract filename and type
      let filename: string = uri.split('/').pop() || `image_${Date.now()}`;
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : 'image';


      const formData = new FormData();
      formData.append('file', {uri, name: filename, type});
      console.log("Type:", type);

      //formData.append('file', uri);

      const response = await fetch(UPLOAD_STORAGE, {
        method: 'POST',
        
        body: formData,
      });

      const data = await response.json();

      console.log('Image upload res', data);

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

     // const data = await response.json();
      setError(false);
      //console.log('Image upload res', data);
        return data.key as string;
    } catch (err) {
   
      console.log('Image upload failed', err);
      Alert.alert('Low network connection, failed to upload image');
      setError(true);
      //throw err;
    } finally {
      setLoading(false);
    }
  };

  return {uploadImage, loading, error};
};

export default useUploadImage;
