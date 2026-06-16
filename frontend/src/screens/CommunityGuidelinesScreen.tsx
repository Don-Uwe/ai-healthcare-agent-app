import React from 'react';
import { Share, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, YStack, XStack, Text, Button, View, Separator } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { ProfessionalColors, Typography, Spacing } from '../styles/GlassStyles';
import { GlassContainer } from '../components/GlassContainer';
import { useScrollControls } from '../hooks/useScrollControls';
import { ScrollActionButtons } from '../components/ScrollActionButtons';
import type { CommunityGuidelinesScreenProps } from '../type';

interface Section {
  id: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  points: string[];
  note: string;
  noteType: 'warning' | 'info' | 'error';
}

const sections: Section[] = [
  {
    id: 1,
    title: 'Respect Every Community Member',
    icon: 'people-outline',
    iconColor: ProfessionalColors.info,
    points: [
      'Communicate with kindness and respect in all interactions',
      'Engage in healthy, constructive discussions',
      'Support fellow community members on their wellness journey',
      'Embrace inclusive participation across all languages and cultures',
    ],
    note: 'Harassment, hate speech, bullying, and abusive behavior are strictly prohibited.',
    noteType: 'warning',
  },
  {
    id: 2,
    title: 'Share Responsible Health Information',
    icon: 'medkit-outline',
    iconColor: ProfessionalColors.success,
    points: [
      'Share only trustworthy and meaningful health content',
      'Clearly distinguish opinions from established facts',
      'Avoid spreading misinformation or unverified medical claims',
      'Always encourage readers to consult healthcare professionals for medical advice',
    ],
    note: 'Misleading or harmful health claims may be removed and could result in account restrictions.',
    noteType: 'warning',
  },
  {
    id: 3,
    title: 'Respect Language & Cultural Diversity',
    icon: 'language-outline',
    iconColor: '#a855f7',
    points: [
      'Celebrate the multilingual nature of our global community',
      'Respect all languages and cultural backgrounds',
      'Avoid mockery, discrimination, or exclusion based on language or culture',
      'Promote inclusive communication that bridges communities',
    ],
    note: 'UltimateHealth supports content in multiple languages \u2014 respect every voice.',
    noteType: 'info',
  },
  {
    id: 4,
    title: 'Podcast & Media Guidelines',
    icon: 'mic-outline',
    iconColor: ProfessionalColors.warning,
    points: [
      'Respect copyrights \u2014 only upload content you have the right to share',
      'Avoid harmful, explicit, or offensive material in podcasts and media',
      'Ensure all uploaded content is meaningful and adds value to the community',
      'Provide accurate descriptions and tags for your media',
    ],
    note: 'Copyright violations will result in content removal and potential account suspension.',
    noteType: 'warning',
  },
  {
    id: 5,
    title: 'Content & Review Guidelines',
    icon: 'create-outline',
    iconColor: ProfessionalColors.primary,
    points: [
      'Provide constructive and thoughtful reviews of articles and podcasts',
      'Offer meaningful feedback that helps fellow creators improve',
      'Engage honestly with content through ratings and discussions',
    ],
    note: 'Spam, fake engagement, manipulative ratings, and repetitive low-quality content are not permitted.',
    noteType: 'warning',
  },
  {
    id: 6,
    title: 'Privacy & Safety',
    icon: 'shield-checkmark-outline',
    iconColor: ProfessionalColors.success,
    points: [
      "Respect the privacy of all community members",
      "Never share sensitive personal information \u2014 yours or others'",
      'Do not impersonate individuals, organizations, or create fake identities',
      'Report privacy violations you encounter to the moderation team',
    ],
    note: 'Protecting your privacy is our priority \u2014 and yours too.',
    noteType: 'info',
  },
  {
    id: 7,
    title: 'Prohibited Activities',
    icon: 'warning-outline',
    iconColor: ProfessionalColors.error,
    points: [
      'Harassment, intimidation, or targeted abuse of any kind',
      'Hate speech, discriminatory language, or incitement to violence',
      'Spam, phishing, scams, or any form of deceptive activity',
      'Copyright infringement or unauthorized use of intellectual property',
      'Deliberate dissemination of health misinformation',
      'Any malicious activity that compromises platform integrity',
    ],
    note: 'Engaging in prohibited activities may lead to immediate content removal and account restriction.',
    noteType: 'error',
  },
  {
    id: 8,
    title: 'Moderation & Enforcement',
    icon: 'shield-checkmark-outline',
    iconColor: ProfessionalColors.secondary,
    points: [
      'The UltimateHealth team reserves the right to remove inappropriate content',
      'Discussions may be moderated to maintain a safe and respectful environment',
      'Accounts violating these guidelines may be temporarily or permanently restricted',
      'Repeated or severe violations will result in escalated enforcement actions',
    ],
    note: "Our moderation decisions are made with fairness and the community's best interests in mind.",
    noteType: 'info',
  },
];

