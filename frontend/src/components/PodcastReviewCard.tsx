import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import {fp, hp, wp} from '../helper/Metric';
import {PodcastData} from '../type';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {StatusEnum, msToTime} from '../helper/Utils';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {formatCount} from '../helper/Utils';

interface PodcastReviewCardProps {
  item: PodcastData;
  onNavigate: (item: PodcastData) => void;
  onMenuPress?: () => void;
}

const PodcastReviewCard = ({
  item,
  onNavigate,
  onMenuPress,
}: PodcastReviewCardProps) => {
  const backgroundColor =
    item?.status === StatusEnum.PUBLISHED
      ? 'green'
      : item?.status === StatusEnum.DISCARDED
      ? 'red'
      : BUTTON_COLOR;

  const uri =
    item?.cover_image && item.cover_image !== ''
      ? item.cover_image.startsWith('https')
        ? item.cover_image
        : `${GET_STORAGE_DATA}/${item.cover_image}`
      : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg';

  // Get host/author name
  const hostName = item?.user_id?.user_name || item?.user_id?.user_handle || 'Unknown Host';

  // Format duration using the msToTime utility (duration is in seconds)
  const formattedDuration = msToTime(item?.duration || 0);

  return (
    <Pressable
      onPress={() => {
        onNavigate(item);
      }}>
      <View style={styles.cardContainer}>
        {/* Cover Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{uri}} style={styles.image} />
          {/* Play Button Overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="white" />
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          {/* Menu Icon */}
          {onMenuPress && (
            <TouchableOpacity
              style={styles.menuIconContainer}
              onPress={onMenuPress}>
              <Entypo
                name="dots-three-vertical"
                size={20}
                color={PRIMARY_COLOR}
              />
            </TouchableOpacity>
          )}

          {/* Tags */}
          {item && item.tags && item.tags.length > 0 && (
            <Text style={styles.footerText}>
              {item.tags.map(tag => tag.name).join(' | ')}
            </Text>
          )}

          {/* Title */}
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {item?.title}
          </Text>

          {/* Host/Author */}
          <View style={styles.hostContainer}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={PRIMARY_COLOR}
            />
            <Text style={styles.hostText}>
              {hostName}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color="#666666" />
              <Text style={styles.statText}>
                {item?.viewUsers?.length <= 1
                  ? `${item?.viewUsers?.length || 0} view`
                  : `${formatCount(item?.viewUsers?.length || 0)} views`}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666666" />
              <Text style={styles.statText}>
                {formattedDuration}
              </Text>
            </View>
          </View>

          {/* Footer with Status and View Button */}
          <View style={styles.viewContainer}>
            <Text
              style={{
                ...styles.statusText,
                color: backgroundColor,
              }}>
              {item?.status ? item.status.toLocaleUpperCase() : 'PENDING'}
            </Text>

            <TouchableOpacity
              style={styles.viewInnerContainer}
              onPress={() => {
                onNavigate(item);
              }}>
              <Text style={styles.viewText}>View</Text>
              <AntDesign
                name="arrow-right"
                size={16}
                color={PRIMARY_COLOR}
                style={{marginTop: 2}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default PodcastReviewCard;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    marginVertical: hp(1.5),
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: fp(5),
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: fp(6),
    letterSpacing: 0.3,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  hostText: {
    fontSize: fp(3.8),
    fontWeight: '600',
    color: '#4A4A4A',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: fp(3.3),
    fontWeight: '500',
    color: '#666666',
  },
  footerText: {
    fontSize: fp(3.5),
    fontWeight: '700',
    color: BUTTON_COLOR,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: fp(3.5),
    fontWeight: '700',
    marginTop: 3,
  },
  viewContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 2,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  viewInnerContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  viewText: {
    fontSize: fp(3.8),
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginRight: 4,
  },
});
