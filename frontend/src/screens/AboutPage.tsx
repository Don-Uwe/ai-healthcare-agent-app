import React from 'react';
import {Share, Linking, Image} from 'react-native';
import VersionCheck from 'react-native-version-check';
import {
  YStack,
  XStack,
  Text,
  Circle,
  ScrollView,
  ListItem,
  Theme,
  Button,
  styled,
  View,
} from 'tamagui';
import {
  Ionicons,
  FontAwesome6,
} from '@expo/vector-icons';
import { AboutScreenProps } from '../type';
import { ON_PRIMARY_COLOR } from '../helper/Theme';



const SectionCard = styled(YStack, {
  //  backgroundColor: '#161b22',
  borderRadius: 20,
  //borderWidth: 1,
  //borderColor: '#1e293b',
  overflow: 'hidden',
  padding: '$2',
  marginBottom: '$4',
});

const AboutScreen = ({navigation}:AboutScreenProps) => {

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
    <Theme name="light">
      <ScrollView showsVerticalScrollIndicator={false}>

        <View flex={1} backgroundColor={ON_PRIMARY_COLOR}>
        {/* 1. Header Section */}
        <YStack alignItems="center" marginTop="$8" marginBottom="$4" gap="$4">
          <YStack
            padding="$4"
            //  backgroundColor="rgba(16, 185, 129, 0.1)"
            borderRadius="$6"
            // borderWidth={1}
          >
            <Circle size={60} elevation={10}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={{
                  height: 90,
                  width: 90,
                  borderRadius: 60,
                  alignSelf: 'center',
                  resizeMode: 'cover',
                }}
              />
            </Circle>
          </YStack>

          <YStack alignItems="center">
            <Text color="$gray700" fontWeight="bold" fontSize={28}>
              Ultimate-Health
            </Text>
            <Text
              color="#10b981"
              fontSize={12}
              fontWeight="900"
              //lineHeight={2}
              marginTop="$1">
              VERSION {currentVersion}
            </Text>
          </YStack>

          <Text
            color="$gray600"
            textAlign="center"
            paddingHorizontal="$4"
            fontSize={14}
            lineHeight={22}>
            UltimateHealth is an innovative open-source platform that brings
            trusted health resources and reliable articles together in one
            place. It serves as a single repository for verified health insights
            and dependable information.
          </Text>
        </YStack>

        {/* 2 & 3. Legal Section */}
        <Text
          color="#475569"
          fontSize={17}
          fontWeight="bold"
          marginLeft="$4"
          marginBottom="$1">
          LEGAL
        </Text>
        <SectionCard>
          <ListItem
            hoverTheme
            pressTheme
            padding={14}
            marginVertical={2}
            borderRadius={10}
            title={
              <Text color="$gray700" fontWeight="700">
                Terms & Conditions
              </Text>
            }
            icon={
              <Ionicons
                name="document-text-outline"
                size={23}
                color="#10b981"
              />
            }
            iconAfter={
              <Ionicons name="chevron-forward" size={18} color="#475569" />
            }
            onPress={() => {
              navigation.navigate('Privacy');
            }}
          />

          <ListItem
            hoverTheme
            pressTheme
            padding={14}
            marginVertical={3}
            borderRadius={10}
            title={
              <Text color="$gray700" fontWeight="700">
                Privacy Policy
              </Text>
            }
            icon={
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color="#10b981"
              />
            }
            iconAfter={
              <Ionicons name="chevron-forward" size={18} color="#475569" />
            }
            onPress={() => {
              //navigation.navigate('Privacy');
              openLink('https://www.freeprivacypolicy.com/live/0b40215e-e456-48cc-a549-424216da1e01')
            }}
          />
        </SectionCard>

        {/* 4, 5 & 7. Community Section */}
        <Text
          color="#475569"
          fontSize={17}
          fontWeight="bold"
          //lineHeight={1.5}
          marginLeft="$4"
          marginBottom="$1"
          marginTop="$1">
          COMMUNITY
        </Text>
        <SectionCard>
          <ListItem
            pressTheme
            padding={14}
            marginVertical={3}
            borderRadius={10}
            title={
              <Text color="$gray700" fontWeight="700">
                Share App
              </Text>
            }
            icon={
              <Ionicons name="share-social-outline" size={23} color="#3b82f6" />
            }
            onPress={onShare}
          />

          <ListItem
            pressTheme
            padding={14}
            marginVertical={3}
            borderRadius={10}
            title={
              <Text color="$gray700" fontWeight="700">
                Contributors
              </Text>
            }
            icon={<Ionicons name="people-outline" size={23} color="#a855f7" />}
            onPress={() => {
              navigation.navigate('ContributorPage');
            }}
          />

           <ListItem
            pressTheme
            padding={14}
            marginVertical={3}
            borderRadius={10}
            title={
              <Text color="$gray700" fontWeight="700">
               Open source programs
              </Text>
            }
            icon={<FontAwesome6 name="github" size={23} color="#06402B" />}
            onPress={() => {
              navigation.navigate('OpenSourcePage');
            }}
          />

          <ListItem
            pressTheme
            padding={14}
            marginVertical={3}
            borderRadius={10}
            title={
              <Text color="$gray700" fontWeight="700">
                Rate App
              </Text>
            }
            icon={<Ionicons name="star-outline" size={20} color="#f59e0b" />}
            onPress={() => openLink('https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth')}
          />
        </SectionCard>

        {/* 6. Social Links */}
        <YStack alignItems="center" marginTop="$2" gap="$4">
          <Text color="#475569" fontSize={13} fontWeight="900">
            CONNECT WITH US
          </Text>
          <XStack gap="$4">
            <SocialCircle
              icon="github"
              onPress={() =>
                openLink('https://github.com/SB2318/UltimateHealth')
              }
            />
           
            <SocialCircle
              icon="linkedin"
              onPress={() => openLink('https://linkedin.com/in/ultimate-health-9290873a8/')}
            />
            <SocialCircle
              icon="mail-forward"
              onPress={() => openLink('mailto:ultimate.health25@gmail.com')}
            />
          </XStack>
        </YStack>

        {/* Footer */}
        <YStack alignItems="center" marginTop="$10" marginBottom="$6">
          <Text color="#475569" fontSize={12}>
            Built for excellence
          </Text>
          <Text color="#10b981" fontSize={14} fontWeight="bold" marginTop="$1">
            ultimate.health25@gmail.com
          </Text>
        </YStack>
        </View>
      </ScrollView>
    </Theme>
  );
};

// --- Sub-component for Social Buttons ---
const SocialCircle = ({icon, onPress}: {icon: string; onPress: () => void}) => (
  <Button
    circular
    size="$5"
    backgroundColor="#161b22"
    borderWidth={1}
    borderColor="#1e293b"
    onPress={onPress}
    pressStyle={{scale: 0.9, backgroundColor: '#1e293b'}}>
    <FontAwesome6 name={icon as any} size={22} color="#e2e8f0" />
  </Button>
);

export default AboutScreen;
