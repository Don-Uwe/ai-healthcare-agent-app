import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import {fp, hp} from '../helper/Metric';
import {ReviewCardProps} from '../type';
import moment from 'moment';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {formatCount, StatusEnum} from '../helper/Utils';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ArticleFloatingMenu from './ArticleFloatingMenu';
//import io from 'socket.io-client';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

const ReviewCard = ({
  item,
  //navigation,
  onclick,
  isSelected,
  setSelectedCardId,
}: ReviewCardProps) => {
  //const socket = io('http://51.20.1.81:8084');
  //const socket = useSocket();
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);

  const [menuVisible, setMenuVisible] = useState(false);
  const backgroundColor =
    item?.status === StatusEnum.PUBLISHED
      ? 'green'
      : item?.status === StatusEnum.DISCARDED
      ? 'red'
      : BUTTON_COLOR;

  const menuStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      transform: [{translateY: yValue.value}],
    };
  });
  //console.log('Image Utils', item?.imageUtils[0]);

  const handleAnimation = () => {
    if (width.value === 0) {
      width.value = withTiming(250, {duration: 250});
      yValue.value = withTiming(-1, {duration: 250});
      setSelectedCardId(item._id);
    } else {
      width.value = withTiming(0, {duration: 250});
      yValue.value = withTiming(100, {duration: 250});
      setSelectedCardId('');
    }
  };

  return (
    <Pressable
      onPress={() => {
        width.value = withTiming(0, {duration: 250});
        yValue.value = withTiming(100, {duration: 250});
        setSelectedCardId('');
        /*
        navigation.navigate('ArticleScreen', {
          articleId: Number(item._id),
          authorId: item.authorId,
        });
        */
        onclick(item);
      }}>
      <View style={styles.cardContainer}>
        {/* Image Section */}

        <View style={styles.textContainer}>
          {/* Share Icon */}
       
             <ArticleFloatingMenu
                items={[
                  {
                    articleId: item._id,
                    name: 'Request to edit',
                    action: () => {
                      handleAnimation();
                    },
                    icon: 'edit',
                  },
                ]}
                visible={menuVisible} 
                onDismiss={()=>{
                 setMenuVisible(false);
                } }  
              />
         

          {/* Icon for more options */}
          <TouchableOpacity
            style={styles.shareIconContainer}
            onPress={() => {
              setMenuVisible(true)
            }}>
            <Entypo name="dots-three-vertical" size={20} color={'black'} />
          </TouchableOpacity>

          {/* Title & Footer Text */}
          <Text style={styles.footerText}>
            {item?.tags.map(tag => tag.name).join(' | ')}
          </Text>
          <Text style={styles.title}>{item?.title}</Text>

          <Text style={styles.description}>{item?.description}</Text>

          {item?.status === StatusEnum.PUBLISHED && (
            <Text style={{...styles.footerText1, marginBottom: 3}}>
              {item?.viewUsers
                ? item?.viewUsers.length > 1
                  ? `${formatCount(item?.viewUsers.length)} views`
                  : `${item?.viewUsers.length} view`
                : '0 view'}
            </Text>
          )}
          <Text style={styles.footerText1}>
            Last updated: {''}
            {moment(new Date(item?.lastUpdated)).format('DD/MM/YYYY')}
          </Text>

          <View style={styles.viewContainer}>
            <Text
              style={{
                ...styles.footerText1,
                color: backgroundColor,
                // fontSize: 16,
                fontWeight: '700',
                marginTop: 3,
              }}>
              {item?.status ? item.status.toLocaleUpperCase() : 'Not found'}
            </Text>

            <TouchableOpacity
              style={styles.viewInnnerContainer}
              onPress={() => {
                onclick(item);
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

          {/* Like, Save, and Comment Actions */}
        </View>
      </View>
    </Pressable>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
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
  image: {
    flex: 0.8,
    resizeMode: 'cover',
  },

  likeSaveContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 6,
    justifyContent: 'space-between',
  },

  likeSaveChildContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginHorizontal: hp(0),
    marginVertical: hp(1),
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: fp(5.5),
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: fp(6.5),
    letterSpacing: 0.3,
  },
  description: {
    fontSize: fp(3.4),
    fontWeight: '500',
    lineHeight: 20,
    color: '#666666',
    marginBottom: 12,
  },
  footerText: {
    fontSize: fp(3.5),
    fontWeight: '700',
    color: BUTTON_COLOR,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  footerText1: {
    fontSize: fp(3.3),
    fontWeight: '500',
    color: '#5A5A5A',
    marginBottom: 4,
  },

  footerContainer: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  shareIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 8,
  },
  viewContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 2,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewInnnerContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  viewText: {
    fontSize: fp(3.8),
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginRight: 4,
  },
  // future card styles
  //   card: {
  //     marginBottom: 20,
  //     backgroundColor: 'white',
  //     padding: 15,
  //     borderRadius: 10,
  //   },
  //   image: {
  //     width: '100%',
  //     height: 200,
  //     borderRadius: 10,
  //     resizeMode: 'cover',
  //   },
  //   content: {
  //     padding: 10,
  //   },
  //   title: {
  //     fontSize: 20,
  //     fontWeight: 'bold',
  //     marginBottom: 10,
  //   },
  //   author: {
  //     fontSize: 14,
  //     color: '#999',
  //     marginBottom: 10,
  //   },
  //   description: {
  //     fontSize: 14,
  //   },
  //   categoriesContainer: {
  //     flexDirection: 'row',
  //     marginTop: 10,
  //     gap: 5,
  //   },
  //   category: {
  //     padding: 10,
  //     borderRadius: 50,
  //     backgroundColor: PRIMARY_COLOR,
  //     marginTop: 5,
  //   },
  //   categoryText: {
  //     color: 'white',
  //     fontWeight: '600',
  //   },
});
