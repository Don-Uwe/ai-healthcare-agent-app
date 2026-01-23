import React from 'react';
import { ScrollView, Image, Linking } from 'react-native';
import { 
  YStack, 
  XStack, 
  Text, 
  Card, 
  H3,
  Separator,
  Theme, 
 
  Paragraph,
  Button
} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
// Corrected Icon Imports
import { FontAwesome5, Ionicons, Entypo, MaterialIcons } from '@expo/vector-icons';

const PROGRAMS = [
  {
    id: 1,
    name: 'IEEE IGDTUW Open Source Week',
    logo: 'https://github.com/user-attachments/assets/e0a40d06-f5b8-42a7-a5a0-033280f842be',
    description: 'A week-long event aimed at fostering collaboration and skill-building in open-source.',
    date: 'Nov 12,2025 - Nov 18, 2025',
    type: 'Community Event',
    link: 'https://github.com/UltimateHealth'
  },
  {
    id: 2,
    name: 'Vultr Cloud Innovate Hackathon',
    logo: 'https://github.com/user-attachments/assets/2b03167c-a598-48be-9f93-66130e58ec00',
    description: "Challenges participants to harness the power of Vultr's cloud infrastructure to develop creative solutions.",
    date: '',
    type: 'Hackathon',
    link: 'https://github.com/UltimateHealth'
  },
  {
    id: 3,
    name: 'GirlScript Summer of Code 2024',
    logo: 'https://user-images.githubusercontent.com/63473496/153487849-4f094c16-d21c-463e-9971-98a8af7ba372.png',
    description: 'A three-month-long program to bring beginners into Open-Source Software Development.',
    date: 'May  2024 - Aug 2024',
    type: 'Open Source',
    link: 'https://gssoc.girlscript.tech/'
  }
];

const ProgramsPage = () => {
  const handlePress = (url: string) => Linking.openURL(url);

  return (
    <Theme name="light">
      <SafeAreaView style={{
        flex:1, 
        backgroundColor:"#F0F8FF"
      }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Header Section */}
          <YStack padding="$6" paddingTop="$10" alignItems="center" gap="$2">
            <XStack alignItems="center" gap="$3">
              <FontAwesome5 name="trophy" size={30} color="#1A91FF" />
              <Text fontSize={24} fontWeight="900" color="#1A202C" letterSpacing={-0.5}>Programs</Text>
            </XStack>
            <Paragraph color="$gray10" textAlign="center" fontSize={15}>
              Participated Open Source Programs & Hackathons
            </Paragraph>
            <Separator borderWidth={2} width={60} borderColor="#1A91FF" marginTop="$2" borderRadius={10} />
          </YStack>

          {/* Programs Cards List */}
          <YStack padding="$4" gap="$6" paddingBottom="$10">
            {PROGRAMS.map((program) => (
              <Card 
                key={program.id}
                elevate
                bordered
                borderRadius={25}
                backgroundColor="white"
                animation="bouncy"
                hoverStyle={{ scale: 0.98 }}
                pressStyle={{ scale: 0.96 }}
                onPress={() => handlePress(program.link)}
              >
                {/* Logo Section */}
                <YStack 
                  backgroundColor="white" 
                  alignItems="center" 
                  justifyContent="center" 
                  padding="$5" 
                  height={140}
                  borderTopLeftRadius={25}
                  borderTopRightRadius={25}
                >
                  <Image 
                    source={{ uri: program.logo }} 
                    style={{ width: '90%', height: '100%', resizeMode: 'contain' }} 
                  />
                </YStack>

                {/* Content Section */}
                <YStack padding="$5" gap="$3" borderTopWidth={1} borderTopColor="#F0F0F0">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1} space="$1">
                      <H3 fontSize={20} fontWeight="800" color="#1A91FF" lineHeight={24}>
                        {program.name}
                      </H3>
                      <XStack alignItems="center" gap="$1.5">
                        <MaterialIcons name="verified" size={14} color="#4CAF50" />
                        <Text color="$gray10" fontWeight="700" fontSize={11} textTransform="uppercase">
                          {program.type}
                        </Text>
                      </XStack>
                    </YStack>
                  </XStack>

                  <Paragraph color="#4A5568" fontSize={14} lineHeight={20}>
                    {program.description}
                  </Paragraph>

                  {/* Info Row */}
                  <XStack alignItems="center" justifyContent="space-between" marginTop="$2">
                    <XStack alignItems="center" gap="$4">
                      <XStack alignItems="center" gap="$1.5">
                        <Ionicons name="calendar-outline" size={16} color="#718096" />
                        <Text color="#718096" fontSize={13} fontWeight="500">{program.date}</Text>
                      </XStack>
                      <XStack alignItems="center" gap="$1.5">
                        <Entypo name="globe" size={16} color="#718096" />
                        <Text color="#718096" fontSize={13} fontWeight="500">Online</Text>
                      </XStack>
                    </XStack>
                    
                    <Button 
                      size="$3" 
                      circular 
                      icon={<MaterialIcons name="arrow-forward" size={18} color="white" />} 
                      backgroundColor="#1A91FF"
                      elevation={2}
                    />
                  </XStack>
                </YStack>
              </Card>
            ))}
          </YStack>

        </ScrollView>
      </SafeAreaView>
    </Theme>
  );
};

export default ProgramsPage;