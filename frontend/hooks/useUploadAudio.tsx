import { useState } from 'react';
import { Alert } from 'react-native';
import { UPLOAD_STORAGE } from '../src/helper/APIUtils';
import { getMimeTypes } from '../src/helper/Utils';
import { showAlert } from "../src/store/alertSlice";
import { useDispatch } from 'react-redux';

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
      });

      console.log(`Uploading audio: ${filename} (${type})`);

      const response = await fetch(UPLOAD_STORAGE, {
        method: 'POST',
        body: formData
      });

      //const rawText = await response.text();
      //console.log('Raw response text:', rawText);
      const data = await response.json();
      console.log('Audio upload response:', data);

      if (!response.ok) {
        throw new Error('Audio upload failed');
      }

      setError(false);
      return data.key as string;

    } catch (err) {
      console.log('Audio upload failed', err);
      Alert.alert('Upload failed', 'Unable to upload audio. Please check your connection.');
    //  dispatch(showAlert({
    //   title: "Upload falied",
    //   message: 'Unable to upload audio. Please check your connection.'
    //  }));
     
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return { uploadAudio, loading, error };
};

export default useUploadAudio;
