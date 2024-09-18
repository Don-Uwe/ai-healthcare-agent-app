import {StyleSheet, Text, View, Image, Pressable} from 'react-native';
import React from 'react';
import {fp} from '../helper/Metric';
import {ArticleCardProps} from '../type';
import moment from 'moment';

const ArticleCard = ({item, navigation}: ArticleCardProps) => {
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    const day = date.padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Pressable
      onPress={() => {
        // handle onPress
        navigation.navigate('ArticleScreen', {
          id: item._id,
        });
      }}>
      <View style={styles.cardContainer}>
        {/* image */}
        {item?.imageUtils[0] && item?.imageUtils[0].length == 0 ? (
          <Image source={{uri: item?.imageUtils[0]}} style={styles.image} />
        ) : (
          <Image
            source={require('../assets/article_default.jpg')}
            style={styles.image}
          />
        )}

        <View style={styles.textContainer}>
          {/* title */}
          <Text style={styles.footerText}>{item?.tags.join(' | ')}</Text>
          <Text style={styles.title}>{item?.title}</Text>
          {/* description */}
          {/**  <Text style={styles.description}>{item?.description}</Text> */}
          {/* displaying the categories, author name, and last updated date */}

          <Text style={styles.footerText}>
            {item?.authorName} {''}
          </Text>
          <Text style={styles.footerText}>
            Last updated: {''}
            {moment(new Date(item?.last_updated)).format('DD/MM/YYYY')}
          </Text>
        </View>
      </View>
    </Pressable>
    // future card
    // <TouchableOpacity style={styles.card}>
    //   <Image source={{uri: item?.imageUtils}} style={styles.image} />
    //   <View style={styles.content}>
    //     <Text style={styles.title}>{item?.title}</Text>
    //     <Text style={styles.author}>
    //       by {item?.author_name} | {item?.date_updated}
    //     </Text>
    //     <Text style={styles.description}>{item?.description}</Text>
    //     <View style={styles.categoriesContainer}>
    //       {item?.category.map((value, key) => (
    //         <View key={key} style={styles.category}>
    //           <Text style={styles.categoryText}>{value}</Text>
    //         </View>
    //       ))}
    //     </View>
    //   </View>
    // </TouchableOpacity>
  );
};

export default ArticleCard;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 0,
    width: '100%',
    maxHeight: 200,
    backgroundColor: '#E6E6E6',
    flexDirection: 'row',
    marginVertical: 14,
    overflow: 'hidden',
    elevation: 4,

    borderRadius: 12,
  },
  image: {
    flex: 0.6,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 0.9,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 13,
  },
  title: {
    fontSize: fp(4.5),
    fontWeight: 'bold',
    color: '#121a26',
    marginBottom: 4,
    fontFamily: 'Lobster-Regular',
  },
  description: {
    fontSize: fp(3),
    fontWeight: '500',
    lineHeight: 18,
    color: '#778599',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  footerText: {
    fontSize: fp(3.3),
    fontWeight: '600',
    color: '#121a26',
    marginBottom: 4,
  },

  footerContainer: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
