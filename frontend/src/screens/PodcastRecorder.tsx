import {useEffect, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  NativeModules,
  DeviceEventEmitter,
  NativeEventEmitter,
} from 'react-native';
//import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import SoundWave from '../components/SoundWave';
import {PodcastRecorderScreenProps} from '../type';
import AmplitudeWave from '../components/AmplitudeWave';
import {PRIMARY_COLOR } from '../helper/Theme';
import Svg, { Path, Rect } from 'react-native-svg';
import MicWave from '../components/MicWave';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const {WavAudioRecorder} = NativeModules;
const AudioModule = NativeModules.WavAudioRecorder;
const emitter = new NativeEventEmitter(AudioModule);

const PodcastRecorder = ({navigation}: PodcastRecorderScreenProps) => {
  const [recording, setRecording] = useState(false);

  const [recordTime, setRecordTime] = useState('00:00:00');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);

  const recordStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef(null);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSec % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const startTimer = () => {
    recordStartTimeRef.current = Date.now();
    if (timerRef) {
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
    setRecordTime('00:00:00');
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
      const path: string = await WavAudioRecorder.startRecording();
      console.log('File path', path);
      setFilePath(path);
      setRecording(true);
      setElapsedMs(0);
      startTimer();
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  };

  const stopRecording = async () => {
    try {
      await WavAudioRecorder.stopRecording();
      setRecording(false);
      stopTimer();
      console.log('Recording saved at:', filePath);
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }
  };

  useEffect(() => {
    const stopSub = DeviceEventEmitter.addListener('recStop', data => {
      console.log('File saved at:', data.filePath);
      setFilePath(data.filePath);
      setRecording(false);
    });

    const updateSub = DeviceEventEmitter.addListener('recUpdate', data => {
      setElapsedMs(Math.floor(data.elapsedMs / 1000));
    });

    const audioWaveSubscription = emitter.addListener(
      'onAudioWaveform',
      event => {
        const amplitude = event.amplitude;
        setCurrentAmplitude(amplitude);
        //console.log('event',event);
        const scaled = Math.min(1, amplitude * 6);
       if(scaled >=1 ){
         setAmplitudes((prev) => {
          const updated = [...prev, scaled];
          if (updated.length > 100) {
          // To maintained wave array length 100
            updated.shift(); 
          }
          return updated;
        });
       }

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Podcast Recorder</Text>
      <View style={styles.iconContainer}>
       <View
      style={{
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: PRIMARY_COLOR,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon name="microphone" size={38} color="white" />
    </View>
      </View>
      <Text style={styles.timer}>{recordTime}</Text>

      {recording && (
        <View style={styles.waveContainer}>
          {
            amplitudes.length > 0 ? (
              <AmplitudeWave audioWaves={amplitudes}/>
            ):(
              <SoundWave/>
            )
          }
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, recording ? styles.stop : styles.record]}
        onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>
          {recording ? 'Stop' : 'Start'} Recording
        </Text>
      </TouchableOpacity>

      {!recording && filePath && (
        <Text style={styles.pathText}>Saved at: {filePath}</Text>
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
    marginBottom: 12,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 40,
    color: '#38bdf8',
    marginVertical: 20,
    fontVariant: ['tabular-nums'],
  },
  waveContainer: {
    height: 80,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  record: {
    backgroundColor: '#16a34a',
  },
  stop: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  pathText: {
    marginTop: 20,
    fontSize: 14,
    color: '#cbd5e1',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  micButtonActive: {
    backgroundColor: '#38bdf8',
  },
  micOuterCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  micInnerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBody: {
    width: 16,
    height: 28,
    borderRadius: 8,
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
    top: -10,
    left: -10,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#38bdf8',
    opacity: 0.4,
  },
});
