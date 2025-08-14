import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, Alert} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {hp, wp} from '../helper/Metric';
import {formatCount} from '../helper/Utils';
import {Category} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
import Entypo from 'react-native-vector-icons/Entypo';
import {useRef} from 'react';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import PodcastActions from './PodcastActions';
import Share from 'react-native-share';
import { GET_STORAGE_DATA } from '../helper/APIUtils';

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
  playlistAct: (id: string)=> void;
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
  return (
    // Main container for the podcast card
    <View style={styles.container}>
      <View style={styles.imageTextContainer}>
        {/* Display the podcast image */}
        <Image
          source={{
            uri:
              imageUri && imageUri !== ''
                ? imageUri.startsWith('https') ? imageUri : `${GET_STORAGE_DATA}/${imageUri}`
                : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
          }}
          style={styles.image}
        />
        <View>
          {/* Display the podcast title */}
          <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
            {title}
          </Text>
          {/* Display the podcast host */}
          <Text style={styles.host}>{host}</Text>

          <View style={styles.tagsContainer}>
            {tags?.map((tag, index) => (
              <Text key={index} style={styles.tagText}>
                #{tag.name}
              </Text>
            ))}
          </View>
          <View style={styles.likesContainer}>
            {/* Display the number of likes with a heart icon */}
            {/* <Ionicons name="heart" size={20} /> */}
            <Text>
              {views <= 1 ? `${views} view` : `${formatCount(views)} views`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.playContainer}>
        <TouchableOpacity onPress={handleClick}>
          <Feather name="chevrons-right" size={24} color={'black'} />
        </TouchableOpacity>

        <Text style={styles.durationText}>{duration}</Text>
      </View>

      {display && (
        <TouchableOpacity
          style={styles.shareIconContainer}
          onPress={() => handleOpenSheet()}>
          <Entypo name="dots-three-vertical" size={18} color={'black'} />
        </TouchableOpacity>
      )}

      <PodcastActions
        ref={sheetRef}
        downloaded={downloaded}
        onShare={handleShare}
        onReport={handleReport}
        onDownload={downLoadAudio}
        onSave={()=>{

         playlistAct(id);
        }}
      />
    </View>
  );
};

// Styles for the PodcastCard component
const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    padding: 7,
  },
  imageTextContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    height: hp(16),
    width: wp(29),
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
    maxWidth: wp(40),
  },
  host: {
    fontSize: 14,
    fontWeight: 'regular',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  playContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginLeft: 12,
    bottom: hp(2),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    rowGap: 4,
    columnGap: 8,
  },

  tagText: {
    backgroundColor: '#f0f0f0',
    color: PRIMARY_COLOR,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  shareIconContainer: {
    position: 'absolute',
    top: 1,
    right: 1,
    zIndex: 1,
  },
});

export default PodcastCard;
