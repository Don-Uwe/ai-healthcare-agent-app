// NoResults.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const NoResults = ({ query = '' }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/no_results.jpg')} 
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>No results found</Text>
      {query !== '' && (
        <Text style={styles.subtitle}>
          We couldn’t find anything for "{query}"
        </Text>
      )}
      <Text style={styles.tips}>Try different keywords or check your spelling.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
  },
  tips: {
    fontSize: 14,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NoResults;
