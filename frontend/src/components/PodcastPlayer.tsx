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
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Slider from '@react-native-community/slider';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import {PRIMARY_COLOR} from '../helper/Theme';
import Tts from 'react-native-tts';

const PodcastPlayer = ({}) => {
  const [isLiked, setisLiked] = useState(false);
  const [isPlaying, setisPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  // Playback-synchronization refs (best-effort, event-driven when supported)
  const isSliderSeekingRef = useRef(false);
  const speakingStartTimestampRef = useRef<number | null>(null);
  const currentSpokenOffsetMsRef = useRef<number>(0);

  const text = `You're seeking new ways to diversify your portfolio, but it's not always easy to find new reliable investment opportunities. Each week, our financial expert with four decades of successful investing experience will help you discover opportunities outside of your current strategy that you've probably never considered before. If you want to learn about ways to diversify your portfolio in ways that have various levels of risk, this show is for you.`;

  const rateAtTextSpoken = Platform.OS === 'ios' ? 1.1 : 0.9;
  const defaultrate = Platform.OS === 'ios' ? 0.4 : 0.6;

  const estimateTTSDuration = (txt: string) => {
    const wordsPerMinute = 130;
    const adjustedWordsPerMinute = wordsPerMinute * rateAtTextSpoken;
    const words = txt.split(' ').length;
    return (words / adjustedWordsPerMinute) * 60 * 1000;
  };

  const initTts = async () => {
    const totalDuration = estimateTTSDuration(text);
    setDuration(totalDuration);

    const voices = await Tts.voices();
    const availableVoices = voices
      .filter(
        (v: any) =>
          !v.networkConnectionRequired &&
          !v.notInstalled &&
          (v.language === 'en-IN' || v.language === 'en-US'),
      )
      .map((v: any) => ({id: v.id, name: v.name, language: v.language}));

    if (availableVoices && availableVoices.length > 0) {
      try {
        await Tts.setDefaultLanguage(availableVoices[0].language);
      } catch (err) {
        // ignore
      }
      await Tts.setDefaultVoice(availableVoices[0].id);
      Tts.setDefaultRate(defaultrate, true);
      Tts.setDefaultPitch(1.5);
      Tts.setDucking(true);
      Tts.setIgnoreSilentSwitch('ignore');
    } else {
      setisPlaying(false);
    }
  };

  // Best-effort event-driven sync (react-native-tts varies by version/platform)
  useEffect(() => {
    const setup = async () => {
      await Tts.getInitStatus();
      await initTts();
    };

    setup();

    const onStart = () => {
      if (isSliderSeekingRef.current) return;
      const now = Date.now();
      speakingStartTimestampRef.current = now;
      currentSpokenOffsetMsRef.current = currentPosition;
      setisPlaying(true);
    };

    const onProgress = (event: any) => {
      if (isSliderSeekingRef.current) return;

      const eventPosMs: number | null =
        typeof event?.elapsedTime === 'number'
          ? event.elapsedTime
          : typeof event?.currentTime === 'number'
            ? event.currentTime
            : null;

      if (eventPosMs == null) return;

      const newPos = Math.min(
        duration,
        currentSpokenOffsetMsRef.current + eventPosMs,
      );
      setCurrentPosition(newPos);
    };

    const onFinish = () => {
      setisPlaying(false);
      setCurrentPosition(0);
      speakingStartTimestampRef.current = null;
      currentSpokenOffsetMsRef.current = 0;
    };

    const onCancel = () => setisPlaying(false);
    const onError = () => setisPlaying(false);

    Tts.addEventListener('tts-start', onStart);
    Tts.addEventListener('tts-progress', onProgress);
    Tts.addEventListener('tts-finish', onFinish);
    Tts.addEventListener('tts-cancel', onCancel);
    Tts.addEventListener('tts-error', onError);

    return () => {
      // component-safe cleanup is better, but react-native-tts event APIs differ by version.
      // Preserve original approach used elsewhere in the repo.
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-error');
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-progress');
      Tts.removeAllListeners('tts-cancel');
    };
  }, []);

  const handleLike = () => setisLiked(!isLiked);

  // Best-effort seek: stop + re-speak from an approximated offset
  const speakFromPositionMs = (seekPositionMs: number) => {
    const safeDuration = duration || 1;
    const clamped = Math.max(0, Math.min(safeDuration, seekPositionMs));

    const words = text.split(' ');
    const totalWords = words.length;
    const approxElapsedRatio = clamped / safeDuration;

    const wordsToSkip = Math.max(
      0,
      Math.min(totalWords - 1, Math.floor(totalWords * approxElapsedRatio)),
    );

    const newText = words.slice(wordsToSkip).join(' ');

    currentSpokenOffsetMsRef.current = clamped;
    speakingStartTimestampRef.current = null;
    isSliderSeekingRef.current = false;

    Tts.stop();
    Tts.speak(newText);

    setisPlaying(true);
  };

  const handlePlay = () => {
    if (isPlaying) {
      Tts.stop();
      setisPlaying(false);
      return;
    }

    speakFromPositionMs(currentPosition);
  };

  const handleSliderChange = (value: number) => {
    const safeDuration = duration || 1;
    const seekPosition = Math.max(0, Math.min(safeDuration, value * safeDuration));

    isSliderSeekingRef.current = true;
    setCurrentPosition(seekPosition);
    speakFromPositionMs(seekPosition);

    setTimeout(() => {
      isSliderSeekingRef.current = false;
    }, 50);
  };

  const handleForward = () => {};
  const handleBackward = () => {};
  const handleDownload = () => {};
  const handleShare = () => {};

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
        value={duration > 0 ? currentPosition / duration : 0}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        onSlidingComplete={handleSliderChange}
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

