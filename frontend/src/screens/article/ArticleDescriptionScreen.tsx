import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {hp} from '../../helper/Metric';
import {useSelector} from 'react-redux';
import {Category} from '../../type';
import Ionicon from 'react-native-vector-icons/Ionicons';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const ArticleDescriptionScreen = ({navigation}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Category[]>([]);
  const {categories} = useSelector((state: any) => state.article);
  const [imageUtils, setImageUtils] = useState('');

  const handleGenrePress = (genre: Category) => {
    if (isSelected(genre)) {
      setSelectedGenres(selectedGenres.filter(item => item.id !== genre.id));
    } else if (selectedGenres.length < 5) {
      // Check if the length of selected genres is less than 5
      setSelectedGenres([...selectedGenres, genre]); // Add the new genre to the selected genres array
    }
  };

  const isSelected = genre => selectedGenres.includes(genre);

  const handleCreatePost = () => {
    if (title === '') {
      Alert.alert('Title section is required');
      return;
    } else if (description === '') {
      Alert.alert('Please give proper description');
      return;
    } else if (selectedGenres.length === 0) {
      Alert.alert('Please select at least one suitable tags for your article.');
      return;
    }

    // Later purpose
    else if (imageUtils.length === 0) {
      //Alert.alert('Please upload one  image for your article.');
      // return;
    }

    navigation.navigate('EditorScreen', {
      title: title,
      description: description,
      selectedGenres: selectedGenres,
      imageUtils: imageUtils,
    });
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets) {
        const {uri, fileSize} = response.assets[0];

        // Check file size (1 MB limit)
        if (fileSize && fileSize > 1024 * 1024) {
          Alert.alert('Error', 'File size exceeds 1 MB.');
          return;
        }

        // Check dimensions
        ImageResizer.createResizedImage(uri, 2000, 2000, 'JPEG', 100)
          .then(resizedImageUri => {
            // If the image is resized successfully, upload it
          })
          .catch(err => {
            console.log(err);
            Alert.alert('Error', 'Could not resize the image.');
          });

        setImageUtils(uri ? uri : '');
      }
    });
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicon name="chevron-back" size={26} color={'#007bff'} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Start Writing</Text>
        <Text style={styles.headerText}> </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Article Title"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Give a little description or overview"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>
          Caption it (Choose Appropriate Tags for Engaging Articles)
        </Text>
      </View>

      <View style={styles.selectedGenresContainer}>
        {selectedGenres.map((genre, index) => (
          <Text key={index} style={styles.selectedGenreText}>
            #{genre.name}
          </Text>
        ))}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreContainer}>
        {categories.map((genre, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.genreButton,
              isSelected(genre) &&
                styles.selectedGenreButton &&
                styles.selectedGenreButton,
            ]}
            onPress={() => handleGenrePress(genre)}>
            <Text
              style={[
                styles.genreButtonText,
                isSelected(genre) && styles.selectedGenreButtonText,
              ]}>
              #{genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {imageUtils !== '' && (
        <Image
          source={{uri: imageUtils}}
          style={{
            width: 400,
            alignSelf: 'center',
            resizeMode: 'contain',
            height: 300,
            marginTop: 20,
          }}
        />
      )}
      <TouchableOpacity onPress={selectImage} style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Related image</Text>
        <Text style={styles.input}>Upload one image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost}>
        <Text style={styles.submitButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
  },
  uploadButton: {
    padding: 8,
  },
  uploadButtonText: {
    fontSize: 24,
    color: '#000',
  },
  inputContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 20,

    fontWeight: '500',
    color: '#007bff',
    marginHorizontal: hp(1),
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    fontFamily: '600',
    borderWidth: 1,
    borderColor: 'black',
    padding: 8,
    textAlignVertical: 'top',
    borderRadius: 4,
    marginHorizontal: hp(1),
    marginBottom: 10,
  },
  errorContainer: {
    backgroundColor: '#fdd',
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#c00',
  },
  captionContainer: {
    padding: 12,
    marginHorizontal: hp(1),
    marginBottom: 16,
  },
  captionText: {
    color: '#007bff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxCheck: {
    width: 16,
    height: 16,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  checkboxLabel: {
    color: '#666',
  },
  genreContainer: {
    height: 80,

    padding: 16,
    flexDirection: 'row',
  },
  genreButton: {
    backgroundColor: '#f0f0f0',
    flex: 0,
    padding: 8,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  genreButtonText: {
    color: '#666',
  },
  selectedGenreButton: {
    backgroundColor: '#007bff',
  },
  selectedGenreButtonText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedGenresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  selectedGenreItem: {
    backgroundColor: '#007bff',
    padding: 8,
    margin: 4,
    borderRadius: 4,
  },
  selectedGenreText: {
    color: PRIMARY_COLOR,
    marginHorizontal: hp(0.5),
  },

  imagePreviewContainer: {
    marginTop: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
  },
});

export default ArticleDescriptionScreen;
