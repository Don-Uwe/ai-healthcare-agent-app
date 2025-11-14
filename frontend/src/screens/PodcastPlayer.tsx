import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Platform, StyleSheet} from 'react-native';
import {PodcastPlayerScreenProps} from '../type';
import RNFS from 'react-native-fs';
import {useMutation} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';

import {UPLOAD_PODCAST} from '../helper/APIUtils';
import useUploadImage from '../../hooks/useUploadImage';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import useUploadAudio from '../../hooks/useUploadAudio';
import Slider from '@react-native-community/slider';

import {useAudioPlayer} from 'expo-audio';
import {Button, Circle, Progress, Theme, XStack, YStack, Text} from 'tamagui';
import {Entypo, Ionicons} from '@expo/vector-icons';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';

const PodcastPlayer = ({navigation, route}: PodcastPlayerScreenProps) => {
  const {uploadImage, loading, error: imageError} = useUploadImage();
  const {uploadAudio, loading: audioLoading, error} = useUploadAudio();

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const {title, description, selectedGenres, imageUtils, filePath} =
    route.params;

  //const [elapsedMs, setElapsedMs] = useState(0);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  //const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const timerRef = useRef(null);

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
    if (!player) return;

    player.play();
    setUiState('playing');
  };

  const handlePause = async () => {
    console.log('Pause called');
    if (!player) return;

    player.pause();
    setUiState('paused');
  };

  const handleStopPlay = async () => {
    stopPlay();
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
        navigation.goBack();
      } catch (err) {
        console.warn('Error deleting file:', err);
      }
    }
    // unlink file path
    setAmplitudes([]);
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
        backgroundColor="#0B1425"
        p="$6"
        pt="$10"
        jc="space-between">
        <YStack>
          <Text color="white" fontSize={42} fontWeight="700">
            {title}
          </Text>
          <Text color="#B8C1D1" fontSize={18} mt="$2">
            {description}
          </Text>
        </YStack>

        <YStack alignItems="center" marginTop="$4">
          <Circle
            size={220}
            backgroundColor="#0D1A33"
            shadowColor="#00D1FF"
            shadowOffset={{width: 0, height: 0}}
            shadowRadius={40}
            ai="center"
            jc="center">
            <Entypo name="infinity" size={75} color={'#72D8FF'} />
          </Circle>
        </YStack>

        <YStack marginTop="$1">
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor={PRIMARY_COLOR}
            maximumTrackTintColor="#ccc"
            thumbTintColor={PRIMARY_COLOR}
            onSlidingComplete={async (value: number) => {
              if (player) {
                await player.seekTo(value);
                setPosition(value);
              }
            }}
          />

          <XStack justifyContent="space-between" marginTop="$3">
            <Text color="#C0C9DA">{formatSecTime(position)}</Text>
            <Text color="#C0C9DA">{formatSecTime(duration)}</Text>
          </XStack>
        </YStack>

        <XStack
          justifyContent="space-around"
          alignItems="center"
          marginTop="$8">
          <Button
            chromeless
            icon={<Ionicons name="play-back" size={26} color="#9BB3C8" />}
          />
          <Button
            w={90}
            h={80}
            br={45}
            onPress={() => {
              if (player.currentStatus.playing) {
                handlePause();
              } else {
                handlePlay();
              }
            }}
            bg="#4ACDFF"
            icon={
              player?.currentStatus.playing ? (
                <Ionicons name="pause" size={54} color="white" />
              ) : (
                <Ionicons name="play" size={54} color="white" />
              )
            }
            elevate
            shadowColor="#4ACDFF"
            shadowRadius={30}
            shadowOffset={{width: 0, height: 0}}
          />

          <Button
            chromeless
            icon={<Ionicons name="play-forward" size={26} color="#9BB3C8" />}
          />
        </XStack>

        <Text marginTop="$4" textAlign="center" color="#8FA3BB" fontSize={13}>
          Saved at:{filePath}
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
