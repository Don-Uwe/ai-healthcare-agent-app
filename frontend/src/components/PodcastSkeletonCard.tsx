// PodcastSkeletonCard.tsx
import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Animated, useWindowDimensions} from 'react-native';
import {useTheme, YStack, XStack} from 'tamagui';
import { PODCAST_CARD } from '@/constants/podcastCard';

interface ShimmerBoxProps {
  style?: object | object[];
  shimmerX: Animated.AnimatedInterpolation<number>;
  highlightColor: string;
  baseColor: string;
}

const ShimmerBox: React.FC<ShimmerBoxProps> = ({
  style,
  shimmerX,
  highlightColor,
  baseColor,
}) => (
  <View style={[{overflow: 'hidden'}, style]}>
    <View style={[StyleSheet.absoluteFill, {backgroundColor: baseColor}]} />
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: highlightColor,
          opacity: 0.5,
          transform: [{translateX: shimmerX}],
        },
      ]}
    />
  </View>
);

const PodcastSkeletonCard: React.FC = () => {
  const theme = useTheme();
  const {width} = useWindowDimensions();

  const baseColor = (theme.gray200?.val ?? '#E5E7EB') as string;
  const highlightColor = (theme.gray100?.val ?? '#F9FAFB') as string;
  const cardBackground = (theme.background?.val ?? '#FFFFFF') as string;

  const shimmerProgress = useRef(new Animated.Value(0)).current;

  const shimmerX = shimmerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerProgress, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerProgress]);

  const shimmerProps = {shimmerX, baseColor, highlightColor};

  return (
    <YStack
      style={styles.cardWrapper}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants">
      <YStack style={[styles.cardContainer, {backgroundColor: cardBackground}]}>
        <ShimmerBox style={styles.imageSkeleton} {...shimmerProps} />

        <YStack padding="$3" gap="$2" flex={1}>
          <YStack gap="$2">
            <ShimmerBox style={styles.skeletonLine} {...shimmerProps} />
            <ShimmerBox
              style={[styles.skeletonLine, {width: '70%'}]}
              {...shimmerProps}
            />
          </YStack>

          <ShimmerBox
            style={[styles.skeletonLine, {width: '50%', marginTop: 4}]}
            {...shimmerProps}
          />

          <XStack gap="$1.5" marginTop="$2">
            {[1, 2].map(i => (
              <ShimmerBox
                key={`skeleton-tag-${i}`}
                style={styles.skeletonTag}
                {...shimmerProps}
              />
            ))}
          </XStack>

          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginTop="$2"
            gap="$2">
            <ShimmerBox
              style={[styles.skeletonLine, {flex: 1}]}
              {...shimmerProps}
            />
            <ShimmerBox
              style={[styles.skeletonLine, {flex: 1}]}
              {...shimmerProps}
            />
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 8,
    width: '100%',
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageSkeleton: {
    width: '100%',
    height: PODCAST_CARD.imageHeight,
    borderRadius: 0,
  },
  skeletonLine: {
    height: PODCAST_CARD.lineHeight,
    borderRadius: PODCAST_CARD.lineRadius,
    width: '100%',
  },
  skeletonTag: {
    height: PODCAST_CARD.tagHeight,
    width: PODCAST_CARD.tagWidth,
    borderRadius: PODCAST_CARD.lineRadius,
  },
});

export default PodcastSkeletonCard;