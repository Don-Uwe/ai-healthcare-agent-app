// PodcastPlayerScreen.js

import {useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {PodcastDetailScreenProp} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';

const PodcastDetail = ({navigation}: PodcastDetailScreenProp) => {
  const [progress, setProgress] = useState(10);

  const handleListenPress = () => {
    console.log('Listen button pressed');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Podcast Details</Text>

      <Image
        source={{
          uri: 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
        }}
        style={styles.podcastImage}
      />

      <Text style={styles.episodeTitle}>Episode 1: The AI Revolution</Text>
      <Text style={styles.podcastTitle}>The Curious Minds Podcast</Text>

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>June 25, 2025</Text>
        <Text style={styles.metaText}>2.1K Views</Text>
      </View>

      <TouchableOpacity style={styles.listenButton} onPress={handleListenPress}>
        <Text style={styles.listenText}>🎧 Listen Now</Text>
      </TouchableOpacity>

      <View style={styles.footerOptions}>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={27} color="#1E1E1E" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={27} color="#1E1E1E" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={27} color="#1E1E1E" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PodcastDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    padding: 20,
    //justifyContent: 'center',
    marginTop: hp(2),
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
    color: '#444',
  },
  podcastImage: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    borderRadius: 16,
    marginBottom: 24,
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E1E1E',
  },
  podcastTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  time: {
    fontSize: 12,
    color: '#777',
  },
  listenButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 32,
  },
  listenText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});
