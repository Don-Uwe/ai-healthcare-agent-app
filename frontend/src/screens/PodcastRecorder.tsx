import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Alert} from 'react-native';

import {PodcastRecorderScreenProps} from '../type';
import RNFS from 'react-native-fs';

import Icon from '@expo/vector-icons/MaterialCommunityIcons';

//const {AudioModule} = NativeModules;
//const AudioModule = NativeModules.AudioModule;
//const emitter = new NativeEventEmitter(AudioModule);

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';
import audioModule from '@/modules/audio-module';
import {useFocusEffect} from '@react-navigation/native';
import {Circle, Theme, XStack, YStack, Text} from 'tamagui';
import LottieView from 'lottie-react-native';
import {useDispatch} from 'react-redux';
import {requestStoragePermissions} from '../helper/Utils';

//const AudioModule = requireNativeModule('AudioModule');

const PodcastRecorder = ({navigation, route}: PodcastRecorderScreenProps) => {
  const [recording, setRecording] = useState(false);
  const dispatch = useDispatch();

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const {title, description, selectedGenres, imageUtils} = route.params;
  const [filePath, setFilePath] = useState<string | null>(null);

  const [amplitudes, setAmplitudes] = useState<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordStartTimeRef = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      handleUpload();
    }, []),
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

        // dispatch(
        //   showAlert({
        //     title: 'Error',
        //     message: 'Permission to access microphone was denied',
        //   }),
        // );
      }

      const storageGranted = await requestStoragePermissions();
      if (!storageGranted) {
        Alert.alert('Storage permission denied');
        return;
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

    timerRef.current = setInterval(() => {
      if (!recordStartTimeRef.current) return;

      const elapsed = Date.now() - recordStartTimeRef.current;
      setRecordTime(formatTime(elapsed));
    }, 1000);
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
    setRecording(true);
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
  }, [unlinkFile]);

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
    <Theme name="dark">
      <YStack flex={1} bg="#071225" ai="center" jc="center" px="$4" space="$6">
        {/* Header */}
        <Text color="white" fontSize={28} fontWeight="700" marginBottom="$2">
          Podcast Recorder
        </Text>

        {/* Waveform Top */}
        <YStack ai="center" jc="center" space="$3">
          <YStack
            w={120}
            h={120}
            bg={recording ? '#38bdf8' : '#0a1e3a'}
            ai="center"
            jc="center"
            borderRadius={60}>
            <Icon
              name="microphone"
              size={48}
              color={recording ? '#0a1e3a' : '#3bc9f7'}
            />
          </YStack>
        </YStack>

        {/* Timer */}
        <Text
          fontSize={48}
          color="#3bc9f7"
          fontWeight="700"
          mt="$3"
          letterSpacing={2}>
          {recordTime}
        </Text>

        {/* Mid Wave */}
        {/**
     *    <YStack w="100%" h={80} ai="center" jc="center" mt="$2">
        <AmplitudeWave audioWaves={amplitudes} />
      </YStack>
     */}
        {recording && (
          <LottieView
            source={require('../assets/LottieAnimation/sound-voice-waves.json')}
            autoPlay
            loop
            style={{
              width: 150,
              height: 150,
            }}
          />
        )}

        {/* Action Controls */}
        <XStack jc="center" ai="center" space="$5" mt="$4">
          {/* Play preview */}
          {uiState === 'review' && (
            <Circle
              size={60}
              bg="#1c3a63"
              ai="center"
              jc="center"
              onPress={() =>
                navigation.navigate('PodcastPlayer', {
                  title,
                  description,
                  imageUtils,
                  selectedGenres,
                  filePath: audioRecorder.uri,
                })
              }>
              <Icon name="play" size={32} color="white" />
            </Circle>
          )}

          {/* Record/Stop main button */}
          <Circle
            size={110}
            ai="center"
            jc="center"
            bg="transparent"
            borderWidth={4}
            borderColor="#32c2f1"
            onPress={
              uiState === 'idle' || uiState === 'review'
                ? handleStartRecording
                : handleStopRecording
            }>
            <Circle
              size={70}
              bg={uiState === 'recording' ? '#d32626' : '#32c2f1'}
              ai="center"
              jc="center">
              <Icon
                name={uiState === 'recording' ? 'stop' : 'record-circle'}
                size={40}
                color="white"
              />
            </Circle>
          </Circle>

          {/* Re-record */}
          {uiState === 'review' && (
            <Circle
              size={60}
              bg="#1c3a63"
              ai="center"
              jc="center"
              onPress={handleReRecord}>
              <Icon name="refresh" size={32} color="white" />
            </Circle>
          )}
        </XStack>

        {/* Footer */}
        <Text color="#8ea6c1" fontSize={19} marginTop="$2">
          Title: {title}
        </Text>
      </YStack>
    </Theme>
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
