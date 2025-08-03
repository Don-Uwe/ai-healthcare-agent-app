import {useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
//import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import HeartbeatWave from '../components/HeartBeatWave';
import { PodcastRecorderScreenProps } from '../type';

const PodcastRecorder = ({navigation}: PodcastRecorderScreenProps) => {
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const audioPath = useRef<string>('');

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

   // const result = await AudioRecorderPlayer.startRecorder();
    //audioPath.current = result;
/*
    AudioRecorderPlayer.addRecordBackListener(e => {
      setRecordTime(AudioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      return;
    });
    */

    setRecording(true);
  };

  const stopRecording = async () => {
    /*
    const result = await AudioRecorderPlayer.stopRecorder();
    AudioRecorderPlayer.removeRecordBackListener();
    setRecording(false);
    console.log('Recording saved at:', result);
    */
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Podcast Recorder</Text>
      <Text style={styles.timer}>{recordTime}</Text>

      {recording && (
        <View style={styles.waveContainer}>
          <HeartbeatWave />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, recording ? styles.stop : styles.record]}
        onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>
          {recording ? 'Stop' : 'Start'} Recording
        </Text>
      </TouchableOpacity>
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
    height: 60,
    width: '100%',
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
});
