import React, {useRef} from 'react';
import {TouchableOpacity, Alert} from 'react-native';
import {YStack, XStack, Image, Text, styled} from 'tamagui';
import {Feather, Entypo} from '@expo/vector-icons';
import {formatCount} from '../helper/Utils';
import {Category} from '../type';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import PodcastActions from './PodcastActions';
import Share from 'react-native-share';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PodcastProps {
  id: string;
  downloaded: boolean;
  display: boolean;
  title: string;
  host: string;
  imageUri: string;
  views: number;
  tags: Category[];
  duration: string;
  handleClick: () => void;
  downLoadAudio: () => void;
  handleReport: () => void;
  playlistAct: (id: string) => void;
}

const PodcastCard = ({
  id,
  title,
  host,
  imageUri,
  views,
  duration,
  tags,
  handleClick,
  downLoadAudio,
  handleReport,
  downloaded,
  display,
  playlistAct,
}: PodcastProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleOpenSheet = () => {
    // onSelect(id);
    sheetRef.current?.present();
  };

  const handleShare = async () => {
    try {
      const result = await Share.open({
        title: title,
        message: `${title} : Check out this podcast on UltimateHealth app!`,
        // Most Recent APK: 0.7.4
        url: 'https://drive.google.com/file/d/19pRw_TWU4R3wcXjffOPBy1JGBDGnlaEh/view?usp=sharing',
        subject: 'UltimateHealth Post',
      });
      console.log(result);
    } catch (error) {
      console.log('Error sharing:', error);
      Alert.alert('Error', 'Something went wrong while sharing.');
    }
  };

  const uri =
    imageUri && imageUri !== ''
      ? imageUri.startsWith('https')
        ? imageUri
        : `${GET_STORAGE_DATA}/${imageUri}`
      : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg';

  const CardContainer = styled(YStack, {
    width: '100%',
    borderRadius: 20,
    backgroundColor: 'white',
    padding: '$2',
    marginVertical: '$3',
    shadowColor: '#00000022',
    elevation: 2,
    overflow: 'hidden', 
  });

  const TagText = styled(Text, {
    backgroundColor: '#f0f0f0',
    color: '$blue10',
    fontSize: 12,
    paddingHorizontal: '$2',
    paddingVertical: '$1',
    borderRadius: 12,
  });

  return (
    <SafeAreaView>
    <CardContainer>
      <XStack space="$3" ai="center" jc="space-between">
        {/* Left section: Image + Text */}
        <XStack flex={1} space="$3" ai="flex-start">
          <Image source={{uri}} width={90} height={90} borderRadius={20} />

          <YStack f={1} space="$1" overflow="hidden">
            <Text
              fontSize={16}
              fontWeight="700"
              numberOfLines={3}
              ellipsizeMode="tail">
              {title}
            </Text>

            <Text fontSize={14} color="$gray11">
              {host}
            </Text>

            <XStack flexWrap="wrap" space="$1" mt="$1">
              {tags?.map((tag, i) => (
                <TagText key={i}>#{tag.name}</TagText>
              ))}
            </XStack>

            <XStack ai="center" mt="$1" space="$1">
              <Text color="$gray10">
                {views <= 1 ? `${views} view` : `${formatCount(views)} views`}
              </Text>
              <Text fontSize={14} color="$gray10" mt="$1">
                {duration}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        {/* Right section: Play button + duration */}
        <YStack ai="center" jc="center" minWidth={50}>
          <TouchableOpacity onPress={handleClick}>
            <Feather name="chevrons-right" size={24} color="black" />
          </TouchableOpacity>
        </YStack>
      </XStack>

      {/* Dots icon (top-right corner) */}
      {display && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            padding: 4,
            backgroundColor: 'transparent',
          }}
          onPress={handleOpenSheet}>
          <Entypo name="dots-three-vertical" size={18} color="black" />
        </TouchableOpacity>
      )}

      <PodcastActions
        ref={sheetRef}
        downloaded={downloaded}
        onShare={handleShare}
        onReport={handleReport}
        onDownload={downLoadAudio}
        onSave={() => playlistAct(id)}
      />
    </CardContainer>
    </SafeAreaView>
  );
};

export default PodcastCard;
