import React, {useRef} from 'react';
import {TouchableOpacity, Alert} from 'react-native';
import {YStack, XStack, Image, Text, styled} from 'tamagui';
import {Entypo} from '@expo/vector-icons';
import {formatCount} from '../helper/Utils';
import {Category} from '../type';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import PodcastActions from './PodcastActions';
import Share from 'react-native-share';
import {GET_STORAGE_DATA} from '../helper/APIUtils';


interface PodcastProps {
  id: string;
  downloaded: boolean;
  display: boolean;
  title: string;
  host: string;
  audioUrl: string;
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
  audioUrl,
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

      const url = `https://uhsocial.in/api/share/podcast?trackId=${id}&audioUrl=${audioUrl}`;

      const result = await Share.open({
        title: title,
        message: `${title} : Check out this awesome podcast on UltimateHealth app!`,
        // Most Recent APK: 0.7.4
        url: url,
        subject: 'Podcast Sharing',
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
    
    <CardContainer onPress={handleClick}>
      <XStack gap="$3" alignItems="center" justifyContent="space-between">
        {/* Left section: Image + Text */}
        <XStack flex={1} gap="$3"  height="100%" alignItems="flex-start">
          <Image source={{uri}} width={100} height="100%" borderRadius={20} 
           
          />

          <YStack flex={1} gap="$1" overflow="hidden">
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

            <XStack flexWrap="wrap" gap="$1" marginTop="$1">
              {tags?.map((tag, i) => (
                <TagText key={i}>#{tag.name}</TagText>
              ))}
            </XStack>

            <XStack alignItems="center" marginTop="$1" gap="$1">
              <Text color="$gray10">
                {views <= 1 ? `${views} view` : `${formatCount(views)} views`}
              </Text>
              <Text fontSize={14} color="$gray10" marginTop="$1">
                {duration}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        {/* Right section: Play button + duration */}
        
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
  
  );
};

export default PodcastCard;