const NOTE_ICONS = {
  warning: 'alert-circle' as const,
  error: 'warning' as const,
  info: 'information-circle' as const,
} as const;

const NOTE_COLORS = {
  warning: {
    bg: ProfessionalColors.warningGlass,
    border: ProfessionalColors.warning,
    text: ProfessionalColors.warning,
  },
  info: {
    bg: ProfessionalColors.infoGlass,
    border: ProfessionalColors.info,
    text: ProfessionalColors.info,
  },
  error: {
    bg: ProfessionalColors.errorGlass,
    border: ProfessionalColors.error,
    text: ProfessionalColors.error,
  },
} as const;

interface SectionNoteProps {
  text: string;
  type: 'warning' | 'info' | 'error';
}

const SectionNote = ({ text, type }: SectionNoteProps) => {
  const c = NOTE_COLORS[type];

  return (
    <XStack
      backgroundColor={c.bg}
      borderWidth={1}
      borderColor={c.border}
      borderRadius={12}
      padding="$3"
      gap="$2"
      marginTop="$2"
      accessibilityRole="alert"
      accessibilityLabel={text}
    >
      <View marginTop={1}>
        <Ionicons name={NOTE_ICONS[type]} size={18} color={c.text} />
      </View>
      <Text
        style={{
          ...Typography.bodySmall,
          color: c.text,
          flex: 1,
          lineHeight: 20,
        }}
      >
        {text}
      </Text>
    </XStack>
  );
};

