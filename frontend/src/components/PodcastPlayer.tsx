import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Slider from '@react-native-community/slider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import {PRIMARY_COLOR} from '../helper/Theme';

// PodcastPlayer component displays the currently playing podcast details and controls
const PodcastPlayer = ({}) => {
  // State to track if the podcast is liked
  const [isLiked, setisLiked] = useState(false);
  // State to track if the podcast is playing
  const [isPlaying, setisPlaying] = useState(false);

  // Toggle the like status
  const handleLike = () => {
    setisLiked(!isLiked);
  };

  // Toggle the play/pause status
  const handlePlay = () => {
    setisPlaying(!isPlaying);
  };

  // Placeholder functions for handling forward, backward, download, and share actions
  const handleForward = () => {};
  const handleBackward = () => {};
  const handleDownload = () => {};
  const handleShare = () => {};

  return (
    <>
      {/* Display the podcast title */}
      <Text style={styles.podcast}>Feel Better. Live More</Text>
      <Text style={styles.podcastname}>
        8 Hidden Habits To Live Your Healthiest, Happiest and Most Fulfilled
        Life with Robin Sharma
      </Text>

      {/* Section displaying who posted the podcast */}
      <View style={styles.postedByContainer}>
        <View style={styles.postedByContent}>
          <Image
            source={{
              uri: 'https://www.telegraph.co.uk/content/dam/health-fitness/2023/01/06/TELEMMGLPICT000181626250_trans_NvBQzQNjv4BqqB8Yzl3cNKHqhd5OnaUTT5j2A7wJtvm8wQOgknmsfZY.jpeg',
            }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.postedByText}>Posted by</Text>
            <Text style={styles.postedByName}>Dr Rangan Chatterjee</Text>
          </View>
        </View>
      </View>

      {/* Display podcast description */}
      <Text style={styles.description}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vulputate
        augue erat, congue lacinia turpis pellentesque aliquam. Quisque eu
        tellus varius, eleifend dui sed, luctus nibh. Duis et dolor eu ligula
        ultrices dictum. Class aptent taciti sociosqu ad litora torquent per
        conubia nostra, per inceptos himenaeos.
      </Text>

      {/* Action buttons for liking, downloading, and sharing */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsContent}>
          <View style={styles.likeContainer}>
            <TouchableOpacity onPress={handleLike}>
              {isLiked ? (
                <Ionicons name="heart-sharp" color={'white'} size={30} />
              ) : (
                <Ionicons name="heart-outline" color={'white'} size={30} />
              )}
            </TouchableOpacity>
            <Text style={styles.likeText}>30</Text>
          </View>
          <TouchableOpacity onPress={handleDownload}>
            <Entypo name="download" color={'white'} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <EvilIcons name="sc-telegram" color={'white'} size={30} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Slider for podcast progress */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />

      {/* Display current and remaining time */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>14:15</Text>
        <Text style={styles.timeText}>-5:00</Text>
      </View>

      {/* Controls for playback */}
      <View style={styles.controlContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleBackward}>
          <Feather size={30} color={'white'} name="skip-back" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          {isPlaying ? (
            <FontAwesome6 size={15} color={PRIMARY_COLOR} name="pause" />
          ) : (
            <FontAwesome6 size={15} color={PRIMARY_COLOR} name="play" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleForward}>
          <Feather size={30} color={'white'} name="skip-forward" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default PodcastPlayer;

// Styles for PodcastPlayer component
const styles = StyleSheet.create({
  podcast: {
    fontSize: 15,
    fontWeight: 'normal',
    color: 'white',
    marginTop: 10,
  },
  podcastname: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  postedByContainer: {
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  postedByContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 100,
  },
  postedByText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '300',
  },
  postedByName: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  description: {
    color: 'white',
    fontSize: 13,
    textAlign: 'justify',
    marginBottom: 15,
  },
  actionsContainer: {
    alignItems: 'flex-end',
    marginBottom: 0,
  },
  actionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  likeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  slider: {
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: -5,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
  },
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    marginHorizontal: 20,
  },
  playButton: {
    backgroundColor: 'white',
    height: 40,
    width: 40,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
