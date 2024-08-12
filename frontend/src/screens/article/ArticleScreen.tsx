/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {articles} from '../../helper/Utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArticleScreenProp} from '../../type';

const ArticleScreen = ({route}: {route: ArticleScreenProp['route']}) => {
  const insets = useSafeAreaInsets();
  const {id}: {id: string} = route.params;
  const [sampleData] = useState(articles.find(value => value.id === id));
  const [isLiked, setisLiked] = useState(true);
  const handleLike = () => {
    setisLiked(!isLiked);
  };
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageContainer}>
          <Image source={{uri: sampleData?.imageUtils}} style={styles.image} />
          <TouchableOpacity
            onPress={handleLike}
            style={[
              styles.likeButton,
              {backgroundColor: isLiked ? '#f5f5f5' : PRIMARY_COLOR},
            ]}>
            <FontAwesome
              name="heart"
              size={34}
              color={isLiked ? PRIMARY_COLOR : 'white'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.categoryText}>
            {sampleData?.category.join(' | ').toUpperCase()}
          </Text>
          <Text style={styles.titleText}>{sampleData?.title}</Text>
          <View style={styles.avatarsContainer}>
            <View style={styles.avatar} />
            <View style={[styles.avatar, styles.avatarOverlap]} />
            <View style={[styles.avatar, styles.avatarDoubleOverlap]} />
            <View style={[styles.avatar, styles.avatarTripleOverlap]}>
              <Text style={styles.moreText}>+3</Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {sampleData?.description}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Platform.OS === 'ios' ? insets.bottom : insets.bottom + 20,
          },
        ]}>
        <View style={styles.authorContainer}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            }}
            style={styles.authorImage}
          />
          <View>
            <Text style={styles.authorName}>{sampleData?.author_name}</Text>
            <Text style={styles.authorFollowers}>99 Followers</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ArticleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  scrollViewContent: {
    paddingBottom: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 300,
    width: '100%',
    objectFit: 'cover',
  },
  likeButton: {
    padding: 10,
    position: 'absolute',
    bottom: -25,
    right: 20,
    borderRadius: 50,
  },
  contentContainer: {
    marginTop: 25,
    paddingHorizontal: 16,
  },
  categoryText: {
    fontWeight: '400',
    fontSize: 12,
    color: '#6C6C6D',
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5,
  },
  avatarsContainer: {
    position: 'relative',
    flex: 1,
    height: 70,
    marginTop: 10,
  },
  avatar: {
    height: 70,
    width: 70,
    borderRadius: 100,
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#D9D9D9',
  },
  avatarOverlap: {
    left: 15,
  },
  avatarDoubleOverlap: {
    left: 30,
  },
  avatarTripleOverlap: {
    left: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 20,
    fontWeight: '400',
  },
  descriptionContainer: {
    flex: 1,
    position: 'relative',
    marginTop: 10,
  },
  descriptionText: {
    fontWeight: '400',
    color: '#6C6C6D',
    fontSize: 15,
    textAlign: 'justify',
  },
  footer: {
    backgroundColor: '#EDE9E9',
    position: 'relative',
    bottom: 0,
    zIndex: 10,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorImage: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 15,
  },
  authorFollowers: {
    fontWeight: '400',
    fontSize: 13,
  },
  followButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 10,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
