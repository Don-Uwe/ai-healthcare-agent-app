import React from 'react';
import {Share, Linking, Image, useColorScheme} from 'react-native';
import VersionCheck from 'react-native-version-check';
import {
  YStack,
  XStack,
  Text,
  ScrollView,
  Button,
  View,
} from 'tamagui';
import {
  Ionicons,
  FontAwesome6,
} from '@expo/vector-icons';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AboutScreenProps} from '../type';
import {GlassContainer} from '../components/GlassContainer';
import {ProfessionalColors, Typography, Spacing} from '../styles/GlassStyles';

const AboutScreen = ({navigation}: AboutScreenProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const currentVersion = VersionCheck.getCurrentVersion();

  const onShare = async () => {
    try {
      await Share.share({
        message:
          'Get fit with Ultimate-Health 🌿\nYour ultimate wellness companion for a healthier lifestyle.\n\nDownload now:\nhttps://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth',
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('URL error', err));
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#000A60' : '#F0F8FF',
      }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor="#007AFF" />

      <ScrollView showsVerticalScrollIndicator={false} flex={1}>
        <View
          flex={1}
          backgroundColor={isDarkMode ? '#000A60' : '#F0F8FF'}
          paddingHorizontal="$4">
          {/* Header Section */}
          <YStack alignItems="center" marginTop="$6" marginBottom="$5" gap="$4">
            <View
              padding="$3"
              backgroundColor={ProfessionalColors.primaryGlass}
              borderRadius={100}
              borderWidth={2}
              borderColor={ProfessionalColors.primary}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={{
                  height: 100,
                  width: 100,
                  borderRadius: 50,
                }}
              />
            </View>

            <YStack alignItems="center" gap="$2">
              <Text
                style={[
                  Typography.h2,
                  {
                    color: isDarkMode
                      ? ProfessionalColors.white
                      : ProfessionalColors.gray900,
                  },
                ]}>
                Ultimate-Health
              </Text>
              <View
                backgroundColor={ProfessionalColors.successGlass}
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius={20}
                borderWidth={1}
                borderColor={ProfessionalColors.success}>
                <Text
                  style={{
                    color: ProfessionalColors.success,
                    fontSize: 11,
                    fontWeight: '700',
                  }}>
                  VERSION {currentVersion}
                </Text>
              </View>
            </YStack>

            <GlassContainer variant="card" style={{marginTop: Spacing.md}}>
              <Text
                style={[
                  Typography.body,
                  {
                    color: isDarkMode
                      ? ProfessionalColors.gray300
                      : ProfessionalColors.gray700,
                    textAlign: 'center',
                    lineHeight: 24,
                  },
                ]}>
                UltimateHealth is an innovative open-source platform that brings
                trusted health resources and reliable articles together in one
                place. It serves as a single repository for verified health
                insights and dependable information.
              </Text>
            </GlassContainer>
          </YStack>

          {/* Legal Section */}
          <YStack marginTop="$4" gap="$3">
            <Text
              style={[
                Typography.h6,
                {
                  color: isDarkMode
                    ? ProfessionalColors.gray400
                    : ProfessionalColors.gray600,
                  marginLeft: Spacing.xs,
                },
              ]}>
              LEGAL
            </Text>

            <GlassContainer variant="card">
              <YStack gap="$2">
                <MenuButton
                  icon="document-text-outline"
                  title="Terms & Conditions"
                  iconColor={ProfessionalColors.primary}
                  onPress={() => navigation.navigate('Privacy')}
                  isDarkMode={isDarkMode}
                />

                <MenuButton
                  icon="shield-checkmark-outline"
                  title="Privacy Policy"
                  iconColor={ProfessionalColors.success}
                  onPress={() =>
                    openLink(
                      'https://www.freeprivacypolicy.com/live/0b40215e-e456-48cc-a549-424216da1e01',
                    )
                  }
                  isDarkMode={isDarkMode}
                />
              </YStack>
            </GlassContainer>
          </YStack>

          {/* Community Section */}
          <YStack marginTop="$4" gap="$3">
            <Text
              style={[
                Typography.h6,
                {
                  color: isDarkMode
                    ? ProfessionalColors.gray400
                    : ProfessionalColors.gray600,
                  marginLeft: Spacing.xs,
                },
              ]}>
              COMMUNITY
            </Text>

            <GlassContainer variant="card">
              <YStack gap="$2">
                <MenuButton
                  icon="share-social-outline"
                  title="Share App"
                  iconColor={ProfessionalColors.info}
                  onPress={onShare}
                  isDarkMode={isDarkMode}
                />

                <MenuButton
                  icon="people-outline"
                  title="Contributors"
                  iconColor="#a855f7"
                  onPress={() => navigation.navigate('ContributorPage')}
                  isDarkMode={isDarkMode}
                />

                <MenuButton
                  icon="logo-github"
                  title="Open Source Programs"
                  iconColor="#06402B"
                  onPress={() => navigation.navigate('OpenSourcePage')}
                  isDarkMode={isDarkMode}
                />

                <MenuButton
                  icon="star-outline"
                  title="Rate App"
                  iconColor={ProfessionalColors.warning}
                  onPress={() =>
                    openLink(
                      'https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth',
                    )
                  }
                  isDarkMode={isDarkMode}
                />
              </YStack>
            </GlassContainer>
          </YStack>

          {/* Social Links */}
          <YStack alignItems="center" marginTop="$6" marginBottom="$4" gap="$4">
            <Text
              style={[
                Typography.bodySmall,
                {
                  color: isDarkMode
                    ? ProfessionalColors.gray400
                    : ProfessionalColors.gray600,
                  fontWeight: '700',
                },
              ]}>
              CONNECT WITH US
            </Text>

            <XStack gap="$4">
              <SocialCircle
                icon="github"
                onPress={() =>
                  openLink('https://github.com/SB2318/UltimateHealth')
                }
                isDarkMode={isDarkMode}
              />

              <SocialCircle
                icon="linkedin"
                onPress={() =>
                  openLink('https://linkedin.com/in/ultimate-health-9290873a8/')
                }
                isDarkMode={isDarkMode}
              />

              <SocialCircle
                icon="envelope"
                onPress={() => openLink('mailto:ultimate.health25@gmail.com')}
                isDarkMode={isDarkMode}
              />
            </XStack>
          </YStack>

          {/* Footer */}
          <YStack alignItems="center" marginTop="$6" marginBottom="$8" gap="$2">
            <Text
              style={[
                Typography.bodySmall,
                {
                  color: isDarkMode
                    ? ProfessionalColors.gray500
                    : ProfessionalColors.gray600,
                },
              ]}>
              Built for excellence
            </Text>
            <Text
              style={[
                Typography.bodyMedium,
                {
                  color: ProfessionalColors.primary,
                  fontWeight: '600',
                },
              ]}>
              ultimate.health25@gmail.com
            </Text>
          </YStack>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Menu Button Component
const MenuButton = ({
  icon,
  title,
  iconColor,
  onPress,
  isDarkMode,
}: {
  icon: string;
  title: string;
  iconColor: string;
  onPress: () => void;
  isDarkMode: boolean;
}) => (
  <Button
    unstyled
    onPress={onPress}
    backgroundColor="transparent"
    pressStyle={{opacity: 0.7}}
    padding="$3"
    borderRadius={12}>
    <XStack alignItems="center" gap="$3" flex={1}>
      <View
        backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
        padding="$2"
        borderRadius={10}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <Text
        style={[
          Typography.bodyMedium,
          {
            color: isDarkMode
              ? ProfessionalColors.white
              : ProfessionalColors.gray800,
            flex: 1,
          },
        ]}>
        {title}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={
          isDarkMode ? ProfessionalColors.gray500 : ProfessionalColors.gray600
        }
      />
    </XStack>
  </Button>
);

// Social Circle Component
const SocialCircle = ({
  icon,
  onPress,
  isDarkMode,
}: {
  icon: string;
  onPress: () => void;
  isDarkMode: boolean;
}) => (
  <Button
    circular
    size="$5"
    backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
    borderWidth={1}
    borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
    onPress={onPress}
    pressStyle={{
      scale: 0.95,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    }}>
    <FontAwesome6
      name={icon as any}
      size={22}
      color={isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray800}
    />
  </Button>
);

export default AboutScreen;
