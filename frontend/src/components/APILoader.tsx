import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';

export default function APILoader() {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size={50} color={PRIMARY_COLOR} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    //backgroundColor: 'rgba(0,0,0,0.4)',
    backgroundColor: ON_PRIMARY_COLOR,
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
