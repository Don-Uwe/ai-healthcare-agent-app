import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme, YStack, XStack} from 'tamagui';
import {MotiView} from 'moti';

const PodcastSkeletonCard = () => {
  const theme = useTheme();
  const baseColor = (theme.gray200?.val ?? theme.background?.val ?? '#E5E7EB') as string;
  const highlightColor = (theme.gray100?.val ?? theme.gray300?.val ?? '#F3F4F6') as string;
  const cardBackground = (theme.background?.val ?? '#FFFFFF') as string;

  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.cardContainer, {backgroundColor: cardBackground}]}> 
        {/* Image Skeleton */}
        <MotiView
          style={[styles.imageSkeleton, {backgroundColor: baseColor}]}
          from={{opacity: 0.6}}
          animate={{opacity: 1}}
          transition={{
            type: 'timing',
            duration: 800,
            loop: true,
          }}>
          <MotiView
            style={[
              StyleSheet.absoluteFill,
              {
                width: 100,
                height: '100%',
                opacity: 0.5,
                backgroundColor: highlightColor,
              },
            ]}
            from={{translateX: -200}}
            animate={{translateX: 400}}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
        </MotiView>

        {/* Content Section */}
        <YStack padding="$3" gap="$2" flex={1}>
          {/* Title Lines */}
          <YStack gap="$2">
            <MotiView
              style={[styles.skeletonLine, {backgroundColor: baseColor}]}
              from={{opacity: 0.6}}
              animate={{opacity: 1}}
              transition={{
                type: 'timing',
                duration: 800,
                loop: true,
              }}>
              <MotiView
                style={[
                  StyleSheet.absoluteFill,
                  {
                    width: 100,
                    height: '100%',
                    opacity: 0.5,
                    backgroundColor: highlightColor,
                  },
                ]}
                from={{translateX: -200}}
                animate={{translateX: 400}}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: true,
                }}
              />
            </MotiView>

            <MotiView
              style={[styles.skeletonLine, {width: '70%', backgroundColor: baseColor}]}
              from={{opacity: 0.6}}
              animate={{opacity: 1}}
              transition={{
                type: 'timing',
                duration: 800,
                loop: true,
              }}>
              <MotiView
                style={[
                  StyleSheet.absoluteFill,
                  {
                    width: 100,
                    height: '100%',
                    opacity: 0.5,
                    backgroundColor: highlightColor,
                  },
                ]}
                from={{translateX: -200}}
                animate={{translateX: 400}}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: true,
                }}
              />
            </MotiView>
          </YStack>

          {/* Host/Author Line */}
          <MotiView
            style={[
              styles.skeletonLine,
              {width: '50%', marginTop: 4, backgroundColor: baseColor},
            ]}
            from={{opacity: 0.6}}
            animate={{opacity: 1}}
            transition={{
              type: 'timing',
              duration: 800,
              loop: true,
            }}>
            <MotiView
              style={[
                StyleSheet.absoluteFill,
                {
                  width: 100,
                  height: '100%',
                  opacity: 0.5,
                  backgroundColor: highlightColor,
                },
              ]}
              from={{translateX: -200}}
              animate={{translateX: 400}}
              transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
              }}
            />
          </MotiView>

          {/* Tags Section */}
          <XStack gap="$1.5" marginTop="$2">
            {[1, 2].map(i => (
              <MotiView
                key={i}
                style={[
                  styles.skeletonTag,
                  {backgroundColor: baseColor},
                ]}
                from={{opacity: 0.6}}
                animate={{opacity: 1}}
                transition={{
                  type: 'timing',
                  duration: 800,
                  loop: true,
                }}>
                <MotiView
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      width: 100,
                      height: '100%',
                      opacity: 0.5,
                      backgroundColor: highlightColor,
                    },
                  ]}
                  from={{translateX: -200}}
                  animate={{translateX: 400}}
                  transition={{
                    type: 'timing',
                    duration: 1000,
                    loop: true,
                  }}
                />
              </MotiView>
            ))}
          </XStack>

          {/* Stats Section */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginTop="$2"
            gap="$2">
            <MotiView
              style={[styles.skeletonLine, {flex: 1, backgroundColor: baseColor}]}
              from={{opacity: 0.6}}
              animate={{opacity: 1}}
              transition={{
                type: 'timing',
                duration: 800,
                loop: true,
              }}>
              <MotiView
                style={[
                  StyleSheet.absoluteFill,
                  {
                    width: 100,
                    height: '100%',
                    opacity: 0.5,
                    backgroundColor: highlightColor,
                  },
                ]}
                from={{translateX: -200}}
                animate={{translateX: 400}}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: true,
                }}
              />
            </MotiView>

            <MotiView
              style={[styles.skeletonLine, {flex: 1, backgroundColor: baseColor}]}
              from={{opacity: 0.6}}
              animate={{opacity: 1}}
              transition={{
                type: 'timing',
                duration: 800,
                loop: true,
              }}>
              <MotiView
                style={[
                  StyleSheet.absoluteFill,
                  {
                    width: 100,
                    height: '100%',
                    opacity: 0.5,
                    backgroundColor: highlightColor,
                  },
                ]}
                from={{translateX: -200}}
                animate={{translateX: 400}}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: true,
                }}
              />
            </MotiView>
          </XStack>
        </YStack>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 8,
    width: '100%',
    paddingHorizontal: 10,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageSkeleton: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  skeletonLine: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonTag: {
    height: 24,
    width: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default PodcastSkeletonCard;
