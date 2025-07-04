import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {wp} from '../helper/Metric';
import { formatCount } from '../helper/Utils';

interface PodcastProps {
  title: string;
  host: string;
  imageUri: string;
  views: number;
  duration: string;
  handleClick: ()=> void;
}



const PodcastCard = ({
  title,
  host,
  imageUri,
  views,
  duration,
  handleClick,
}: PodcastProps) => {

  return (
    // Main container for the podcast card
    <View style={styles.container}>
      <View style={styles.imageTextContainer}>
        {/* Display the podcast image */}
        <Image
          source={{
            uri: imageUri
              ? imageUri
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
          <View style={styles.likesContainer}>
            {/* Display the number of likes with a heart icon */}
            {/* <Ionicons name="heart" size={20} /> */}
            <Text>{views <= 1 ? `${views} view` : `${formatCount(views)} views`}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playContainer}>
        <TouchableOpacity onPress={handleClick}>
          <Feather name="chevrons-right" size={24} color={'black'} />
        </TouchableOpacity>

        <Text>{duration}</Text>
      </View>
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
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    height: 90,
    width: 90,
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
    marginTop: 5,
  },
  playContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});

export default PodcastCard;
