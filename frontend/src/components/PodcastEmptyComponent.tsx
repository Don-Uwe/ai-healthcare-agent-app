import {View, Image, Text, StyleSheet} from 'react-native';
import {hp} from '../helper/Metric';

export default function PodcastEmptyComponent() {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../../assets/images/podcast_default.jpg')}
        style={styles.image}
      />
      <Text style={styles.message}>No podcast Found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 160,
    width: 160,
    borderRadius: 80,
    resizeMode: 'cover',
    marginBottom: hp(4),
  },

  message: {
    fontSize: 17,
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: hp(15),
    alignSelf: 'center',
  },
});
