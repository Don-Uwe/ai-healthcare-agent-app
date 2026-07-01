/**
 * useArticleShare.ts
 *
 * Custom hook that:
 *  1. Captures an ArticleShareCard view ref as a PNG image
 *     using react-native-view-shot.
 *  2. Opens the native share sheet (react-native Share API) so the
 *     user can send the card image to any app.
 *
 * Dependencies (add to package.json if not present):
 *   yarn add react-native-view-shot
 *
 * Usage:
 *   const { cardRef, isCapturing, shareArticleCard } = useArticleShare();
 *   // Pass `cardRef` to <ArticleShareCard cardRef={cardRef} ... />
 *   // Call `shareArticleCard()` from a share button's onPress.
 */

import { useRef, useState, useCallback } from 'react';
import { Share, Platform, Alert, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseArticleShareReturn {
  /** Attach to the ArticleShareCard's cardRef prop */
  cardRef: React.RefObject<View | null>;
  /** True while the capture + share flow is in progress */
  isCapturing: boolean;
  /** Call this to trigger capture → share sheet */
  shareArticleCard: (articleTitle?: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useArticleShare(): UseArticleShareReturn {
  const cardRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const shareArticleCard = useCallback(
    async (articleTitle?: string) => {
      if (!cardRef.current) {
        Alert.alert('Share', 'Unable to generate preview card.');
        return;
      }

      setIsCapturing(true);

      try {
        // Capture the card view as a high-quality PNG
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 1,
          // Use a higher pixel density for crisp cards on retina displays
          result: 'tmpfile',
          snapshotContentContainer: false,
        });

        // Open the native share sheet
        const shareContent =
          Platform.OS === 'android'
            ? {
                // Android — share the image file URI directly
                title: articleTitle ?? 'UltimateHealth Article',
                url: uri,
                message: articleTitle
                  ? `Check out this article on UltimateHealth: "${articleTitle}"`
                  : 'Check out this article on UltimateHealth!',
              }
            : {
                // iOS — Share.share accepts url for images
                url: uri,
                message: articleTitle
                  ? `Check out this article on UltimateHealth: "${articleTitle}"`
                  : 'Check out this article on UltimateHealth!',
              };

        await Share.share(shareContent, {
          dialogTitle: 'Share Article',
          subject: articleTitle ?? 'UltimateHealth Article',
        });
      } catch (error: unknown) {
        // User dismissed the share sheet — not an error worth surfacing
        if (
          error instanceof Error &&
          error.message !== 'User did not share'
        ) {
          console.warn('[useArticleShare] Share error:', error);
          Alert.alert(
            'Share failed',
            'Could not generate the preview card. Please try again.',
          );
        }
      } finally {
        setIsCapturing(false);
      }
    },
    [],
  );

  return { cardRef, isCapturing, shareArticleCard };
}
