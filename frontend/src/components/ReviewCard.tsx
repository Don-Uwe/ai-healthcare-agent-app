import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
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
          {isSelected && (
            <Animated.View style={[menuStyle, styles.shareIconContainer]}>
              <ArticleFloatingMenu
                items={[
                  {
                    name: 'Request to edit',
                    action: () => {
                      handleAnimation();
                    },
                    icon: 'edit',
                  },
                ]}
              />
            </Animated.View>
          )}

          {/* Icon for more options */}
          <TouchableOpacity
            style={styles.shareIconContainer}
            onPress={() => handleAnimation()}>
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
                name="arrowright"
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
    maxHeight: 390,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    marginVertical: 14,
    overflow: 'hidden',
    elevation: 4,

    borderRadius: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 13,
    //alignItems:"center"
  },
  title: {
    fontSize: fp(5.5),
    fontWeight: 'bold',
    color: '#121a26',
    marginBottom: 4,
    fontFamily: 'Lobster-Regular',
    //alignSelf: 'center',
  },
  description: {
    fontSize: fp(3),
    fontWeight: '600',
    lineHeight: 18,
    color: '#778599',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  footerText: {
    fontSize: fp(3.9),
    fontWeight: '700',
    color: BUTTON_COLOR,
    marginBottom: 3,
  },

  footerText1: {
    fontSize: fp(3.5),
    fontWeight: '600',
    color: '#121a26',
    marginBottom: 3,
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
    top: 2,
    right: 1,
    zIndex: 1,
  },
  viewContainer: {
    //flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 2,
  },
  viewInnnerContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    padding: 2,
  },
  viewText: {
    fontSize: fp(4),
    textDecorationLine: 'underline',
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginRight: 2,
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
