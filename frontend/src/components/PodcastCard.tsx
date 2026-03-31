import React, {useRef} from 'react';
import {TouchableOpacity, Alert, StyleSheet, View} from 'react-native';
import {YStack, XStack, Image, Text} from 'tamagui';
import {Entypo, Ionicons} from '@expo/vector-icons';
import {formatCount} from '../helper/Utils';
import {Category} from '../type';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import PodcastActions from './PodcastActions';
import Share from 'react-native-share';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {GlassStyles, ProfessionalColors, BorderRadius} from '../styles/GlassStyles';


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

 // console.log("Image url", imageUri);

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

  console.log("podcast uri", `${GET_STORAGE_DATA}/${imageUri}`);
  const uri =
    imageUri && imageUri !== ''
      ? imageUri.startsWith('https')
        ? imageUri
        : `${GET_STORAGE_DATA}/${imageUri}`
      : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg';

  return (
    <TouchableOpacity onPress={handleClick} activeOpacity={0.9} style={styles.cardWrapper}>
      <View style={[GlassStyles.glassCardElevated, styles.cardContainer]}>
        {/* Cover Image with Gradient Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{uri}}
            style={styles.coverImage}
            borderRadius={BorderRadius.lg}
          />
          {/* Glass Overlay on Image */}
          <View style={styles.imageOverlay}>
            <View style={[styles.playButton, GlassStyles.glassContainer]}>
              <Ionicons name="play" size={24} color={ProfessionalColors.white} />
            </View>
          </View>
        </View>

        {/* Content Section */}
        <YStack padding="$3" gap="$2" flex={1}>
          {/* Title */}
          <Text
            fontSize={17}
            fontWeight="700"
            color={ProfessionalColors.gray900}
            numberOfLines={2}
            ellipsizeMode="tail">
            {title}
          </Text>

          {/* Host Name */}
          <XStack alignItems="center" gap="$2">
            <Ionicons name="person-circle-outline" size={18} color={ProfessionalColors.gray600} />
            <Text fontSize={14} fontWeight="500" color={ProfessionalColors.gray700}>
              {host}
            </Text>
          </XStack>

          {/* Tags */}
          <XStack flexWrap="wrap" gap="$1.5" marginTop="$1">
            {tags?.slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag.name}</Text>
              </View>
            ))}
          </XStack>

          {/* Stats Section */}
          <XStack alignItems="center" justifyContent="space-between" marginTop="$2">
            <XStack alignItems="center" gap="$1">
              <Ionicons name="eye-outline" size={16} color={ProfessionalColors.gray600} />
              <Text fontSize={13} fontWeight="500" color={ProfessionalColors.gray600}>
                {views <= 1 ? `${views} view` : `${formatCount(views)} views`}
              </Text>
            </XStack>

            <XStack alignItems="center" gap="$1">
              <Ionicons name="time-outline" size={16} color={ProfessionalColors.gray600} />
              <Text fontSize={13} fontWeight="500" color={ProfessionalColors.gray600}>
                {duration}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Menu Button (top-right corner) */}
        {display && (
          <TouchableOpacity
            style={[styles.menuButton, GlassStyles.glassContainer]}
            onPress={handleOpenSheet}
            activeOpacity={0.7}>
            <Entypo name="dots-three-vertical" size={18} color={ProfessionalColors.gray800} />
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
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 8,
    width: '100%',
  },
  cardContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 255, 0.9)',
  },
  tag: {
    backgroundColor: ProfessionalColors.primaryGlass,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ProfessionalColors.primary + '30',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: ProfessionalColors.primary,
    textTransform: 'capitalize',
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default PodcastCard;