const CommunityGuidelinesScreen = (_props: CommunityGuidelinesScreenProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { scrollRef, onScroll, topVisible, topOpacity, bottomVisible, bottomOpacity, scrollToTop, scrollToBottom } = useScrollControls({ threshold: 300, bottomThreshold: 50 });

  const onShare = async () => {
    try {
      await Share.share({
        message:
          'Check out the UltimateHealth Community Guidelines \nLearn how we keep our wellness community safe and respectful.\n\nDownload UltimateHealth:\nhttps://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth',
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const bgColor = isDarkMode ? '#000A60' : '#F0F8FF';
  const textColor = isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray900;
  const subtextColor = isDarkMode ? ProfessionalColors.gray400 : ProfessionalColors.gray600;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        flex={1}
        accessibilityLabel="Community Guidelines"
      >
        <View
          flex={1}
          backgroundColor={bgColor}
          paddingHorizontal="$4"
        >
          <YStack marginTop="$6" marginBottom="$5" gap="$4">
            <XStack alignItems="center" gap="$3" accessibilityRole="header">
              <View
                padding="$3"
                backgroundColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,191,255,0.15)'}
                borderRadius={16}
                borderWidth={1.5}
                borderColor={isDarkMode ? 'rgba(255,255,255,0.2)' : ProfessionalColors.primary}
              >
                <Ionicons
                  name="book-outline"
                  size={32}
                  color={isDarkMode ? ProfessionalColors.white : ProfessionalColors.primary}
                  accessibilityIgnoresInvertColors
                />
              </View>
              <YStack gap="$1" flex={1}>
                <Text
                  style={{
                    ...Typography.h3,
                    color: textColor,
                  }}
                >
                  Community Guidelines
                </Text>
                <Text
                  style={{
                    ...Typography.bodySmall,
                    color: subtextColor,
                  }}
                >
                  Empowering Wellness Through Global Community
                </Text>
              </YStack>
            </XStack>

            <GlassContainer variant="card">
              <Text
                style={{
                  ...Typography.body,
                  color: isDarkMode ? ProfessionalColors.gray300 : ProfessionalColors.gray700,
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                UltimateHealth brings together a diverse global community united by a shared passion for wellness. These guidelines help maintain a respectful, safe, and informative environment for everyone.
              </Text>
            </GlassContainer>
          </YStack>

          <Separator
            borderColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
            marginBottom="$5"
          />

          <YStack gap="$4" marginBottom="$6">
            {sections.map((section) => (
              <GlassContainer key={section.id} variant="card">
                <YStack gap="$2">
                  <XStack alignItems="center" gap="$3" accessibilityRole="header">
                    <View
                      backgroundColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'}
                      padding="$2"
                      borderRadius={12}
                    >
                      <Ionicons name={section.icon} size={22} color={section.iconColor} />
                    </View>
                    <Text
                      style={{
                        ...Typography.h5,
                        color: isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray800,
                        flex: 1,
                      }}
                    >
                      {section.title}
                    </Text>
                  </XStack>

                  <YStack gap="$1.5" marginLeft={45}>
                    {section.points.map((point, i) => (
                      <XStack key={i} gap="$2" alignItems="flex-start">
                        <Text
                          style={{
                            color: section.iconColor,
                            fontSize: 16,
                            lineHeight: 24,
                            marginTop: -1,
                          }}
                          accessibilityRole="text"
                        >
                          {'\u2022'}
                        </Text>
                        <Text
                          style={{
                            ...Typography.body,
                            color: isDarkMode ? ProfessionalColors.gray300 : ProfessionalColors.gray700,
                            flex: 1,
                            lineHeight: 24,
                          }}
                        >
                          {point}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>

                  <SectionNote text={section.note} type={section.noteType} />
                </YStack>
              </GlassContainer>
            ))}
          </YStack>

          <GlassContainer variant="card" style={{ marginBottom: Spacing.lg }}>
            <YStack gap="$3" alignItems="center">
              <Ionicons name="heart-outline" size={32} color={ProfessionalColors.error} />
              <Text
                style={{
                  ...Typography.h5,
                  color: textColor,
                  textAlign: 'center',
                }}
              >
                Together, We Build a Healthier Community
              </Text>
              <Text
                style={{
                  ...Typography.body,
                  color: isDarkMode ? ProfessionalColors.gray300 : ProfessionalColors.gray600,
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                Thank you for being part of UltimateHealth. Your contributions, respect, and kindness make this community thrive.
              </Text>
              <Button
                backgroundColor={ProfessionalColors.primary}
                borderRadius={12}
                paddingHorizontal="$6"
                paddingVertical="$3"
                pressStyle={{ opacity: 0.8, scale: 0.97 }}
                onPress={onShare}
                marginTop="$2"
                accessibilityRole="button"
                accessibilityLabel="Share Community Guidelines"
              >
                <XStack gap="$2" alignItems="center">
                  <Ionicons name="share-social-outline" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Share Guidelines</Text>
                </XStack>
              </Button>
            </YStack>
          </GlassContainer>

          <YStack alignItems="center" marginBottom="$11" gap="$2">
            <Text
              style={{
                ...Typography.caption,
                color: ProfessionalColors.gray500,
              }}
            >
              {'\u00A9'} 2025 UltimateHealth {'\u2014'} All rights reserved
            </Text>
            <Text
              style={{
                ...Typography.caption,
                color: ProfessionalColors.gray500,
              }}
            >
              These guidelines were last updated on 2025
            </Text>
          </YStack>
        </View>
      </ScrollView>
      <ScrollActionButtons
        topOpacity={topOpacity}
        onScrollToTop={scrollToTop}
        topVisible={topVisible}
        bottomOpacity={bottomOpacity}
        onScrollToBottom={scrollToBottom}
        bottomVisible={bottomVisible}
        buttonColor="#007AFF"
        iconColor="#fff"
      />
    </SafeAreaView>
  );
};

export default CommunityGuidelinesScreen;
