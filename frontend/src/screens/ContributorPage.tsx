import React, {useState, useMemo} from 'react';
import {Linking, FlatList} from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Avatar,
  Card,
  Theme,
  H2,
  Circle,
  Input,
} from 'tamagui';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons, FontAwesome5} from '@expo/vector-icons';


const CONTRIBUTORS = [
  {
    id: 1,
    name: 'Susmita Bhattacharya',
    handle: '@SB2318',
    img: 'https://avatars.githubusercontent.com/u/87614560?v=4',
    url: 'https://github.com/SB2318',
  },
  {
    id: 2,
    name: 'Suhani Singh Paliwal',
    handle: '@suhanipaliwal',
    img: 'https://avatars.githubusercontent.com/u/161575955?v=4',
    url: 'https://github.com/suhanipaliwal',
  
  },
  {
    id: 3,
    name: 'Balaharisankar Lakshmanaperumal',
    handle: '@BHS-Harish',
    img: 'https://avatars.githubusercontent.com/u/114602603?v=4',
    url: 'https://github.com/BHS-Harish',
 
  },
  {
    id: 4,
    name: 'Sharma Nischay',
    handle: '@SharmaNishchay',
    img: 'https://avatars.githubusercontent.com/u/146124877?v=4',
    url: 'https://github.com/SharmaNishchay',
   
  },
  {
    id: 5,
    name: 'Neeraj Saini',
    handle: '@officeneerajsaini',
    img: 'https://avatars.githubusercontent.com/u/118799941?v=4',
    url: 'https://github.com/officeneerajsaini',
  },
  {
    id: 6,
    name: 'Meghana Gottapu',
    handle: '@meghanagottapu',
    img: 'https://avatars.githubusercontent.com/u/43183125?v=4',
    url: 'https://github.com/meghanagottapu',
  },
  {
    id: 7,
    name: 'Jaickey Joy Minj',
    handle: '@jaickeyminj',
    img: 'https://avatars.githubusercontent.com/u/95216865?v=4',
    url: 'https://github.com/jaickeyminj',
  },
  {
    id: 8,
    name: 'Siddheya Kulkarni',
    handle: '@Asymtode712',
    img: 'https://avatars.githubusercontent.com/u/115717746?v=4',
    url: 'https://github.com/Asymtode712',
  },
  {
    id: 9,
    name: 'Pradnya Gaitonde',
    handle: '@PradnyaGaitonde',
    img: 'https://avatars.githubusercontent.com/u/116059908?v=4',
    url: 'https://github.com/PradnyaGaitonde',
  },
  {
    id: 10,
    name: 'Sanmarg Sandeep Paranjpe',
    handle: '@sanmarg',
    img: 'https://avatars.githubusercontent.com/u/50082154?v=4',
    url: 'https://github.com/sanmarg',
  },
  {
    id: 11,
    name: 'Adrika Dwivedi',
    handle: '@adrikaDwivedi',
    img: 'https://avatars.githubusercontent.com/u/89826992?v=4',
    url: 'https://github.com/adrikaDwivedi',
  },
  {
    id: 12,
    name: 'Arpna',
    handle: '@Arpcoder',
    img: 'https://avatars.githubusercontent.com/u/100352419?v=4',
    url: 'https://github.com/Arpcoder',
  },
  {
    id: 13,
    name: 'Alisha Singh',
    handle: '@alishasingh06',
    img: 'https://avatars.githubusercontent.com/u/114938485?v=4',
    url: 'https://github.com/alishasingh06',
  },
  {
    id: 14,
    name: 'Sibam Paul',
    handle: '@Sibam-Paul',
    img: 'https://avatars.githubusercontent.com/u/158052549?v=4',
    url: 'https://github.com/Sibam-Paul',
  },
  {
    id: 15,
    name: 'Hrushikesh Shinde',
    handle: '@rushiii3',
    img: 'https://avatars.githubusercontent.com/u/105168088?v=4',
    url: 'https://github.com/rushiii3',
  },
  {
    id: 16,
    name: 'Soham Adhyapak',
    handle: '@soham0005',
    img: 'https://avatars.githubusercontent.com/u/83421425?v=4',
    url: 'https://github.com/soham0005',
  },
  {
    id: 17,
    name: 'Kylie',
    handle: '@kylie-kiaying',
    img: 'https://avatars.githubusercontent.com/u/133581245?v=4',
    url: 'https://github.com/kylie-kiaying',
  },
  {
    id: 18,
    name: 'Himanshu Choudhary',
    handle: '@Himanshu8850',
    img: 'https://avatars.githubusercontent.com/u/128601673?v=4',
    url: 'https://github.com/Himanshu8850',
  },
  {
    id: 19,
    name: 'Hemanth Kumar',
    handle: '@Hemu21',
    img: 'https://avatars.githubusercontent.com/u/106808387?v=4',
    url: 'https://github.com/Hemu21',
  },
  {
    id: 20,
    name: 'Nishant Kaushal',
    handle: '@nishant0708',
    img: 'https://avatars.githubusercontent.com/u/101548649?v=4',
    url: 'https://github.com/nishant0708',
  },
  {
    id: 21,
    name: 'Kamalesh Bala',
    handle: '@Kamaleshbala01',
    img: 'https://avatars.githubusercontent.com/u/139665559?v=4',
    url: 'https://github.com/Kamaleshbala01',
  },
  {
    id: 22,
    name: 'Parth Nakum',
    handle: '@ParthNakum21',
    img: 'https://avatars.githubusercontent.com/u/134558990?v=4',
    url: 'https://github.com/ParthNakum21',
  },
  {
    id: 23,
    name: 'Abhigna Arsam',
    handle: '@Abhigna-arsam',
    img: 'https://avatars.githubusercontent.com/u/125258286?v=4',
    url: 'https://github.com/Abhigna-arsam',
  },
  {
    id: 24,
    name: 'Maryam Mohamed Yahya',
    handle: '@MaryamMohamedYahya',
    img: 'https://avatars.githubusercontent.com/u/147263523?v=4',
    url: 'https://github.com/MaryamMohamedYahya',
  },
  {
    id: 25,
    name: 'Vijay Shanker Sharma',
    handle: '@thevijayshankersharma',
    img: 'https://avatars.githubusercontent.com/u/109781385?v=4',
    url: 'https://github.com/thevijayshankersharma',
  },
  {
    id: 26,
    name: 'Tony Stark',
    handle: '@TonyStark-47',
    img: 'https://avatars.githubusercontent.com/u/73957207?v=4',
    url: 'https://github.com/TonyStark-47',
  },
  {
    id: 27,
    name: 'Worrell Seville',
    handle: '@iamworrell',
    img: 'https://avatars.githubusercontent.com/u/99043769?v=4',
    url: 'https://github.com/iamworrell',
  },
  {
    id: 28,
    name: 'Aditi',
    handle: '@Aditijainnn',
    img: 'https://avatars.githubusercontent.com/u/144632601?v=4',
    url: 'https://github.com/Aditijainnn',
  },
  {
    id: 29,
    name: 'Ananya Gupta',
    handle: '@ananyag309',
    img: 'https://avatars.githubusercontent.com/u/145869907?v=4',
    url: 'https://github.com/ananyag309',
  },
  {
    id: 30,
    name: 'Akshat',
    handle: '@akshathere',
    img: 'https://avatars.githubusercontent.com/u/106247875?v=4',
    url: 'https://github.com/akshathere',
  },
  {
    id: 31,
    name: 'Ayushmaan Agarwal',
    handle: '@Ayushmaanagarwal1211',
    img: 'https://avatars.githubusercontent.com/u/118350936?v=4',
    url: 'https://github.com/Ayushmaanagarwal1211',
  },
  {
    id: 32,
    name: 'Damini Chachane',
    handle: '@Damini2004',
    img: 'https://avatars.githubusercontent.com/u/119414762?v=4',
    url: 'https://github.com/Damini2004',
  },
  {
    id: 33,
    name: 'Parth Shah',
    handle: '@Parth20GitHub',
    img: 'https://avatars.githubusercontent.com/u/142086512?v=4',
    url: 'https://github.com/Parth20GitHub',
  },
  {
    id: 34,
    name: 'Sree Vidya',
    handle: '@sreevidya-16',
    img: 'https://avatars.githubusercontent.com/u/115856774?v=4',
    url: 'https://github.com/sreevidya-16',
  },
  {
    id: 35,
    name: 'Asmita Mishra',
    handle: '@AsmitaMishra24',
    img: 'https://avatars.githubusercontent.com/u/146121869?v=4',
    url: 'https://github.com/AsmitaMishra24',
  },
  {
    id: 36,
    name: 'Kanhaiya Kumar',
    handle: '@iamkanhaiyakumar',
    img: 'https://avatars.githubusercontent.com/u/120328606?v=4',
    url: 'https://github.com/iamkanhaiyakumar',
  },
  {
    id: 37,
    name: 'Revanth',
    handle: '@revanth1718',
    img: 'https://avatars.githubusercontent.com/u/109272714?v=4',
    url: 'https://github.com/revanth1718',
  },
  {
    id: 38,
    name: 'Arunima Dutta',
    handle: '@arunimaChintu',
    img: 'https://avatars.githubusercontent.com/u/99474881?v=4',
    url: 'https://github.com/arunimaChintu',
  },
  {
    id: 39,
    name: 'Maana Ajmera',
    handle: '@Maana-Ajmera',
    img: 'https://avatars.githubusercontent.com/u/162733812?v=4',
    url: 'https://github.com/Maana-Ajmera',
  },
  {
    id: 40,
    name: 'Aditya Narayan',
    handle: '@ANKeshri',
    img: 'https://avatars.githubusercontent.com/u/159682348?v=4',
    url: 'https://github.com/ANKeshri',
  },
  {
    id: 41,
    name: 'Utsav Ladia',
    handle: '@Utsavladia',
    img: 'https://avatars.githubusercontent.com/u/124615886?v=4',
    url: 'https://github.com/Utsavladia',
  },
  {
    id: 42,
    name: 'Nayanika Mukherjee',
    handle: '@Nayanika1402',
    img: 'https://avatars.githubusercontent.com/u/132455412?v=4',
    url: 'https://github.com/Nayanika1402',
  },
  {
    id: 43,
    name: 'Maheshwari Love',
    handle: '@Maheshwari-Love',
    img: 'https://avatars.githubusercontent.com/u/142833275?v=4',
    url: 'https://github.com/Maheshwari-Love',
  },
  {
    id: 44,
    name: 'Pujan Sarkar',
    handle: '@Pujan-sarkar',
    img: 'https://avatars.githubusercontent.com/u/144250917?v=4',
    url: 'https://github.com/Pujan-sarkar',
  },
];

