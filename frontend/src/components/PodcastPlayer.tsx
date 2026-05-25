import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
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

const WORDS_PER_MINUTE = 130;
const IOS_TTS_RATE = 0.4;
const ANDROID_TTS_RATE = 0.6;

// iOS and Android expose slightly different playback rates, so we keep the
// existing platform-specific tuning to preserve the current speaking cadence.
const IOS_TTS_DURATION_ADJUSTMENT = 1.1;
const ANDROID_TTS_DURATION_ADJUSTMENT = 0.9;

interface TtsProgressEvent {
  elapsedTime?: number;
  currentTime?: number;
}

type TtsEventName =
  | 'tts-start'
  | 'tts-progress'
  | 'tts-finish'
  | 'tts-cancel'
  | 'tts-error';

type TtsEventHandler<T extends TtsEventName = TtsEventName> = T extends 'tts-progress'
  ? (event: TtsProgressEvent) => void
  : (event: any) => void;

type TtsSubscription = {
  remove?: () => void;
};

const PodcastPlayer = ({navigation}: any) => {
  const [isLiked, setisLiked] = useState(false);
  const [isPlaying, setisPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  // Playback-synchronization refs (best-effort, event-driven when supported)
  const isSliderActiveRef = useRef(false);
  const currentSpokenOffsetMsRef = useRef<number>(0);
  const currentPositionRef = useRef(0);
  const durationRef = useRef(0);

  const text = `You're seeking new ways to diversify your portfolio, but it's not always easy to find new reliable investment opportunities. Each week, our financial expert with four decades of successful investing experience will help you discover opportunities outside of your current strategy that you've probably never considered before. If you want to learn about ways to diversify your portfolio in ways that have various levels of risk, this show is for you.`;

  const textSpokenAdjustment =
    Platform.OS === 'ios'
      ? IOS_TTS_DURATION_ADJUSTMENT
      : ANDROID_TTS_DURATION_ADJUSTMENT;
  const defaultRate = Platform.OS === 'ios' ? IOS_TTS_RATE : ANDROID_TTS_RATE;

  const estimateTTSDuration = (txt: string) => {
    const adjustedWordsPerMinute = WORDS_PER_MINUTE * textSpokenAdjustment;
    const words = txt.split(' ').length;
    return (words / adjustedWordsPerMinute) * 60 * 1000;
  };

  const updateDuration = (value: number) => {
    durationRef.current = value;
    setDuration(value);
  };

  const initTts = async () => {
    const totalDuration = estimateTTSDuration(text);
    updateDuration(totalDuration);

    try {
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
          console.warn(`Failed to set TTS language to ${availableVoices[0].language}, using default.`, err);
        }
        await Tts.setDefaultVoice(availableVoices[0].id);
        Tts.setDefaultRate(defaultRate, true);
        Tts.setDefaultPitch(1.5);
        Tts.setDucking(true);
        Tts.setIgnoreSilentSwitch('ignore');
      } else {
        setisPlaying(false);
      }
    } catch (error) {
      console.error('Failed to initialize TTS voices', error);
      setisPlaying(false);
    }
  };

  const syncCurrentPosition = (position: number) => {
    currentPositionRef.current = position;
    setCurrentPosition(position);
  };

  const removeTtsSubscription = (
    subscription: TtsSubscription | null | void,
    eventName: TtsEventName,
    handler: TtsEventHandler,
  ) => {
    if (subscription?.remove) {
      subscription.remove();
      return;
    }

    if (typeof Tts.removeEventListener === 'function') {
      Tts.removeEventListener(eventName, handler as any);
    }
  };

  // Best-effort event-driven sync (react-native-tts varies by version/platform)
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        await Tts.getInitStatus();
        if (!isMounted) {
          return;
        }

        await initTts();
      } catch (error) {
        console.error('Failed to initialize TTS', error);
        if (isMounted) {
          setisPlaying(false);
        }
      }
    };

    setup();

    const onStart = () => {
      if (isSliderActiveRef.current) return;
      currentSpokenOffsetMsRef.current = currentPositionRef.current;
      setisPlaying(true);
    };

    const onProgress = (event: any) => {
      if (isSliderActiveRef.current) return;

      const eventPosMs: number | null =
        typeof event?.elapsedTime === 'number'
          ? event.elapsedTime
          : typeof event?.currentTime === 'number'
            ? event.currentTime
            : null;

      if (eventPosMs == null) {
        console.warn('TTS progress event did not include a position update.');
        return;
      }

      const newPos = Math.min(
        durationRef.current,
        currentSpokenOffsetMsRef.current + eventPosMs,
      );
      syncCurrentPosition(newPos);
    };

    const onFinish = () => {
      setisPlaying(false);
      syncCurrentPosition(0);
      currentSpokenOffsetMsRef.current = 0;
    };

    const onCancel = () => setisPlaying(false);
    const onError = () => setisPlaying(false);

    const startSub = Tts.addEventListener('tts-start', onStart);
    const progressSub = Tts.addEventListener('tts-progress', onProgress);
    const finishSub = Tts.addEventListener('tts-finish', onFinish);
    const cancelSub = Tts.addEventListener('tts-cancel', onCancel);
    const errorSub = Tts.addEventListener('tts-error', onError);

    return () => {
      isMounted = false;
      removeTtsSubscription(startSub, 'tts-start', onStart);
      removeTtsSubscription(progressSub, 'tts-progress', onProgress);
      removeTtsSubscription(finishSub, 'tts-finish', onFinish);
      removeTtsSubscription(cancelSub, 'tts-cancel', onCancel);
      removeTtsSubscription(errorSub, 'tts-error', onError);
    };
  }, []);

  const handleLike = () => setisLiked(!isLiked);

  // Best-effort seek: stop + re-speak from an approximated offset
  const speakFromPositionMs = async (seekPositionMs: number) => {
    const safeDuration = durationRef.current || 1;
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
    currentPositionRef.current = clamped;

    Tts.stop();

    try {
      await Tts.speak(newText);
      setisPlaying(true);
    } catch (error) {
      console.error('Failed to start TTS playback', error);
      setisPlaying(false);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      Tts.stop();
      setisPlaying(false);
      return;
    }

    void speakFromPositionMs(currentPosition);
  };

  const handleSlidingStart = () => {
    isSliderActiveRef.current = true;
    Tts.stop();
    setisPlaying(false);
  };

  const handleSliderValueChange = (value: number) => {
    const safeDuration = durationRef.current || 1;
    const seekPosition = Math.max(0, Math.min(safeDuration, value * safeDuration));

    syncCurrentPosition(seekPosition);
  };

  const handleSlidingComplete = (value: number) => {
    const safeDuration = durationRef.current || 1;
    const seekPosition = Math.max(0, Math.min(safeDuration, value * safeDuration));

    isSliderActiveRef.current = false;
    syncCurrentPosition(seekPosition);
    void speakFromPositionMs(seekPosition);
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
        onSlidingStart={handleSlidingStart}
        onValueChange={handleSliderValueChange}
        onSlidingComplete={handleSlidingComplete}
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

