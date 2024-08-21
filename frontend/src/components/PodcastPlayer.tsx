import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Slider from '@react-native-community/slider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import {PRIMARY_COLOR} from '../helper/Theme'; // Custom theme color
import Tts from 'react-native-tts'; // Text-to-Speech library

// Helper function to check if two values are approximately equal within a given epsilon (tolerance)
function approximatelyEqual(v1, v2, epsilon = 500) {
  return Math.abs(v1 - v2) < epsilon;
}

const PodcastPlayer = ({}) => {
  // State variables
  const [isLiked, setisLiked] = useState(false); // Track if the podcast is liked
  const [isPlaying, setisPlaying] = useState(false); // Track if the podcast is playing
  const [duration, setDuration] = useState(0); // Store the total duration of the podcast
  const [currentPosition, setCurrentPosition] = useState(0); // Store the current playback position
  const sliderInterval = useRef(null); // Reference to store the interval for updating the slider

  // Text content of the podcast
  const text = `You're seeking new ways to diversify your portfolio, but it's not always easy to find new reliable investment opportunities. Each week, our financial expert with four decades of successful investing experience will help you discover opportunities outside of your current strategy that you've probably never considered before. If you want to learn about ways to diversify your portfolio in ways that have various levels of risk, this show is for you.`;

  // Rate at which text is spoken (different for iOS and Android)
  const rateAtTextSpoken = Platform.OS === 'ios' ? 1.1 : 0.9;
  const defaultrate = Platform.OS === 'ios' ? 0.4 : 0.6;

  // Function to initialize Text-to-Speech (TTS) settings and calculate the estimated duration of the text
  const initTts = async () => {
    const totalDuration = estimateTTSDuration(text); // Calculate total duration based on text
    setDuration(totalDuration); // Set the duration state

    const voices = await Tts.voices(); // Get available TTS voices
    const availableVoices = voices
      .filter(
        v =>
          !v.networkConnectionRequired &&
          !v.notInstalled &&
          (v.language === 'en-IN' || v.language === 'en-US'),
      )
      .map(v => {
        return {id: v.id, name: v.name, language: v.language}; // Map relevant voice properties
      });

    // If there are available voices, set the default language and voice
    if (availableVoices && availableVoices.length > 0) {
      try {
        await Tts.setDefaultLanguage(availableVoices[0].language);
      } catch (err) {
        console.log(`setDefaultLanguage error `, err);
      }
      await Tts.setDefaultVoice(availableVoices[0].id); // Set default voice
      Tts.setDefaultRate(defaultrate, true); // Set default speech rate
      Tts.setDefaultPitch(1.5); // Set default pitch
      Tts.setDucking(true); // Enable ducking (lower other audio)
      Tts.setIgnoreSilentSwitch('ignore'); // Ignore silent switch on iOS
    } else {
      Alert.alert('Error playing the audio');
      setisPlaying(false);
    }
  };

  // Function to estimate TTS duration based on text length and speaking rate
  const estimateTTSDuration = text => {
    const wordsPerMinute = 130; // Average speaking rate at normal speed 1.1
    const adjustedWordsPerMinute = wordsPerMinute * rateAtTextSpoken; // Adjust based on the speech rate
    const words = text.split(' ').length; // Calculate number of words in the text
    return (words / adjustedWordsPerMinute) * 60 * 1000; // Duration in milliseconds
  };

  // useEffect hook to initialize TTS and set up event listeners
  useEffect(() => {
    Tts.getInitStatus().then(initTts); // Initialize TTS when component mounts
    return () => {
      clearInterval(sliderInterval.current); // Clear the interval
    };
  }, []);

  // Handle the 'like' button press
  const handleLike = () => {
    setisLiked(!isLiked);
  };

  // Function to handle play/pause actions
  const handlePlay = () => {
    if (isPlaying) {
      // If currently playing, stop the speech and clear the interval
      console.log('paused');
      Tts.stop(); // Stop the text-to-speech
      clearInterval(sliderInterval.current); // Clear the interval used for updating position
    } else {
      // If currently paused, calculate new starting position and resume speech
      Tts.stop(); // Ensure TTS is stopped before starting new speech

      // Calculate the number of words spoken per second
      const wordsPerSecond = (text.split(' ').length / duration) * 1000;

      // Calculate how many words to skip based on the current position
      const wordsToSkip = Math.floor((currentPosition / 1000) * wordsPerSecond);

      // Create new text to speak from the current position
      const newText = text.split(' ').slice(wordsToSkip).join(' ');

      // Start speaking the new text
      Tts.speak(newText);

      // Set an interval to update the current position every second
      sliderInterval.current = setInterval(() => {
        setCurrentPosition(prevPosition => {
          const newPosition = prevPosition + 1000; // Increment position by 1000 ms (1 second)

          // If the new position is approximately equal to the duration, reset the position
          if (approximatelyEqual(newPosition, duration)) {
            clearInterval(sliderInterval.current); // Stop the interval
            setCurrentPosition(0); // Reset position to the start
            setisPlaying(false);
            return 0;
          }

          // Return the new position
          return newPosition;
        });
      }, 1000);
    }

    // Toggle the playing state
    setisPlaying(!isPlaying);
  };

  // Function to handle slider changes
  const handleSliderChange = value => {
    // Calculate the position in milliseconds based on slider value
    const seekPosition = value * duration;

    // Update the current position
    setCurrentPosition(seekPosition);

    // Stop any ongoing speech
    Tts.stop();

    // Calculate the number of words spoken per second
    const wordsPerSecond = (text.split(' ').length / duration) * 1000;

    // Calculate how many words to skip based on the seek position
    const wordsToSkip = Math.floor((seekPosition / 1000) * wordsPerSecond);

    // Create new text to speak from the seek position
    const newText = text.split(' ').slice(wordsToSkip).join(' ');

    // Set the playing state to true and start speaking the new text
    setisPlaying(true);
    Tts.speak(newText);
  };

  // Handle forward button press (implementation needed)
  const handleForward = () => {};

  // Handle backward button press (implementation needed)
  const handleBackward = () => {};

  // Handle download button press (implementation needed)
  const handleDownload = () => {};

  // Handle share button press (implementation needed)
  const handleShare = () => {};

  // Render the podcast player UI
  return (
    <>
      <Text style={styles.podcast}>Feel Better. Live More</Text>
      <Text style={styles.podcastname}>
        8 Hidden Habits To Live Your Healthiest, Happiest and Most Fulfilled
        Life with Robin Sharma
      </Text>

      <View style={styles.postedByContainer}>
        <View style={styles.postedByContent}>
          <Image
            source={{
              uri: 'https://www.telegraph.co.uk/content/dam/health-fitness/2023/01/06/TELEMMGLPICT000181626250_trans_NvBQzQNjv4BqqB8Yzl3cNKHqhd5OnaUTT5j2A7wJtvm8wQOgknmsfZY.jpeg',
            }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.postedByText}>Posted by</Text>
            <Text style={styles.postedByName}>Dr Rangan Chatterjee</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate
        augue erat, congue lacinia turpis pellentesque aliquam. Quisque eu
        tellus varius, eleifend dui sed, luctus nibh. Duis et dolor eu ligula
        ultrices dictum. Class aptent taciti sociosqu ad litora torquent per
        conubia nostra, per inceptos himenaeos.
      </Text>

      <View style={styles.actionsContainer}>
        <View style={styles.actionsContent}>
          <View style={styles.likeContainer}>
            <TouchableOpacity onPress={handleLike}>
              {isLiked ? (
                <Ionicons name="heart-sharp" color={'white'} size={30} />
              ) : (
                <Ionicons name="heart-outline" color={'white'} size={30} />
              )}
            </TouchableOpacity>
            <Text style={styles.likeText}>30</Text>
          </View>
          <TouchableOpacity onPress={handleDownload}>
            <Entypo name="download" color={'white'} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <EvilIcons name="sc-telegram" color={'white'} size={30} />
          </TouchableOpacity>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={currentPosition / duration} // Slider value is based on the current position
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        onSlidingComplete={handleSliderChange} // Seek to the new position when slider changes
      />

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {Math.floor(currentPosition / 1000 / 60)}:
          {Math.floor((currentPosition / 1000) % 60)
            .toString()
            .padStart(2, '0')}
        </Text>
        <Text style={styles.timeText}>
          -{Math.floor((duration - currentPosition) / 1000 / 60)}:
          {Math.floor(((duration - currentPosition) / 1000) % 60)
            .toString()
            .padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.controlContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleBackward}>
          <Feather size={30} color={'white'} name="skip-back" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          {isPlaying ? (
            <FontAwesome6 size={15} color={PRIMARY_COLOR} name="pause" />
          ) : (
            <FontAwesome6 size={15} color={PRIMARY_COLOR} name="play" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleForward}>
          <Feather size={30} color={'white'} name="skip-forward" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default PodcastPlayer;

// Styles for PodcastPlayer component
const styles = StyleSheet.create({
  podcast: {
    fontSize: 15,
    fontWeight: 'normal',
    color: 'white',
    marginTop: 10,
  },
  podcastname: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  postedByContainer: {
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  postedByContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 100,
  },
  postedByText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '300',
  },
  postedByName: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  description: {
    color: 'white',
    fontSize: 13,
    textAlign: 'justify',
    marginBottom: 15,
  },
  actionsContainer: {
    alignItems: 'flex-end',
    marginBottom: 0,
  },
  actionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  likeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  slider: {
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: -5,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
  },
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    marginHorizontal: 20,
  },
  playButton: {
    backgroundColor: 'white',
    height: 40,
    width: 40,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
