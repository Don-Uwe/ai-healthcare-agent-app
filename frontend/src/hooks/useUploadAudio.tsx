import { useState } from 'react';
import { Alert } from 'react-native';
import { getMimeTypes } from '../helper/Utils';
import { UPLOAD_STORAGE } from '../helper/APIUtils';
import { fetchWithTimeout } from '../helper/ApiTimeout';


const useUploadAudio = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
 // const dispatch = useDispatch();

  const uploadAudio = async (uri: string) => {
    let type = '';
    try {
      setLoading(true);

      let filename = uri.split('/').pop() || `audio_${Date.now()}`;
      
      if (!filename.includes('.')) {
        filename += '.wav';
      }
      let match = /\.(\w+)$/.exec(filename);
      let ext = match ? match[1].toLowerCase() : 'wav';

      type = getMimeTypes(ext) || `audio/${ext}`;

      // If still unknown, default to WAV
      if (!type || type === 'application/octet-stream') {
        type = 'audio/wav';
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: uri.startsWith('file://') ? uri : `file://${uri}`,
        name: filename,
        type
      } as any);

      if (__DEV__) console.log(`Uploading audio: ${filename} (${type})`);

      const response = await fetchWithTimeout(UPLOAD_STORAGE, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorBody = await response.text();
        if (__DEV__) console.log('Audio upload failed with status', response.status, errorBody);
        throw new Error('Audio upload failed');
      }

      const data = await response.json();
      if (__DEV__) console.log('Audio upload response:', data);
      setError(false);
      return data.key as string;

    } catch (err) {
      if (__DEV__) console.log('Audio upload failed', err);
      Alert.alert('Upload failed', 'Unable to upload audio. Please check your connection.');
    //  dispatch(showAlert({
    //   title: "Upload falied",
    //   message: 'Unable to upload audio. Please check your connection.'
    //  }));
     
      setError(true);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadAudio, loading, error };
};

export default useUploadAudio;
