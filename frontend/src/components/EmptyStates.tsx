import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {PRIMARY_COLOR} from '../helper/Theme';


export const OfflineArticleState = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.stateContainer, {opacity: fadeAnim}]}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.offlineCircle,
          {
            transform: [{translateY: bounceAnim}],
          },
        ]}>
        <Text style={styles.iconEmoji}>📄</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>Articles Offline</Text>
      <Text style={styles.stateDescription}>
        You need an internet connection to view articles.{'\n'}
        Connect to WiFi or mobile data to continue.
      </Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>💡 Offline reading coming soon!</Text>
      </View>
    </Animated.View>
  );
};


export const OfflinePodcastState = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.stateContainer, {opacity: fadeAnim}]}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.offlineCircle,
          {
            transform: [{translateY: bounceAnim}],
          },
        ]}>
        <Text style={styles.iconEmoji}>🎙️</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>Podcasts Offline</Text>
      <Text style={styles.stateDescription}>
        You need an internet connection to stream podcasts.{'\n'}
        Connect to WiFi or mobile data to listen.
      </Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>💡 Offline downloads coming soon!</Text>
      </View>
    </Animated.View>
  );
};


export const NoArticleState = ({onRefresh}: {onRefresh?: () => void}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <Animated.View style={[styles.stateContainer, {opacity: fadeAnim}]}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.emptyCircle,
          {
            transform: [{translateY}],
          },
        ]}>
        <Text style={styles.iconEmoji}>📭</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>No Articles Available</Text>
      <Text style={styles.stateDescription}>
        There are no articles to display right now.{'\n'}
        Check back later for new health insights!
      </Text>
      {onRefresh && (
        <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};


export const NoPodcastState = ({onRefresh}: {onRefresh?: () => void}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <Animated.View style={[styles.stateContainer, {opacity: fadeAnim}]}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.emptyCircle,
          {
            transform: [{translateY}],
          },
        ]}>
        <Text style={styles.iconEmoji}>🎧</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>No Podcasts Available</Text>
      <Text style={styles.stateDescription}>
        There are no podcasts to display right now.{'\n'}
        Check back later for new audio content!
      </Text>
      {onRefresh && (
        <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};


// Animated Dot Component for Loading
const AnimatedDot = ({delay}: {delay: number}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: fadeAnim,
        },
      ]}
    />
  );
};

export const PodcastLoadingState = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Wave animation (for audio wave effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const wave1Scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const wave2Scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0.6],
  });

  const wave3Scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  return (
    <View style={styles.stateContainer}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.loadingCircle,
          {
            transform: [{scale: pulseAnim}],
          },
        ]}>
        <Text style={styles.iconEmoji}>🎙️</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>Loading Podcasts</Text>
      <Text style={styles.stateDescription}>
        Tuning in to the latest audio content...
      </Text>
      <View style={styles.waveContainer}>
        <Animated.View
          style={[
            styles.waveLine,
            {transform: [{scaleY: wave1Scale}]},
          ]}
        />
        <Animated.View
          style={[
            styles.waveLine,
            {transform: [{scaleY: wave2Scale}]},
          ]}
        />
        <Animated.View
          style={[
            styles.waveLine,
            {transform: [{scaleY: wave3Scale}]},
          ]}
        />
        <Animated.View
          style={[
            styles.waveLine,
            {transform: [{scaleY: wave2Scale}]},
          ]}
        />
        <Animated.View
          style={[
            styles.waveLine,
            {transform: [{scaleY: wave1Scale}]},
          ]}
        />
      </View>
      <View style={styles.dotsContainer}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F0F8FF',
    minHeight: 400,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  offlineCircle: {
    backgroundColor: '#FFF3E0',
  },
  emptyCircle: {
    backgroundColor: '#F3E5F5',
  },
  loadingCircle: {
    backgroundColor: '#E8F5E9',
  },
  iconEmoji: {
    fontSize: 56,
  },
  stateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  infoBox: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFF59D',
    marginTop: 8,
  },
  infoText: {
    color: '#F57F17',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
    marginHorizontal: 6,
  },
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginVertical: 16,
  },
  waveLine: {
    width: 6,
    height: 40,
    backgroundColor: '#4CAF50',
    marginHorizontal: 4,
    borderRadius: 3,
  },
});
