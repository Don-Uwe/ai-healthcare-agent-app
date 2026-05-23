import React, { useEffect, useState } from 'react';
import { YStack, XStack, Text, Button, Circle, ScrollView as TamaguiScrollView, useTheme } from 'tamagui';
import { Sheet } from '@tamagui/sheet';
import Feather from '@expo/vector-icons/Feather';

interface BenefitsModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSignUp: () => void;
}

const benefits = [
  {
    title: 'Engage with Articles',
    description: 'Post, Like & Comment on Articles',
    icon: 'edit-3',
  },
  {
    title: 'Podcast Community',
    description: 'Join Exclusive Podcast Discussions',
    icon: 'headphones',
  },
  {
    title: 'Offline Reading',
    description: 'Save Favorites for Offline Reading',
    icon: 'bookmark',
  },
  {
    title: 'Achievements',
    description: 'Earn Contribution Badges & Streaks',
    icon: 'award',
  },
];

export default function BenefitsModal({ visible, onDismiss, onSignUp }: BenefitsModalProps) {
  const [open, setOpen] = useState(visible);
  const theme = useTheme();
  
  // Use Tamagui theme values for vector icons
  const primaryColor = theme.primary?.val || '#3b82f6';

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onDismiss();
    }
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={handleOpenChange}
      dismissOnSnapToBottom
      snapPoints={[75, 50]}
      zIndex={100000}
      animation="bouncy"
    >
      <Sheet.Overlay
        animation="fast"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0, 0, 0, 0.6)"
      />
      <Sheet.Handle backgroundColor="$color5" />
      <Sheet.Frame 
        padding="$5" 
        backgroundColor="$background" 
        borderTopLeftRadius="$6" 
        borderTopRightRadius="$6" 
        zIndex={100001}
      >
        <TamaguiScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <YStack gap="$4" alignItems="center" paddingTop="$2">
            
            <Circle size={64} backgroundColor="$backgroundLight" marginBottom="$2">
              <Feather name="star" size={32} color={primaryColor as string} />
            </Circle>

            <Text fontSize={24} fontWeight="800" color="$color" textAlign="center">
              Why Join Us?
            </Text>
            
            <Text 
              fontSize={15} 
              color="$color10" 
              textAlign="center" 
              lineHeight={22} 
              paddingHorizontal="$2" 
              marginBottom="$4"
            >
              Create an account to unlock the full potential of your health journey and interact with our community.
            </Text>

            <YStack width="100%" gap="$3" marginBottom="$6">
              {benefits.map((item, index) => (
                <XStack 
                  key={index} 
                  gap="$4" 
                  alignItems="center" 
                  backgroundColor="$backgroundLight" 
                  padding="$4" 
                  borderRadius="$4"
                >
                  <Circle size={48} backgroundColor="$background">
                    <Feather name={item.icon as any} size={22} color={primaryColor as string} />
                  </Circle>
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="700" color="$color">{item.title}</Text>
                    <Text fontSize={14} color="$color10" marginTop="$1">{item.description}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>

            <Button
              size="$6"
              width="100%"
              backgroundColor="$primary"
              borderRadius="$4"
              pressStyle={{ scale: 0.97 }}
              animation="fast"
              onPress={() => {
                setOpen(false);
                onDismiss();
                onSignUp();
              }}
            >
              <Text fontSize={18} fontWeight="700" color="$white">
                Sign Up Now
              </Text>
            </Button>
            
            <Button
              size="$5"
              width="100%"
              backgroundColor="transparent"
              borderWidth={0}
              marginTop="$2"
              pressStyle={{ scale: 0.97, opacity: 0.7 }}
              animation="fast"
              onPress={() => {
                setOpen(false);
                onDismiss();
              }}
            >
              <Text fontSize={16} fontWeight="600" color="$color10">
                Maybe Later
              </Text>
            </Button>
          </YStack>
        </TamaguiScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
