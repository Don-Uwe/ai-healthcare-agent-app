/**
 * ArticleShareModal.tsx
 *
 * A bottom-sheet-style modal that shows the article preview card and
 * a "Share" button. Triggered from an article screen's share action.
 *
 * Usage:
 *   <ArticleShareModal
 *     visible={shareModalVisible}
 *     onClose={() => setShareModalVisible(false)}
 *     article={{
 *       title: 'How Stress Affects Your Body',
 *       authorName: 'Dr. Priya Mehta',
 *       category: 'Mental Health',
 *       coverImageUrl: 'https://...',
 *       authorAvatarUrl: 'https://...',
 *     }}
 *   />
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import ArticleShareCard, { ArticleShareCardProps } from './ArticleShareCard';
import { useArticleShare } from '../hooks/useArticleShare';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArticleShareModalProps {
  visible: boolean;
  onClose: () => void;
  article: Omit<ArticleShareCardProps, 'cardRef'>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.72;

const COLORS = {
  teal: '#00B4A2',
  tealDark: '#008F7E',
  white: '#FFFFFF',
  textDark: '#1A2E2B',
  textMid: '#5A7370',
  backdrop: 'rgba(0,0,0,0.45)',
  sheet: '#FFFFFF',
  handle: '#CBD5D3',
};

// ─── Component ────────────────────────────────────────────────────────────────

const ArticleShareModal: React.FC<ArticleShareModalProps> = ({
  visible,
  onClose,
  article,
}) => {
  const { cardRef, isCapturing, shareArticleCard } = useArticleShare();

  // ── Slide-up animation ──────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleShare = () => {
    shareArticleCard(article.title);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* ── Sheet ────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share Article</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subheading}>
            Preview your shareable card below.
          </Text>

          {/* Card preview — centred, slightly scaled down so it fits */}
          <View style={styles.cardWrapper}>
            <ArticleShareCard {...article} cardRef={cardRef} />
          </View>

          {/* Share button */}
          <TouchableOpacity
            style={[styles.shareBtn, isCapturing && styles.shareBtnDisabled]}
            onPress={handleShare}
            disabled={isCapturing}
            activeOpacity={0.85}
          >
            {isCapturing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.shareBtnIcon}>⬆ </Text>
                <Text style={styles.shareBtnLabel}>Share Card</Text>
              </>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
  },

  // Handle
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.handle,
    marginBottom: 16,
  },

  // Header row
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: COLORS.textMid,
  },

  subheading: {
    alignSelf: 'flex-start',
    fontSize: 13,
    color: COLORS.textMid,
    marginBottom: 20,
  },

  // Card preview area
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 0.88 }],
  },

  // Share button
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
    marginTop: 8,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  shareBtnDisabled: {
    backgroundColor: COLORS.tealDark,
    opacity: 0.7,
  },
  shareBtnIcon: {
    fontSize: 16,
    color: COLORS.white,
  },
  shareBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
});

export default ArticleShareModal;
