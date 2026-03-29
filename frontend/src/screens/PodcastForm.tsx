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
  Modal,
  FlatList,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {PodcastFormProp, Category} from '../type';
import Ionicon from '@expo/vector-icons/Ionicons';
import {PRIMARY_COLOR} from '../helper/Theme';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {hp} from '../helper/Metric';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

const LANGUAGES = [
  {label: 'English', value: 'en'},
  {label: 'Spanish', value: 'es'},
  {label: 'French', value: 'fr'},
  {label: 'German', value: 'de'},
  {label: 'Italian', value: 'it'},
  {label: 'Portuguese', value: 'pt'},
  {label: 'Chinese', value: 'zh'},
  {label: 'Japanese', value: 'ja'},
  {label: 'Korean', value: 'ko'},
  {label: 'Hindi', value: 'hi'},
  {label: 'Arabic', value: 'ar'},
  {label: 'Russian', value: 'ru'},
];

const PodcastForm = ({navigation, route}: PodcastFormProp) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Category[]>([]);
  const [language, setLanguage] = useState('en');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const {categories} = useSelector((state: any) => state.data);
  const [imageUtils, setImageUtils] = useState('');
  const dispatch = useDispatch();

  const handleGenrePress = (genre: Category) => {
    if (isSelected(genre)) {
      setSelectedGenres(selectedGenres.filter(item => item.id !== genre.id));
    } else if (selectedGenres.length < 5) {
     
      setSelectedGenres([...selectedGenres, genre]); 
    }
  };

  const isSelected = (genre: Category) => selectedGenres.includes(genre);

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
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        const {uri, fileSize} = response.assets[0];

        if (fileSize && fileSize > 1024 * 1024) {
          Alert.alert('Error', 'File size exceeds 1 MB.');
          return;
        }

        // Check dimensions
        ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', 100)
          .then(resizedImageUri => {
          })
          .catch(err => {
            console.log(err);
             Alert.alert('Error', 'Could not resize the image.');
          });

        setImageUtils(uri ? uri : '');
      }
    });
  };

  const getLanguageLabel = (value: string) => {
    return LANGUAGES.find(lang => lang.value === value)?.label || 'English';
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

  const LanguageSelector = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Ionicon name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.value}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    language === item.value && styles.selectedLanguageItem,
                  ]}
                  onPress={() => {
                    setLanguage(item.value);
                    setLanguageModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.languageItemText,
                      language === item.value && styles.selectedLanguageItemText,
                    ]}>
                    {item.label}
                  </Text>
                  {language === item.value && (
                    <Ionicon name="checkmark" size={20} color={PRIMARY_COLOR} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{width: '100%', flex: 1}}
        bottomOffset={50}
        showsVerticalScrollIndicator={false}
        extraKeyboardSpace={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: hp(4),
        }}>
        <WarningBox />
        <LanguageSelector />

        <View style={styles.form}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.sectionTitle}>Podcast Details</Text>
            <Text style={styles.sectionSubtitle}>
              Fill in the information below to create your podcast
            </Text>
          </View>

          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>
              <Ionicon name="image-outline" size={18} color="#222" /> Cover Image
            </Text>
            {imageUtils ? (
              <View style={styles.imageContainer}>
                <Image source={{uri: imageUtils}} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={selectImage}>
                    <Ionicon name="pencil" size={16} color="#222" />
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => setImageUtils('')}>
                    <Ionicon name="trash" size={16} color="#fff" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={selectImage}>
                <Ionicon name="cloud-upload" size={40} color={PRIMARY_COLOR} />
                <Text style={styles.uploadText}>Upload Cover Image</Text>
                <Text style={styles.uploadHint}>
                  Maximum file size: 1MB • JPG, PNG
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            {/* Title */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>
                <Ionicon name="mic-outline" size={18} color="#222" /> Title *
              </Text>
              <TextInput
                autoCapitalize="sentences"
                autoCorrect={false}
                keyboardType="default"
                placeholder="Enter your podcast title"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Language Dropdown */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>
                <Ionicon name="globe-outline" size={18} color="#222" /> Language *
              </Text>
              <TouchableOpacity
                style={styles.languageSelector}
                onPress={() => setLanguageModalVisible(true)}>
                <Text style={styles.languageSelectorText}>
                  {getLanguageLabel(language)}
                </Text>
                <Ionicon name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.input}>
              <Text style={styles.inputLabel}>
                <Ionicon name="document-text-outline" size={18} color="#222" /> Description *
              </Text>
              <TextInput
                placeholder="Provide a brief overview of your podcast"
                placeholderTextColor="#6b7280"
                textAlignVertical="top"
                style={styles.aboutInput}
                multiline
                numberOfLines={4}
                autoCapitalize="sentences"
                value={description}
                onChangeText={text => {
                  if (text.length <= 160) {
                    setDescription(text);
                  }
                }}
              />
              <Text style={styles.charCounter}>{description.length}/160</Text>
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicon name="pricetag-outline" size={18} color="#222" /> Tags
            </Text>
            <Text style={styles.sectionSubtitle}>
              Select up to 5 tags to help people discover your podcast
            </Text>

            {selectedGenres.length > 0 && (
              <View style={styles.selectedGenresWrapper}>
                {selectedGenres.map((genre, index) => (
                  <View key={index} style={styles.selectedGenreChip}>
                    <Text style={styles.selectedGenreChipText}>#{genre.name}</Text>
                    <TouchableOpacity onPress={() => handleGenrePress(genre)}>
                      <Ionicon name="close-circle" size={18} color={PRIMARY_COLOR} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genreContainer}>
              {categories.map((genre: Category, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.genreButton,
                    isSelected(genre) && styles.selectedGenreButton,
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

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreatePost}>
            <Text style={styles.submitButtonText}>Continue to Recording</Text>
            <Ionicon name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  form: {
    marginTop: hp(2),
    paddingHorizontal: 16,
    paddingBottom: hp(4),
  },
  headerSection: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: '#E5E7EB',
  },
  aboutInput: {
    height: 120,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  changeButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    height: 160,
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 8,
  },
  uploadText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 8,
  },
  uploadHint: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 4,
  },
  charCounter: {
    marginTop: 6,
    alignSelf: 'flex-end',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  languageSelector: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageSelectorText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: hp(4),
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  genreContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
  },
  genreButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  genreButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedGenreButton: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  selectedGenreButtonText: {
    color: '#fff',
  },
  selectedGenresWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginTop: 8,
  },
  selectedGenreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  selectedGenreChipText: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedGenreText: {
    color: PRIMARY_COLOR,
    marginHorizontal: hp(0.5),
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FB923C',
    padding: 16,
    marginTop: hp(1),
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  languageItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedLanguageItemText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
});

export default PodcastForm;
