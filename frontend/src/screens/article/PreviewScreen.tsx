import React from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {PRIMARY_COLOR} from '../../helper/Theme';
import HTMLView from 'react-native-htmlview';
import {PreviewScreenProp} from '../../type';
import {demo} from '../../helper/Utils';

export default function PreviewScreen({navigation, route}: PreviewScreenProp) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {article} = route.params;
  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.textWhite}>Post</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={{padding: 10}}>
        <HTMLView value={demo} stylesheet={styles} />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  text: {
    fontWeight: 'bold',
    fontSize: 20,
  },

  textWhite: {
    fontWeight: '600',
    fontSize: 17,
    color: 'white',
  },
  button: {
    marginRight: 15,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: PRIMARY_COLOR,
    width: 75,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
});
