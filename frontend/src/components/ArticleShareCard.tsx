/**
 * ArticleShareCard.tsx
 *
 * A reusable component that renders a visually rich article preview card
 * intended to be captured as an image and shared on social media.
 *
 * Usage:
 *   import ArticleShareCard from '../components/ArticleShareCard';
 *   // Attach a ref and call captureRef(ref) to get a shareable image URI.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ArticleShareCardProps {
  /** Article title */
  title: string;
  /** Author display name */
  authorName: string;
  /** Category / topic tag (e.g. "Mental Health") */
  category: string;
  /** Optional URL of the cover image */
  coverImageUrl?: string | null;
  /** Optional URL of the author's avatar */
  authorAvatarUrl?: string | null;
  /**
   * Forward this ref to the outermost View so callers can
   * capture the card with react-native-view-shot.
   */
  cardRef?: React.RefObject<View | null>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_WIDTH = 360;
const CARD_HEIGHT = 480;

/** Brand colours used throughout the card */
const BRAND = {
  teal: '#00B4A2',
  tealDark: '#008F7E',
  white: '#FFFFFF',
  offWhite: '#F7FAF9',
  textDark: '#1A2E2B',
  textMid: '#4A6B65',
  overlay: 'rgba(0,30,26,0.55)',
  badgeBg: 'rgba(0,180,162,0.18)',
};

// ─── Component ────────────────────────────────────────────────────────────────

const ArticleShareCard: React.FC<ArticleShareCardProps> = ({
  title,
  authorName,
  category,
  coverImageUrl,
  authorAvatarUrl,
  cardRef,
}) => {
  const hasCover = Boolean(coverImageUrl);

  return (
    <View ref={cardRef} style={styles.card} collapsable={false}>
      {/* ── Cover Section ─────────────────────────────────────────────── */}
      {hasCover ? (
        <ImageBackground
          source={{ uri: coverImageUrl! }}
          style={styles.coverBg}
          imageStyle={styles.coverBgImage}
          resizeMode="cover"
        >
          {/* dark overlay so text is always readable */}
          <View style={styles.coverOverlay} />
          <CategoryBadge category={category} light />
        </ImageBackground>
      ) : (
        <View style={[styles.coverBg, styles.coverPlaceholder]}>
          <View style={styles.coverPlaceholderPattern} />
          <CategoryBadge category={category} light={false} />
        </View>
      )}

      {/* ── Body Section ─────────────────────────────────────────────── */}
      <View style={styles.body}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Author row */}
        <View style={styles.authorRow}>
          {authorAvatarUrl ? (
            <Image
              source={{ uri: authorAvatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {authorName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorLabel}>Written by</Text>
            <Text style={styles.authorName} numberOfLines={1}>
              {authorName}
            </Text>
          </View>
        </View>

        {/* Branding footer */}
        <View style={styles.brandFooter}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>UltimateHealth</Text>
          <Text style={styles.brandTagline}> · Trusted Wellness Content</Text>
        </View>
      </View>
    </View>
  );
};

// ─── Sub-component ────────────────────────────────────────────────────────────

const CategoryBadge: React.FC<{ category: string; light: boolean }> = ({
  category,
  light,
}) => (
  <View style={[styles.badge, light ? styles.badgeLight : styles.badgeDark]}>
    <Text style={[styles.badgeText, light ? styles.badgeTextLight : styles.badgeTextDark]}>
      {category.toUpperCase()}
    </Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: BRAND.offWhite,
    // Subtle elevation for when rendered on-screen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },

  // ── Cover ────────────────────────────────────────────────────────────
  coverBg: {
    height: 220,
    width: '100%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  coverBgImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.overlay,
  },
  coverPlaceholder: {
    backgroundColor: BRAND.tealDark,
    justifyContent: 'flex-end',
  },
  coverPlaceholderPattern: {
    ...StyleSheet.absoluteFillObject,
    // Subtle cross-hatch feel via repeating diagonal teal gradient — using
    // opacity layering since RN doesn't support CSS gradients directly.
    opacity: 0.12,
    backgroundColor: BRAND.teal,
  },

  // ── Badge ─────────────────────────────────────────────────────────────
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeLight: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  badgeDark: {
    backgroundColor: BRAND.badgeBg,
    borderWidth: 1,
    borderColor: BRAND.teal,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  badgeTextLight: {
    color: BRAND.white,
  },
  badgeTextDark: {
    color: BRAND.teal,
  },

  // ── Body ──────────────────────────────────────────────────────────────
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BRAND.textDark,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  divider: {
    height: 2,
    width: 36,
    backgroundColor: BRAND.teal,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 16,
  },

  // ── Author row ────────────────────────────────────────────────────────
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: BRAND.teal,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: BRAND.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: BRAND.white,
    fontSize: 18,
    fontWeight: '700',
  },
  authorInfo: {
    flex: 1,
  },
  authorLabel: {
    fontSize: 11,
    color: BRAND.textMid,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND.textDark,
  },

  // ── Brand footer ──────────────────────────────────────────────────────
  brandFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.teal,
    marginRight: 6,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.teal,
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: 12,
    color: BRAND.textMid,
  },
});

export default ArticleShareCard;
