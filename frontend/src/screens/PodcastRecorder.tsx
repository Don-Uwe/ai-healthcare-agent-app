import {useCallback, useEffect, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
  Alert,
} from 'react-native';
//import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import SoundWave from '../components/SoundWave';
import {PodcastRecorderScreenProps} from '../type';
import RNFS from 'react-native-fs';
import AmplitudeWave from '../components/AmplitudeWave';
import {useMutation} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import axios from 'axios';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Snackbar from 'react-native-snackbar';

import {UPLOAD_PODCAST} from '../helper/APIUtils';
import useUploadImage from '../../hooks/useUploadImage';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import useUploadAudio from '../../hooks/useUploadAudio';
import Slider from '@react-native-community/slider';
import {BUTTON_COLOR} from '../helper/Theme';

//const {AudioModule} = NativeModules;
//const AudioModule = NativeModules.AudioModule;
//const emitter = new NativeEventEmitter(AudioModule);
import {requireNativeModule} from 'expo-modules-core';
import {useAudioPlayer} from 'expo-audio';

const AudioModule = requireNativeModule('AudioModule');

const PodcastRecorder = ({navigation, route}: PodcastRecorderScreenProps) => {
  const [recording, setRecording] = useState(false);
  const {uploadImage, loading, error: imageError} = useUploadImage();
  const {uploadAudio, loading: audioLoading, error} = useUploadAudio();
  const [recordTime, setRecordTime] = useState('00:00:00');
  const {title, description, selectedGenres, imageUtils} = route.params;
  const [filePath, setFilePath] = useState<string | null>(null);
  //const [elapsedMs, setElapsedMs] = useState(0);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  //const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const recordStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef(null);

  const player = useAudioPlayer(
    filePath
      ? filePath
      : require('../../assets/sounds/funny-cartoon-sound-397415.mp3'),
  );

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSec % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatSecTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${
        secs < 10 ? '0' : ''
      }${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };

  const startTimer = () => {
    recordStartTimeRef.current = Date.now();
    if (timerRef && timerRef.current) {
      timerRef.current = setInterval(() => {
        if (recordStartTimeRef.current) {
          const elapsed = Date.now() - recordStartTimeRef.current;
          setRecordTime(formatTime(elapsed));
        }
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    recordStartTimeRef.current = null;
  };

  const startRecording = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      if (
        granted['android.permission.RECORD_AUDIO'] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.warn('Permission denied');
        return;
      }
    }

    try {
      const path: string = await AudioModule.startRecording();
      console.log('File path', path);
      setFilePath(path);
      setRecording(true);
      //setElapsedMs(0);
      startTimer();
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  };

  const stopRecording = async () => {
    try {
      await AudioModule.stopRecording();
      setRecording(false);
      stopTimer();
      console.log('Recording saved at:', filePath);
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }
  };

  // UI State: 'idle' | 'recording' | 'review' | 'playing' | 'paused' | 'uploading'
  const [uiState, setUiState] = useState<
    'idle' | 'recording' | 'review' | 'playing' | 'paused' | 'uploading'
  >('idle');
  const [uploading, setUploading] = useState(false);

  // Handle transitions
  const handleStartRecording = async () => {
    await startRecording();
    setUiState('recording');
  };

  const handleStopRecording = async () => {
    await stopRecording();
    setUiState('review');
  };

  const handlePlay = async () => {
    if (!player) return;

    player.play();
    setUiState('playing');
  };

  const handlePause = async () => {
    if (!player) return;

    player.pause();
    setUiState('paused');
  };

  const handleStopPlay = async () => {
    await stopPlay();
    setUiState('review');
  };

  const handleReRecord = async () => {
    if (filePath) {
      try {
        const exists = await RNFS.exists(filePath);
        if (exists) {
          await RNFS.unlink(filePath);
          console.log('File deleted:', filePath);
        }
      } catch (err) {
        console.warn('Error deleting file:', err);
      }
    }
    setFilePath(null);
    // unlink file path
    setAmplitudes([]);
    setRecordTime('00:00:00');
    setUiState('idle');
  };

  const unlinkFile = useCallback(async () => {
    if (filePath) {
      try {
        const exists = await RNFS.exists(filePath);
        if (exists) {
          await RNFS.unlink(filePath);
          console.log('File deleted:', filePath);
        }
      } catch (err) {
        console.warn('Error deleting file:', err);
      }
    }
  }, [filePath]);
  
  const handleUpload = useCallback(async () => {
    setUploading(false);
    setUiState('idle');
    setFilePath(null);
    setAmplitudes([]);
    setRecordTime('00:00:00');
    await unlinkFile();
  },[unlinkFile]);

  const stopPlay =  () => {
    try {
       player.remove();
    } catch (e) {
      console.error('Error stopping playback:', e);
    }
  };

  useEffect(() => {
    const stopSub = DeviceEventEmitter.addListener('recStop', data => {
      console.log('File saved at:', data.filePath);
      setFilePath(data.filePath);
      setRecording(false);
    });

    const updateSub = DeviceEventEmitter.addListener('recUpdate', data => {
      //setElapsedMs(Math.floor(data.elapsedMs / 1000));
    });

    const audioWaveSubscription = AudioModule.addListener(
      'onAudioWaveform',
      event => {
        /*
        const amplitude = event.amplitude;
        // setCurrentAmplitude(amplitude);
        //console.log('event',event);
        const scaled = Math.min(1, amplitude * 6);
        if (scaled >= 1) {
          setAmplitudes(prev => {
            const updated = [...prev, scaled];
            if (updated.length > 100) {
              // To maintained wave array length 100
              updated.shift();
            }
            return updated;
          });
        }
          */
        //console.log('amplitudes', amplitudes);
      },
    );

    return () => {
      stopSub.remove();
      updateSub.remove();
      audioWaveSubscription.remove();
    };
  }, []);
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  const uploadPodcastMutation = useMutation({
    mutationKey: ['uploadPodcast'],
    mutationFn: async ({
      audio_url,
      cover_image,
    }: {
      audio_url: string;
      cover_image: string;
    }) => {
      const response = await axios.post(
        UPLOAD_PODCAST,
        {
          title: title,
          description: description,
          tags: selectedGenres,
          article_id: null,
          audio_url: audio_url,
          cover_image: cover_image,
          duration: player.duration,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.message as string;
    },
    onSuccess: async data => {
      await handleUpload();

      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      navigation.navigate('TabNavigation');
    },
    onError: async error => {
      // Handle upload error
      await handleUpload();
      Snackbar.show({
        text: 'Upload failed',
        duration: Snackbar.LENGTH_SHORT,
      });
      console.error('Upload error:', error);
    },
  });

  const handlePostSubmit = async () => {
    if (!filePath || !imageUtils) {
      Alert.alert(
        'Error',
        'Please record a podcast and select an image before uploading.',
      );
      return;
    }

    try {
      // Show confirmation alert
      const confirmation = await showConfirmationAlert();
      if (!confirmation) {
        Alert.alert('Post discarded');
        await unlinkFile();
        navigation.navigate('TabNavigation');
        return;
      }

      setUploading(true);
      setUiState('uploading');

      // Resize the image and handle the upload
      const resizedImageUri = await resizeImage(imageUtils);

      let uploadedUrl = await uploadImage(resizedImageUri?.uri);
      let audioUrl = await uploadAudio(filePath);

      console.log('audio', audioUrl);
      console.log('Image', uploadedUrl);

      if (uploadedUrl && audioUrl) {
        // Call the mutation to upload the podcast
        uploadPodcastMutation.mutate({
          audio_url: audioUrl,
          cover_image: uploadedUrl,
        });
      } else {
        Alert.alert('Error', 'Could not upload the podcast. Please try again.');
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      Alert.alert('Error', 'Could not process the images.');
      await handleUpload();
    }
  };

  // Helper function to show confirmation alert
  const showConfirmationAlert = () => {
    return new Promise(resolve => {
      Alert.alert(
        'Create Podcast',
        'Please confirm you want to upload this podcast.',
        [
          {
            text: 'Cancel',
            onPress: () => resolve(false),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => resolve(true),
          },
        ],
        {cancelable: false},
      );
    });
  };

  // Helper function to resize an image
  const resizeImage = async localImage => {
    try {
      const resizedImageUri = await ImageResizer.createResizedImage(
        localImage,
        1000, // Width
        1000, // Height
        'JPEG', // Format
        100, // Quality
      );
      return resizedImageUri;
    } catch (err) {
      console.error('Failed to resize image:', err);
      // throw new Error('Image resizing failed');
    }
  };

  //  if(loading || uploadPodcastMutation.isPending)

  useEffect(() => {
    if (error || imageError) {
      handleUpload();
    }
  }, [error, handleUpload, imageError]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Podcast Recorder</Text>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.micButton,
            recording && styles.micButtonActive,
            {marginBottom: 0},
          ]}>
          <Icon name="microphone" size={38} color="white" />
        </View>
      </View>
      <Text style={styles.timer}>{recordTime}</Text>

      <View style={styles.waveContainer}>
        {amplitudes.length > 0 ? (
          <AmplitudeWave audioWaves={amplitudes} />
        ) : (
          <SoundWave />
        )}
      </View>

      {(uiState === 'playing' || uiState === 'paused') && (
        <View
          style={{
            width: '100%',
            alignItems: 'stretch',
            marginTop: 8,
            marginBottom: 4,
          }}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={player.duration}
            value={player.currentStatus ? player.currentStatus.currentTime : 0}
            minimumTrackTintColor={BUTTON_COLOR}
            maximumTrackTintColor="#ccc"
            thumbTintColor={BUTTON_COLOR}
            onSlidingComplete={async value => {
              // seek to selected time
              await player.seekTo(value);
            }}
          />
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatSecTime(player.currentStatus ? player.currentStatus.currentTime : 0)}</Text>
            <Text style={styles.time}>{formatSecTime(player.duration)}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={{flexDirection: 'row', marginTop: 24, gap: 16}}>
        {/* Record/Stop */}
        {uiState === 'idle' || uiState === 'review' ? (
          <TouchableOpacity
            style={[styles.circularButton, styles.record]}
            onPress={handleStartRecording}
            disabled={recording || uploading}>
            <Icon name="record-circle" size={28} color="white" />
            <Text style={styles.actionButtonText}>Record</Text>
          </TouchableOpacity>
        ) : null}
        {uiState === 'recording' && (
          <TouchableOpacity
            style={[styles.circularButton, styles.stop]}
            onPress={handleStopRecording}
            disabled={uploading}>
            <Icon name="stop-circle" size={28} color="white" />
            <Text style={styles.actionButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
        {/* Play/Pause/Stop */}
        {uiState === 'review' && filePath && (
          <TouchableOpacity
            style={[styles.circularButton, styles.play]}
            onPress={handlePlay}
            disabled={uploading}>
            <Icon name="play-circle" size={28} color="white" />
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>
        )}
        {uiState === 'playing' && (
          <TouchableOpacity
            style={[styles.circularButton, styles.pause]}
            onPress={handlePause}
            disabled={uploading}>
            <Icon name="pause-circle" size={28} color="white" />
            <Text style={styles.actionButtonText}>Pause</Text>
          </TouchableOpacity>
        )}
        {uiState === 'paused' && (
          <TouchableOpacity
            style={[styles.circularButton, styles.play]}
            onPress={handlePlay}
            disabled={uploading}>
            <Icon name="play-circle" size={28} color="white" />
            <Text style={styles.actionButtonText}>Resume</Text>
          </TouchableOpacity>
        )}
        {(uiState === 'playing' || uiState === 'paused') && (
          <TouchableOpacity
            style={[styles.circularButton, styles.stop]}
            onPress={handleStopPlay}
            disabled={uploading}>
            <Icon name="stop-circle" size={28} color="white" />
            <Text style={styles.actionButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
        {/* Re-record */}
        {uiState === 'review' && (
          <TouchableOpacity
            style={[styles.circularButton, styles.rerecord]}
            onPress={handleReRecord}
            disabled={uploading}>
            <Icon name="refresh" size={28} color="white" />
            <Text style={styles.actionButtonText}>Rerecord</Text>
          </TouchableOpacity>
        )}
        {/* Upload */}
        {uiState === 'review' && filePath && (
          <TouchableOpacity
            style={[styles.circularButton, styles.upload]}
            onPress={handlePostSubmit}
            disabled={uploading}>
            <Icon name="cloud-upload" size={28} color="white" />
            <Text style={styles.actionButtonText}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* File Path */}
      {filePath && (
        <Text style={styles.pathText} numberOfLines={1} ellipsizeMode="middle">
          Saved at: {filePath}
        </Text>
      )}
    </View>
  );
};

export default PodcastRecorder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: '#f8fafc',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timer: {
    fontSize: 42,
    color: '#38bdf8',
    marginVertical: 20,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  waveContainer: {
    height: 80,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },

  // Shared circular style
  circularButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // Rectangular style for stop/pause
  rectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // Colors
  record: {backgroundColor: '#16a34a'},
  stop: {backgroundColor: '#dc2626'},
  play: {backgroundColor: '#3b82f6'},
  pause: {backgroundColor: '#f59e0b'},
  rerecord: {backgroundColor: '#0284c7'},
  upload: {backgroundColor: '#7c3aed'},

  buttonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  pathText: {
    marginTop: 20,
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
  },

  // Mic styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  micButtonActive: {
    backgroundColor: '#38bdf8',
  },
  micOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBody: {
    width: 18,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#38bdf8',
    marginBottom: 2,
  },
  micStem: {
    width: 4,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#38bdf8',
    marginTop: 2,
  },
  micPulse: {
    position: 'absolute',
    top: -15,
    left: -15,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#38bdf8',
    opacity: 0.4,
  },

  actionButtonText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    //marginTop: 2,
    letterSpacing: 0.5,
  },

  slider: {
    width: '100%',
    height: 36,
    marginTop: 6,
    marginBottom: 2,
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  time: {
    fontSize: 13,
    color: '#777',
  },
});
