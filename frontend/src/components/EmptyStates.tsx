import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useColorScheme,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GlassButton } from './GlassButton';
import { ProfessionalColors, Typography, Spacing, BorderRadius } from '../styles/GlassStyles';

interface BaseEmptyStateProps {
  iconEmoji?: string;
  iconComponent?: React.ReactNode;
  title: string;
  description: string;
  infoText?: string;
  actionText?: string;
  onAction?: () => void;
  loading?: boolean;
}

export const BaseEmptyState: React.FC<BaseEmptyStateProps> = ({
  iconEmoji,
  iconComponent,
  title,
  description,
  infoText,
  actionText,
  onAction,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Floating / Bouncing icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (loading) {
      // Pulse animation for loading states
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const containerBg = isDarkMode ? 'transparent' : 'transparent';
  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 82, 186, 0.03)';
  const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const circleBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E3F2FD';
  const titleColor = isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray900;
  const descColor = isDarkMode ? ProfessionalColors.gray400 : ProfessionalColors.gray600;

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: bounceAnim }],
  };

  const scaleStyle = loading ? { transform: [{ scale: pulseAnim }] } : {};

  return (
    <Animated.View style={[styles.stateContainer, { backgroundColor: containerBg, opacity: fadeAnim }]}>
      <View style={[styles.innerCard, { backgroundColor: cardBg, borderColor }]}>
        <Animated.View style={[styles.iconCircle, { backgroundColor: circleBg }, animatedStyle, scaleStyle]}>
          {iconComponent ? (
            iconComponent
          ) : (
            <Text style={styles.iconEmoji} accessibilityLabel={`${title} icon`}>{iconEmoji}</Text>
          )}
        </Animated.View>

        <Text style={[Typography.h4, styles.stateTitle, { color: titleColor }]}>
          {title}
        </Text>

        <Text style={[Typography.body, styles.stateDescription, { color: descColor }]}>
          {description}
        </Text>

        {infoText && (
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#FFF9C4',
                borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FFF59D',
              },
            ]}
          >
            <Text style={[styles.infoText, { color: isDarkMode ? ProfessionalColors.warningLight : '#F57F17' }]}>
              {infoText}
            </Text>
          </View>
        )}

        {actionText && onAction && (
          <GlassButton
            title={actionText}
            onPress={onAction}
            variant="primary"
            size="md"
            style={styles.actionButton}
          />
        )}
      </View>
    </Animated.View>
  );
};

// Specialized Empty State Exports
export const OfflineArticleState = () => (
  <BaseEmptyState
    iconEmoji="📄"
    title="Articles Offline"
    description="You need an internet connection to view articles. Connect to WiFi or mobile data to continue."
    infoText="💡 Offline reading coming soon!"
  />
);
export const NoOfflinePodcastsState = ({
  onBrowse,
}: {
  onBrowse?: () => void;
}) => (
  <BaseEmptyState
    iconEmoji="🎧"
    title="No Offline Podcasts Yet"
    description="Download podcasts to listen anytime, even without an internet connection."
    actionText={onBrowse ? "Browse Podcasts" : undefined}
    onAction={onBrowse}
  />
);

export const OfflinePodcastState = () => (
  <BaseEmptyState
    iconEmoji="🎙️"
    title="Podcasts Offline"
    description="You need an internet connection to stream podcasts. Connect to WiFi or mobile data to listen."
    infoText="💡 Offline downloads coming soon!"
  />
);

export const NoArticleState = ({ onRefresh }: { onRefresh?: () => void }) => (
  <BaseEmptyState
    iconEmoji="📭"
    title="No Articles Available"
    description="There are no articles to display right now. Check back later for new health insights!"
    actionText={onRefresh ? "Refresh Articles" : undefined}
    onAction={onRefresh}
  />
);

export const NoPodcastState = ({
  onRefresh,
}: {
  onRefresh?: () => void;
}) => (
  <BaseEmptyState
    iconEmoji="🎙️"
    title="No Podcasts Available"
    description="There are no podcasts available right now. Check back later for new content."
    actionText={onRefresh ? 'Refresh Podcasts' : undefined}
    onAction={onRefresh}
  />
);

export const NoNotificationState = ({ onRefresh }: { onRefresh?: () => void }) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <BaseEmptyState
      iconComponent={
        <MaterialCommunityIcons
          name="bell-outline"
          size={48}
          color={isDarkMode ? ProfessionalColors.primaryLight : ProfessionalColors.secondary}
        />
      }
      title="No Notifications Yet"
      description="You're all caught up. New notifications will appear here when available."
      actionText={onRefresh ? "Refresh" : undefined}
      onAction={onRefresh}
    />
  );
};

// Loading State Component with audio waves
export const PodcastLoadingState = () => {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const wave1Scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.2],
  });

  const wave2Scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 0.5],
  });

  const wave3Scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.0],
  });

  return (
    <View style={styles.loadingContainer}>
      <BaseEmptyState
        iconEmoji="🎙️"
        title="Loading Podcasts"
        description="Tuning in to the latest audio content..."
      />
      <View style={styles.waveContainer}>
        <Animated.View style={[styles.waveLine, { transform: [{ scaleY: wave1Scale }] }]} />
        <Animated.View style={[styles.waveLine, { transform: [{ scaleY: wave2Scale }] }]} />
        <Animated.View style={[styles.waveLine, { transform: [{ scaleY: wave3Scale }] }]} />
        <Animated.View style={[styles.waveLine, { transform: [{ scaleY: wave2Scale }] }]} />
        <Animated.View style={[styles.waveLine, { transform: [{ scaleY: wave1Scale }] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stateContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    minHeight: 380,
  },
  innerCard: {
    width: '100%',
    maxWidth: 450,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconEmoji: {
    fontSize: 44,
  },
  stateTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  stateDescription: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  infoBox: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginTop: Spacing.sm,
    alignSelf: 'center',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginTop: -Spacing.xl,
    marginBottom: Spacing.lg,
  },
  waveLine: {
    width: 5,
    height: 30,
    backgroundColor: '#00BFFF',
    marginHorizontal: 3,
    borderRadius: 2.5,
  },
});
