import {Text, StyleSheet} from 'react-native';
import {hp} from '../helper/Metric';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PodcastEmptyComponent() {
  return (
    <SafeAreaView style={styles.emptyContainer}>
     <MaterialCommunityIcons
      name='book-search'
      size={100}
      color={'#0EA5E9'}
      />
      <Text style={styles.message}>No podcast Found</Text>
    </SafeAreaView>
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
