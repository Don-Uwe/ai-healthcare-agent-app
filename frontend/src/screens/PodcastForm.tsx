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
import {useSelector} from 'react-redux';
import {PodcastFormProp, Category} from '../type';
import Ionicon from '@expo/vector-icons/Ionicons';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {hp} from '../helper/Metric';
import {SafeAreaView} from 'react-native-safe-area-context';

const PodcastForm = ({navigation, route}: PodcastFormProp) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Category[]>([]);
  const {categories} = useSelector((state: any) => state.data);
  const [imageUtils, setImageUtils] = useState('');
  // console.log(categories);

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
      Alert.alert('Please select at least one suitable tags for your podcast.');
      return;
    }

    // Later purpose
    else if (imageUtils.length === 0) {
      Alert.alert('Please upload one cover image for your podcast.');
      return;
    }

    navigation.navigate('PodcastRecorder', {
      title: title,
      description: description,
      selectedGenres: selectedGenres,
      imageUtils: imageUtils,
    });
  };

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        //console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        const {uri, fileSize} = response.assets[0];

        // Check file size (1 MB limit)
        if (fileSize && fileSize > 1024 * 1024) {
          Alert.alert('Error', 'File size exceeds 1 MB.');
          return;
        }

        // Check dimensions
        ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', 100)
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

  const WarningBox = () => {
    return (
      <View style={styles.warningContainer}>
        <Ionicon
          name="alert-circle"
          size={24}
          color="#D9534F"
          style={{marginRight: 8}}
        />
        <View style={{flex: 1}}>
          <Text style={styles.warningTitle}>
            Important Submission Guidelines
          </Text>
          <Text style={styles.warningText}>
            Please ensure your podcast title, description, and tags are clear,
            relevant, and respectful. Avoid offensive, misleading, or unrelated
            content. Podcasts violating our community guidelines may be rejected
            by our review team.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <SafeAreaView>
        <WarningBox />

        <View style={styles.form}>
          {/* Image Upload */}
          <View style={styles.input}>
            {imageUtils ? (
              <View style={styles.imageContainer}>
                <Image source={{uri: imageUtils}} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={selectImage}>
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => setImageUtils('')}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={selectImage}>
                <Ionicon name="cloud-upload" size={36} color={PRIMARY_COLOR} />
                <Text style={styles.uploadText}>Upload Image</Text>
                <Text style={styles.uploadHint}>
                  Image should be of min 1MB
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              autoCapitalize="sentences"
              autoCorrect={false}
              keyboardType="default"
              placeholder="Podcast Title"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Description</Text>

            <TextInput
              placeholder="Give a little description or overview"
              placeholderTextColor="#6b7280"
              textAlignVertical="top"
              style={styles.aboutInput}
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
              value={description}
              onChangeText={text => {
                if (text.length <= 60) {
                  setDescription(text);
                }
              }}
            />

            {/* Character Counter */}
            <Text style={styles.charCounter}>{description.length}/60</Text>
          </View>

          {/* Category */}
          <View style={styles.input}>
            <Text style={styles.inputLabel}>
              Choose Tags for Your Podcast (Up to 5)
            </Text>
            {selectedGenres.map((genre, index) => (
              <Text key={index} style={styles.selectedGenreText}>
                #{genre.name}
              </Text>
            ))}

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
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreatePost}>
            <Text style={styles.submitButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  form: {
    marginTop: hp(3),

    paddingHorizontal: 16,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
  },
  aboutInput: {
    height: 150,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
  },
  imageContainer: {
    width: 300,
    alignSelf: 'center',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    alignSelf: 'center',
    resizeMode: 'contain',
    height: '100%',
    aspectRatio: 3 / 2,
  },
  imageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  changeButton: {
    backgroundColor: 'white',
    width: '40%',
    padding: 3,
    borderRadius: 50,
  },
  changeButtonText: {
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    width: '40%',
    padding: 3,
    borderRadius: 50,
  },
  deleteButtonText: {
    textAlign: 'center',
    color: 'white',
  },
  uploadContainer: {
    backgroundColor: 'rgba(0, 191, 255,0.1)',
    height: 150,
    width: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },

  uploadImageContainer: {
    flexDirection: 'row',
    width: '96%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    marginStart: 7,
    //marginBottom: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: PRIMARY_COLOR,
  },
  charCounter: {
    marginTop: 4,
    marginStart: 6,
    alignSelf: 'flex-start',
    color: 'black',
    fontSize: 15,
  },

  uploadText: {
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
  },
  uploadHint: {
    color: 'black',
    fontSize: 12,
    fontStyle: 'italic',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'white',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  selectedStyle: {
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    marginBottom: hp(8),
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
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

  warningContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
    padding: 12,
    marginTop: hp(0.5),
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D9534F',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 20,
  },
});

export default PodcastForm;
