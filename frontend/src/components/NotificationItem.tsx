import {formatTimeWithDate} from '../helper/dateUtils';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Notification} from '../type';
import {fp, wp} from '../helper/Metric';
import {MaterialIcons} from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MIN_REVEAL_WIDTH = 96;
const MAX_REVEAL_WIDTH = 144;
const TRANSITION_DURATION = 220;

export default function NotificationItem({
  item,
  handleDeleteAction,
  handleClick,
  isOpen,
  onOpenSwipe,
  onCloseSwipe,
}: {
  item: Notification;
  handleDeleteAction: (item: Notification) => void;
  handleClick: (item: Notification) => void;
  isOpen: boolean;
  onOpenSwipe: (id: string) => void;
  onCloseSwipe: (id: string) => void;
}) {
  const translateX = useSharedValue(0);
  const [cardWidth, setCardWidth] = useState(0);

  const revealWidth = useMemo(() => {
    if (!cardWidth) {
      return 112;
    }

    return Math.min(
      MAX_REVEAL_WIDTH,
      Math.max(MIN_REVEAL_WIDTH, cardWidth * 0.3),
    );
  }, [cardWidth]);

  const fullSwipeDistance = useMemo(() => {
    return -(cardWidth || revealWidth * 3);
  }, [cardWidth, revealWidth]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const closeItem = useCallback(() => {
    translateX.value = withTiming(0, {duration: TRANSITION_DURATION});
    onCloseSwipe(item._id);
  }, [item._id, onCloseSwipe, translateX]);

  const openItem = useCallback(() => {
    translateX.value = withTiming(-revealWidth, {duration: TRANSITION_DURATION});
    onOpenSwipe(item._id);
  }, [item._id, onOpenSwipe, revealWidth, translateX]);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(-revealWidth, {duration: TRANSITION_DURATION});
    } else {
      translateX.value = withTiming(0, {duration: TRANSITION_DURATION});
    }
  }, [isOpen, revealWidth, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 6 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
          );
        },
        onPanResponderGrant: () => {
          onOpenSwipe(item._id);
        },
        onPanResponderMove: (_, gestureState) => {
          const baseOffset = isOpen ? -revealWidth : 0;
          const maxSwipeDistance = cardWidth || revealWidth * 3;
          const nextTranslateX = Math.min(
            0,
            Math.max(-maxSwipeDistance, baseOffset + gestureState.dx),
          );

          translateX.value = nextTranslateX;
        },
        onPanResponderRelease: (_, gestureState) => {
          const baseOffset = isOpen ? -revealWidth : 0;
          const draggedDistance = baseOffset + gestureState.dx;
          const openThreshold = cardWidth ? cardWidth * 0.3 : revealWidth;
          const deleteThreshold = cardWidth ? cardWidth * 0.6 : revealWidth * 2;

          if (draggedDistance <= -deleteThreshold) {
            translateX.value = withTiming(fullSwipeDistance, {
              duration: TRANSITION_DURATION,
            });
            handleDeleteAction(item);
            return;
          }

          if (draggedDistance <= -openThreshold) {
            openItem();
            return;
          }

          closeItem();
        },
        onPanResponderTerminate: () => {
          closeItem();
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [cardWidth, closeItem, fullSwipeDistance, handleDeleteAction, isOpen, item, onOpenSwipe, openItem, revealWidth, translateX],
  );

  return (
    <View
      style={styles.wrapper}
      onLayout={event => setCardWidth(event.nativeEvent.layout.width)}>
      <View style={[styles.deleteActionContainer, {width: revealWidth}]}> 
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete notification"
          accessibilityHint="Removes this notification"
          onPress={() => {
            handleDeleteAction(item);
          }}
          style={styles.deleteActionButton}>
          <MaterialIcons name="delete-forever" size={28} color="#fff" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.cardShell, animatedCardStyle]} {...panResponder.panHandlers}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open notification ${item?.title ?? ''}`}
          accessibilityHint="Opens the notification details"
          onPress={() => {
            if (isOpen) {
              closeItem();
              return;
            }

            handleClick(item);
          }}
          style={styles.cardContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item?.title}</Text>

            <Text style={styles.description}>
              {item?.message} {' '}
            </Text>
            <Text style={styles.footerText}>
              Received at: {' '}
              {formatTimeWithDate(item?.timestamp)}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 4,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  cardShell: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
  },
  cardContainer: {
    width: '100%',
    minHeight: 92,
    maxHeight: 360,
    backgroundColor: 'white',
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 4,
    padding: wp(2.5),
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  title: {
    fontSize: fp(4.5),
    fontWeight: 'bold',
    color: '#121a26',
    marginBottom: 4,
    fontFamily: 'Lobster-Regular',
  },
  description: {
    fontSize: fp(4),
    fontWeight: '500',
    lineHeight: 18,
    color: '#121a26',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  footerText: {
    fontSize: fp(3.3),
    fontWeight: '600',
    color: '#778599',
    marginBottom: 3,
  },
  deleteActionContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#d64545',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteActionButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleteActionText: {
    color: '#fff',
    fontSize: fp(3.4),
    fontWeight: '700',
    marginLeft: 8,
  },
});
