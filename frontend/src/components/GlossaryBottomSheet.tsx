import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { Sheet } from '@tamagui/sheet';
import {
  Button,
  Card,
  Paragraph,
  ScrollView,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import type { GlossaryTerm } from '../constants/glossary';

export type GlossaryBottomSheetProps = GlossaryTerm & {
  visible: boolean;
  onClose: () => void;
};

export default function GlossaryBottomSheet({
  visible,
  term,
  definition,
  category,
  relatedTerms = [],
  onClose,
}: GlossaryBottomSheetProps) {
  const [open, setOpen] = useState(visible);

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  useEffect(() => {
    if (!open) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => subscription.remove();
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={handleOpenChange}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      snapPoints={[55, 35]}
      animation="bouncy"
      zIndex={100000}
    >
      <Sheet.Overlay
        backgroundColor="rgba(15, 23, 42, 0.55)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle backgroundColor="$gray8" />
      <Sheet.Frame
        padding="$5"
        backgroundColor="$background"
        borderTopLeftRadius="$8"
        borderTopRightRadius="$8"
        accessibilityLabel={`Glossary definition for ${term}`}
      >
        <YStack gap="$4" width="100%">
          <XStack alignItems="flex-start" justifyContent="space-between" gap="$4">
            <YStack flex={1} gap="$2">
              {!!category && (
                <Text
                  color="$blue10"
                  fontSize={13}
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing={0.8}
                >
                  {category}
                </Text>
              )}
              <Text color="$color12" fontSize={26} fontWeight="800" lineHeight={32}>
                {term}
              </Text>
            </YStack>

            <Button
              circular
              size="$3"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={`Close glossary definition for ${term}`}
            >
              <Text fontSize={20} fontWeight="700">
                x
              </Text>
            </Button>
          </XStack>

          <ScrollView maxHeight={280} showsVerticalScrollIndicator>
            <Card
              bordered
              elevate
              padding="$4"
              borderRadius="$6"
              backgroundColor="$gray2"
            >
              <Paragraph color="$color11" fontSize={16} lineHeight={24}>
                {definition}
              </Paragraph>
            </Card>

            {relatedTerms.length > 0 && (
              <YStack gap="$3" marginTop="$4">
                <Text color="$color12" fontSize={16} fontWeight="700">
                  Related terms
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {relatedTerms.map((relatedTerm) => (
                    <Text
                      key={relatedTerm}
                      backgroundColor="$blue3"
                      color="$blue11"
                      borderRadius="$10"
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      fontSize={13}
                      fontWeight="600"
                    >
                      {relatedTerm}
                    </Text>
                  ))}
                </XStack>
              </YStack>
            )}
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