const ContributorPage = () => {
  const [search, setSearch] = useState('');

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // 🔍 Filter contributors
  const filteredContributors = useMemo(() => {
    if (!search.trim()) return CONTRIBUTORS;

    const q = search.toLowerCase();
    return CONTRIBUTORS.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.handle.toLowerCase().includes(q),
    );
  }, [search]);

  const renderItem = ({item}: {item: any}) => (
    <Card
      bordered
      padding="$3"
      borderRadius={22}
      backgroundColor="white"
      marginBottom="$4"
      onPress={() => openLink(item.url)}
      pressStyle={{opacity: 0.9}}>
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap="$4" flex={1}>
          <Circle size={64} padding={2} borderWidth={2} borderColor="#1A91FF">
            <Avatar circular size={58}>
              <Avatar.Image src={item.img} />
              <Avatar.Fallback backgroundColor="#1A91FF" />
            </Avatar>
          </Circle>

          <YStack flex={1}>
            <Text fontWeight="800" fontSize={16} numberOfLines={2}>
              {item.name}
            </Text>
            <Text color="#718096" fontSize={13}>
              {item.handle}
            </Text>
          </YStack>
        </XStack>

        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#CBD5E0"
        />
      </XStack>
    </Card>
  );

  return (
    <Theme name="light">
      <SafeAreaView style={{flex: 1, backgroundColor: '#F0F8FF'}}>
        {/* HEADER */}
        <YStack
          padding="$6"
          paddingTop="$10"
          backgroundColor="#1A91FF"
          borderBottomLeftRadius={40}
          borderBottomRightRadius={40}
          gap="$4">
          <XStack justifyContent="center" alignItems="center" gap="$3">
            <H2 color="white" fontWeight="900" fontSize={28}>
              Our Contributors
            </H2>
            <MaterialCommunityIcons
              name="heart-flash"
              size={32}
              color="#FF5252"
            />
          </XStack>

          <Text color="white" textAlign="center" opacity={0.85} fontSize={15}>
            Thank you for contributing to our repository
          </Text>

          <Card
            padding="$4"
            marginTop="$4"
            backgroundColor="rgba(255, 255, 255, 0.15)"
            borderRadius={20}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.2)">
            <XStack alignItems="center" justifyContent="center" gap="$2">
              <Text
                color="white"
                textAlign="center"
                fontWeight="600"
                fontSize={14}>
                We appreciate your help in making UltimateHealth better!
              </Text>
              <FontAwesome5 name="grin-stars" size={18} color="#FFD700" />
            </XStack>
          </Card>

          <XStack
            backgroundColor="white"
            borderRadius={16}
            padding="$1"
            alignItems="center">
            <MaterialCommunityIcons name="magnify" size={22} color="#718096" />
            <Input
              unstyled
              flex={1}
              placeholder="Search contributors"
              value={search}
              onChangeText={setSearch}
              borderWidth={0}
              backgroundColor="transparent"
              color="#1A202C"
              placeholderTextColor="#A0AEC0"
              selectionColor="#1A91FF"
            />
          </XStack>
        </YStack>

        {/* LIST */}
        <FlatList
          data={filteredContributors}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{padding: 20}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <YStack alignItems="center" marginTop="$8">
              <FontAwesome5 name="user-slash" size={42} color="#CBD5E0" />
              <Text marginTop="$3" color="#718096">
                No contributors found
              </Text>
            </YStack>
          }
        />
      </SafeAreaView>
    </Theme>
  );
};

export default ContributorPage;
