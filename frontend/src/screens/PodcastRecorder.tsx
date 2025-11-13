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

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';
import audioModule from '@/modules/audio-module';
import { useFocusEffect } from '@react-navigation/native';

//const AudioModule = requireNativeModule('AudioModule');

const PodcastRecorder = ({navigation, route}: PodcastRecorderScreenProps) => {
  const [recording, setRecording] = useState(false);

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const {title, description, selectedGenres, imageUtils} = route.params;
  const [filePath, setFilePath] = useState<string | null>(null);
  //const [elapsedMs, setElapsedMs] = useState(0);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  //const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const recordStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef(null);


useFocusEffect(
  useCallback(() => {
    handleUpload();
  }, [])
);

 const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    startTimer();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    setRecording(false);
      stopTimer();
      setFilePath(audioModule.uri);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);
 
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSec % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
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

  // const startRecording = async () => {
  //   if (Platform.OS === 'android') {
  //     const granted = await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //     ]);
  //     if (
  //       granted['android.permission.RECORD_AUDIO'] !==
  //       PermissionsAndroid.RESULTS.GRANTED
  //     ) {
  //       console.warn('Permission denied');
  //       return;
  //     }
  //   }

  //   try {
  //     const path: string = await AudioModule.startRecording();
  //     console.log('File path', path);
  //     setFilePath(path);
  //     setRecording(true);
  //     //setElapsedMs(0);
  //     startTimer();
  //   } catch (e) {
  //     console.error('Failed to start recording:', e);
  //   }
  // };



  // UI State: 'idle' | 'recording' | 'review' | 'playing' | 'paused' | 'uploading'
  
  const [uiState, setUiState] = useState<
    'idle' | 'recording' | 'review' | 'playing' | 'paused' | 'uploading'
  >('idle');
  const [uploading, setUploading] = useState(false);

  // Handle transitions
  const handleStartRecording = async () => {
    await record();
    setUiState('recording');
  };

  const handleStopRecording = async () => {
    await stopRecording();
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



  // useEffect(() => {
  //   // const stopSub = AudioModule.addListener('recStop', (data:any) => {
  //   //   console.log('File saved at:', data.filePath);
  //   //   setFilePath(data.filePath);
  //   //   setRecording(false);
  //   // });

  //   const updateSub = DeviceEventEmitter.addListener('recUpdate', data => {
  //     //setElapsedMs(Math.floor(data.elapsedMs / 1000));
  //   });

  //   const audioWaveSubscription = AudioModule.addListener(
  //     'onAudioWaveform',
  //     event => {
  //       /*
  //       const amplitude = event.amplitude;
  //       // setCurrentAmplitude(amplitude);
  //       //console.log('event',event);
  //       const scaled = Math.min(1, amplitude * 6);
  //       if (scaled >= 1) {
  //         setAmplitudes(prev => {
  //           const updated = [...prev, scaled];
  //           if (updated.length > 100) {
  //             // To maintained wave array length 100
  //             updated.shift();
  //           }
  //           return updated;
  //         });
  //       }
  //         */
  //       //console.log('amplitudes', amplitudes);
  //     },
  //   );

  //   return () => {

  //     updateSub.remove();
  //     audioWaveSubscription.remove();
  //   };
  // }, []);
  
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);


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
        {uiState === 'review' && audioRecorder.uri && (
          <TouchableOpacity
            style={[styles.circularButton, styles.play]}
            onPress={()=>{
              navigation.navigate("PodcastPlayer", {
                title: title,
                description: description,
                imageUtils: imageUtils,
                selectedGenres: selectedGenres,
                filePath: audioRecorder.uri 
              });
            }}
            disabled={uploading}>
            <Icon name="play-circle" size={28} color="white" />
            <Text style={styles.actionButtonText}>Play</Text>
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
