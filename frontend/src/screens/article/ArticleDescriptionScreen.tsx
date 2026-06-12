import React, {useEffect, useState} from 'react';
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
import {useSelector} from 'react-redux';
import {ArticleDescriptionProp, Category} from '../../type';
import Ionicon from '@expo/vector-icons/Ionicons';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {hp} from '../../helper/Metric';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ttsLanguageList } from '@/src/helper/Utils';

const ARTICLE_TITLE_MAX_LENGTH = 150;
const ARTICLE_DESCRIPTION_MAX_LENGTH = 500;
const COUNTER_WARNING_THRESHOLD = 0.9;

const ArticleDescriptionScreen = ({
  navigation,
  route,
}: ArticleDescriptionProp) => {
  const {article, htmlContent, translationSource} = route.params || {};
  const isTranslation = Boolean(translationSource);
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Category[]>([]);
  const [language, setLanguage] = useState('en-IN');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const {categories} = useSelector((state: any) => state.data);
  const [imageUtils, setImageUtils] = useState('');

  /** Set Initial Value */
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setAuthorName(article.authorName);
      setDescription(article.description);
      setSelectedGenres(article.tags);
      if (isTranslation) {
        setLanguage('');
      }
      setImageUtils(
        article.imageUtils && article.imageUtils.length > 0
          ? article.imageUtils[0]
          : '',
      );
    }
  }, [article, isTranslation]);
  const handleGenrePress = (genre: Category) => {
    if (isSelected(genre)) {
      setSelectedGenres(selectedGenres.filter(item => item.id !== genre.id));
    } else if (selectedGenres.length < 5) {
      // Check if the length of selected genres is less than 5
      setSelectedGenres([...selectedGenres, genre]); // Add the new genre to the selected genres array
    }
  };

  const isSelected = (genre: Category) => selectedGenres.includes(genre);

  const handleCreatePost = () => {
    if (title === '') {
      Alert.alert('Title section is required');
      return;
    } else if (authorName === '') {
      Alert.alert('Author name is required');
      return;
    } else if (description === '') {
      Alert.alert('Please give proper description');
      return;
    } else if (selectedGenres.length === 0) {
      Alert.alert('Please select at least one suitable tags for your article.');
      return;
    } else if (isTranslation && !language) {
      Alert.alert('Please select a target language for the translation.');
      return;
    } else if (
      isTranslation &&
      language === translationSource?.sourceLanguage
    ) {
      Alert.alert('Please choose a language different from the source article.');
      return;
    }

    // Later purpose
    else if (imageUtils.length === 0) {
      Alert.alert('Please upload one  image for your article.');
      return;
    }

    navigation.navigate('EditorScreen', {
      title: title,
      authorName: authorName,
      description: description,
      selectedGenres: selectedGenres,
      imageUtils: imageUtils,
      htmlContent: htmlContent,
      language: language,
      requestId: undefined,
      pb_record_id: undefined,
      articleData: isTranslation ? undefined : article,
      translationSource,
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
        if (__DEV__) console.log('ImagePicker Error:', response.errorMessage);
      } else if (response.assets) {
        const {uri, fileSize} = response.assets[0];

        // Check file size (1 MB limit)
        if (fileSize && fileSize > 1024 * 1024) {
          Alert.alert('Error', 'File size exceeds 1 MB.');
          return;
        }

        if (uri) {
          ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', 80)
            .then(resizedImage => {
              setImageUtils(resizedImage.uri);
            })
            .catch(err => {
              if (__DEV__) console.log('Image resize failed, using original:', err);
              setImageUtils(uri);
            });
        }
      }
    });
  };

  const availableLanguages = isTranslation
    ? ttsLanguageList.filter(
        lang => lang.code !== translationSource?.sourceLanguage,
      )
    : ttsLanguageList;

  const isNearLimit = (value: string, limit: number) =>
    value.length >= limit * COUNTER_WARNING_THRESHOLD;

  const handleTitleChange = (text: string) => {
    setTitle(text.slice(0, ARTICLE_TITLE_MAX_LENGTH));
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text.slice(0, ARTICLE_DESCRIPTION_MAX_LENGTH));
  };

  const getLanguageLabel = (value: string) => {
    return ttsLanguageList.find(lang => lang.code === value)?.name || 'Select language';
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
              data={availableLanguages}
              keyExtractor={item => item.code}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    language === item.code && styles.selectedLanguageItem,
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLanguageModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.languageItemText,
                      language === item.code && styles.selectedLanguageItemText,
                    ]}>
                    {item.name}
                  </Text>
                  {language === item.code && (
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
          paddingBottom: hp(18),
          paddingHorizontal: 6,
        }}>
      <View style={styles.form}>
        <LanguageSelector />

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Article Details</Text>
          <Text style={styles.sectionSubtitle}>
            {isTranslation
              ? `Create a translated version of "${translationSource?.sourceTitle}"`
              : 'Fill in the information below to create your article'}
          </Text>
        </View>

        {isTranslation && (
          <View style={styles.translationNotice}>
            <Ionicon name="language-outline" size={20} color={PRIMARY_COLOR} />
            <View style={styles.translationNoticeTextWrapper}>
              <Text style={styles.translationNoticeTitle}>Translation article</Text>
              <Text style={styles.translationNoticeText}>
                Source language: {getLanguageLabel(translationSource?.sourceLanguage ?? '')}
              </Text>
            </View>
          </View>
        )}

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
              <Text style={styles.uploadHint}>Maximum file size: 1MB • JPG, PNG</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Title */}
          <View style={styles.input}>
            <Text style={styles.inputLabel}>
              <Ionicon name="newspaper-outline" size={18} color="#222" /> Title *
            </Text>
            <TextInput
              autoCapitalize="sentences"
              autoCorrect={false}
              keyboardType="default"
              placeholder="Enter your article title"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={title}
              onChangeText={handleTitleChange}
              maxLength={ARTICLE_TITLE_MAX_LENGTH}
            />
            <Text
              style={[
                styles.charCounter,
                isNearLimit(title, ARTICLE_TITLE_MAX_LENGTH) &&
                  styles.charCounterWarning,
              ]}>
              {title.length} / {ARTICLE_TITLE_MAX_LENGTH}
            </Text>
          </View>

          {/* Author Name */}
          <View style={styles.input}>
            <Text style={styles.inputLabel}>
              <Ionicon name="person-outline" size={18} color="#222" /> Author Name *
            </Text>
            <TextInput
              autoCapitalize="words"
              autoCorrect={false}
              keyboardType="default"
              placeholder="Enter author name"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={authorName}
              onChangeText={setAuthorName}
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
                {language ? getLanguageLabel(language) : 'Select target language'}
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
              placeholder="Provide a brief overview of your article"
              placeholderTextColor="#6b7280"
              textAlignVertical="top"
              style={styles.aboutInput}
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
              value={description}
              onChangeText={handleDescriptionChange}
              maxLength={ARTICLE_DESCRIPTION_MAX_LENGTH}
            />
            <Text
              style={[
                styles.charCounter,
                isNearLimit(description, ARTICLE_DESCRIPTION_MAX_LENGTH) &&
                  styles.charCounterWarning,
              ]}>
              {description.length} / {ARTICLE_DESCRIPTION_MAX_LENGTH}
            </Text>
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicon name="pricetag-outline" size={18} color="#222" /> Tags
          </Text>
          <Text style={styles.sectionSubtitle}>
            Select up to 5 tags to help people discover your article
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
          <Text style={styles.submitButtonText}>Continue to Editor</Text>
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
  translationNotice: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 14,
  },
  translationNoticeTextWrapper: {
    flex: 1,
  },
  translationNoticeTitle: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  translationNoticeText: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
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
  charCounter: {
    marginTop: 6,
    alignSelf: 'flex-end',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  charCounterWarning: {
    color: '#EA580C',
    fontWeight: '700',
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
  selectedGenresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  selectedGenreItem: {
    backgroundColor: PRIMARY_COLOR,
    padding: 8,
    margin: 4,
    borderRadius: 4,
  },
  selectedGenreText: {
    color: PRIMARY_COLOR,
    marginHorizontal: hp(0.5),
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

export default ArticleDescriptionScreen;
