import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {PodcastPlayerScreenProps} from '../type';
import RNFS from 'react-native-fs';
import {useMutation} from '@tanstack/react-query';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';

import {UPLOAD_PODCAST} from '../helper/APIUtils';
import useUploadImage from '../hooks/useUploadImage';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import useUploadAudio from '../hooks/useUploadAudio';
import Slider from '@react-native-community/slider';

import {useAudioPlayer} from 'expo-audio';
import {Button, Circle, Theme, XStack, YStack, Text} from 'tamagui';
import {AntDesign, Ionicons} from '@expo/vector-icons';
import {PRIMARY_COLOR} from '../helper/Theme';
import LottieView from 'lottie-react-native';

const PodcastPlayer = ({navigation, route}: PodcastPlayerScreenProps) => {
  const {uploadImage, loading, error: imageError} = useUploadImage();
  const {uploadAudio, loading: audioLoading, error} = useUploadAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  

  const {title, description, selectedGenres, imageUtils, filePath} =
    route.params;

  //const [elapsedMs, setElapsedMs] = useState(0);
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  //const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  //const timerRef = useRef(null);

  const player = useAudioPlayer(
    filePath
      ? `file://${filePath}`
      : require('../../assets/sounds/funny-cartoon-sound-397415.mp3'),
  );

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

  // UI State: 'idle' | 'recording' | 'review' | 'playing' | 'paused' | 'uploading'
  const [uiState, setUiState] = useState<
    'idle' | 'recording' | 'review' | 'playing' | 'paused' | 'uploading'
  >('idle');
  const [uploading, setUploading] = useState(false);

  // Handle transitions

  const handlePlay = async () => {
    console.log('Play called');
    if (!player) {
      console.log('enter');
      return;
    }
    await player.seekTo(0);
    player.play();
    setUiState('playing');
    setIsPlaying(true);
  };

  const handlePause = async () => {
    console.log('Pause called');
    if (!player) return;

    player.pause();
    setUiState('paused');
    setIsPlaying(false);
  };

  const SKIP_TIME = 5; // seconds

  const handleForward = async () => {
    if (!player) return;

    let next = position + SKIP_TIME;

    if (next > duration) {
      next = duration;
    }

    await player.seekTo(next);
    setPosition(next);
  };

  const handleBackward = async () => {
    if (!player) return;

    let next = position - SKIP_TIME;

    if (next < 0) {
      next = 0;
    }

    await player.seekTo(next);
    setPosition(next);
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
    setAmplitudes([]);
    await unlinkFile();
  }, [unlinkFile]);

  const stopPlay = () => {
    try {
      player.remove();
    } catch (e) {
      console.error('Error stopping playback:', e);
    }
  };

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
        text: 'Podcast submitted for review',
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

    if(!isConnected){
      Alert.alert('Please check your internet and try again!');
      return;
    }
  
    if (!filePath || !imageUtils) {
      Alert.alert(
        'Error',
        'Please record a podcast and select an image before uploading.',
      );

      // dispatch(
      //   showAlert({
      //     title: 'Error',
      //     message:
      //       'Please record a podcast and select an image before uploading.',
      //   }),
      // );
      return;
    }

    try {
      // Show confirmation alert
      const confirmation = await showConfirmationAlert();
      if (!confirmation) {
        //Alert.alert('Post discarded');
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
        //   dispatch(
        //   showAlert({
        //     title: 'Error',
        //     message:
        //       'Could not upload the podcast. Please try again.',
        //   }),
        // );
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      Alert.alert('Error', 'Could not process the images.');
      // dispatch(
      //   showAlert({
      //     title: 'Error',
      //     message:
      //       'Could not process the images.',
      //   }),
      // );
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

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      const status = player.currentStatus;
      if (status) {
        setPosition(status.currentTime);
        setDuration(player.duration || status.duration || 0);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    if (error || imageError) {
      handleUpload();
    }
  }, [error, handleUpload, imageError]);

  return (
    <Theme name="dark">
      <YStack
        flex={1}
        backgroundColor="#0F172A"
        padding="$5"
        paddingTop="$8"
        justifyContent="space-between">

        {/* Header Section */}
        <YStack mb="$4">
          <Text color="#94A3B8" fontSize={13} fontWeight="600" mb="$2" letterSpacing={1}>
            NOW PLAYING
          </Text>
          <Text color="#F1F5F9" fontSize={28} fontWeight="800" lineHeight={34}>
            {title}
          </Text>
          <Text color="#94A3B8" fontSize={16} marginTop="$3" lineHeight={24}>
            {description}
          </Text>
        </YStack>

        {/* Upload Button Section */}
        <YStack alignItems="center" my="$5">
          <Circle
            size={110}
            backgroundColor="#1E293B"
            borderWidth={3}
            borderColor="#3B82F6"
            shadowColor="#3B82F6"
            shadowOffset={{width: 0, height: 8}}
            shadowRadius={24}
            shadowOpacity={0.4}
            onPress={handlePostSubmit}
            pressStyle={{scale: 0.95, backgroundColor: '#334155'}}
            alignSelf="center"
            justifyContent="center">
            <AntDesign name="cloud-upload" size={50} color={'#60A5FA'} />
          </Circle>
          <Text
            marginTop="$3"
            color="#60A5FA"
            fontSize={15}
            fontWeight="700"
            textAlign="center"
            letterSpacing={0.5}>
            UPLOAD PODCAST
          </Text>
        </YStack>

        {/* Waveform Visualization */}
        {player.currentStatus.playing && (
          <YStack alignItems="center" height={120} my="$2">
            <LottieView
              source={require('../assets/LottieAnimation/sound-voice-waves.json')}
              autoPlay
              loop
              style={{
                width: '100%',
                height: 120,
              }}
            />
          </YStack>
        )}

        {/* Progress Slider Section */}
        <YStack my="$4" bg="#1E293B" borderRadius={16} padding="$4">
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#334155"
            thumbTintColor="#60A5FA"
            onSlidingComplete={async (value: number) => {
              if (player) {
                await player.seekTo(value);
                setPosition(value);
              }
            }}
          />

          <XStack justifyContent="space-between" marginTop="$2">
            <Text color="#94A3B8" fontSize={14} fontWeight="600" fontFamily="monospace">
              {formatSecTime(position)}
            </Text>
            <Text color="#94A3B8" fontSize={14} fontWeight="600" fontFamily="monospace">
              {formatSecTime(duration)}
            </Text>
          </XStack>
        </YStack>

        {/* Playback Controls */}
        <XStack
          justifyContent="center"
          alignItems="center"
          marginTop="$5"
          marginBottom="$4"
          space="$6">

          {/* Backward Button */}
          <Circle
            size={65}
            backgroundColor="#1E293B"
            borderWidth={2}
            borderColor="#334155"
            pressStyle={{scale: 0.9, backgroundColor: '#334155'}}
            onPress={handleBackward}
            justifyContent="center"
            alignItems="center">
            <Ionicons name="play-back" size={28} color="#94A3B8" />
          </Circle>

          {/* Play/Pause Button */}
          <Circle
            size={90}
            backgroundColor="#3B82F6"
            shadowColor="#3B82F6"
            shadowOffset={{width: 0, height: 8}}
            shadowRadius={20}
            shadowOpacity={0.5}
            elevation={8}
            pressStyle={{scale: 0.95}}
            onPress={() => {
              if (player.currentStatus.playing) {
                handlePause();
              } else {
                handlePlay();
              }
            }}
            justifyContent="center"
            alignItems="center">
            {player?.currentStatus.playing ? (
              <Ionicons name="pause" size={45} color="white" />
            ) : (
              <Ionicons name="play" size={45} color="white" />
            )}
          </Circle>

          {/* Forward Button */}
          <Circle
            size={65}
            backgroundColor="#1E293B"
            borderWidth={2}
            borderColor="#334155"
            pressStyle={{scale: 0.9, backgroundColor: '#334155'}}
            onPress={handleForward}
            justifyContent="center"
            alignItems="center">
            <Ionicons name="play-forward" size={28} color="#94A3B8" />
          </Circle>
        </XStack>

        {/* Footer Info */}
        <Text
          marginTop="$4"
          marginBottom="$2"
          textAlign="center"
          color="#64748B"
          fontSize={11}
          numberOfLines={1}
          ellipsizeMode="middle">
          {filePath}
        </Text>
      </YStack>
    </Theme>
  );
};

export default PodcastPlayer;

const styles = StyleSheet.create({
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
