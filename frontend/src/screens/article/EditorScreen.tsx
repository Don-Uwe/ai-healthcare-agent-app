/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, ScrollView, Alert} from 'react-native';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import IonIcon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {EditorScreenProp} from '../../type';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {hp} from '../../helper/Metric';
import {GET_STORAGE_DATA} from '../../helper/APIUtils';

// Feature:
// If you want to discard your post, in that case no post will upload into storage,
const EditorScreen = ({navigation, route}: EditorScreenProp) => {
  const insets = useSafeAreaInsets();
  const {
    title,
    description,
    selectedGenres,
    authorName,
    imageUtils,
    articleData,
    requestId,
  } = route.params;

  const RichText = useRef();
  const [article, setArticle] = useState('');
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [htmlImages, setHtmlImages] = useState<string[]>([]);
  const [editorReady, setEditorReady] = useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.preview_button}
          onPress={() => {
            console.log('Preview button pressed');
            if (article.length > 20) {
              console.log('Preview Screen');
              navigation.navigate('PreviewScreen', {
                article: article,
                title: title,
                authorName: authorName,
                description: description,
                image: imageUtils,
                selectedGenres: selectedGenres,
                localImages: localImages,
                htmlImages: htmlImages,
                articleData: articleData,
                requestId: requestId,
              });
            } else {
              Alert.alert('Error', 'Please enter at least 20 characters');
            }
          }}>
          <Fontisto name="preview" size={26} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [
    navigation,
    article,
    title,
    description,
    imageUtils,
    selectedGenres,
    authorName,
    localImages,
    htmlImages,
    articleData,
    requestId,
  ]);

  useEffect(() => {
    const loadArticle = async () => {
      if (!articleData) {
        return;
      }
      try {
        if (articleData.content.endsWith('.html')) {
          await getContent(articleData.content);

          setEditorReady(true);
        } else {
          setArticle(articleData.content);
          setEditorReady(true);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      }
    };

    loadArticle();
  }, [articleData]);

  React.useEffect(() => {
    if (imageUtils) {
      setLocalImages(prevImages => [imageUtils, ...prevImages]); // Add imageUtils at the start
    }
  }, [imageUtils]);

  useEffect(() => {
    if (editorReady && article) {
      
      RichText.current?.setContentHTML(article);
      //RichText.current?.focusContentEditor(); // Optional: Ensure the cursor is focused
    }
  }, [editorReady]);

  // this function will be called when the editor has been initialized
  function editorInitializedCallback() {
    RichText.current?.registerToolbar(function (_items) {
      setEditorReady(true);
    });
  }

  const getContent = async content => {
    try {
      const response = await fetch(`${GET_STORAGE_DATA}/${content}`);
      const text = await response.text();
      setArticle(text);
    } catch (error) {
      // console.error('Error fetching URI:', error);
      setArticle(content);
    }
  };

  // Callback after height change
  function handleHeightChange(_height) {
    // console.log("editor height change:", height);
  }

  async function onPressAddImage() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      presentationStyle: 'popover',
      quality: 0.7,
      includeBase64: true,
    });
    if (result.assets && result.assets.length > 0) {
      const type = result.assets[0].type;
      const base64String = result.assets[0].base64;
      const str = `data:${type};base64,${base64String}`;

      const width = 1000;
      const height = 1000;

      setLocalImages(prev => [...prev, str]);
      setHtmlImages(prev => [...prev, imageHTML]);

      const imageHTML = `<img src="${str}" style="width: ${width}px; height: ${height}px;" />`;

      await RichText.current?.insertHTML(imageHTML);

      //await RichText.current?.insertImage(str);
    } else {
      //console.log('No image selected');
    }
  }

  const staticArticle = `
   <!DOCTYPE html>
<html>
<head>
        <title>Digital Detox: Balancing Technology and Mental Health</title>
        <style>
        body {
  font-family: Arial, sans-serif;
}

h1 {
  color: #00698f;
}

h2 {
  color: #008000;
}

h3 {
  color: #660066;
}
strong{
    color: #00698f;
}
h4 {
  color: #0099CC;
}

h5 {
  color: #FF9900;
}

h6 {
  color: #663300;
}

ul {
  list-style-type: disc;
}

li {
  margin-bottom: 10px;
}

article {
  width: 80%;
  margin: 40px auto;
}
        </style>
</head>
<body>

<article>

<h1 id="digital-detox-balancing-technology-and-mental-health">Digital Detox: Balancing Technology and Mental Health</h1>
<h2 id="table-of-contents">Table of Contents</h2>
<ol>
<li><a href="#introduction">Introduction</a></li>
<li><a href="#the-need-for-digital-detox">The Need for Digital Detox</a><ul>
<li><a href="#tech-overload">Tech Overload</a></li>
<li><a href="#mental-health-impacts">Mental Health Impacts</a></li>
<li><a href="#physical-health-concerns">Physical Health Concerns</a></li>
</ul>
</li>
<li><a href="#benefits-of-a-digital-detox">Benefits of a Digital Detox</a><ul>
<li><a href="#improved-mental-clarity">Improved Mental Clarity</a></li>
<li><a href="#better-sleep-quality">Better Sleep Quality</a></li>
<li><a href="#enhanced-physical-health">Enhanced Physical Health</a></li>
<li><a href="#strengthened-relationships">Strengthened Relationships</a></li>
</ul>
</li>
<li><a href="#signs-you-need-a-digital-detox">Signs You Need a Digital Detox</a></li>
<li><a href="#how-to-implement-a-digital-detox">How to Implement a Digital Detox</a><ul>
<li><a href="#set-boundaries">Set Boundaries</a></li>
<li><a href="#create-tech-free-zones">Create Tech-Free Zones</a></li>
<li><a href="#practice-mindfulness">Practice Mindfulness</a></li>
<li><a href="#engage-in-offline-activities">Engage in Offline Activities</a></li>
</ul>
</li>
<li><a href="#maintaining-a-balanced-digital-life">Maintaining a Balanced Digital Life</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</ol>
<h2 id="introduction">Introduction</h2>
<p>In our hyper-connected world, technology permeates almost every aspect of daily life. While it brings numerous benefits, the constant presence of screens and digital interactions can take a toll on mental and physical health. A digital detox offers a break from technology, helping to restore balance and improve overall well-being.</p>
<h2 id="the-need-for-digital-detox">The Need for Digital Detox</h2>
<h3 id="tech-overload">Tech Overload</h3>
<p>The average person spends several hours a day on screens, whether for work, socializing, or entertainment. This constant connectivity can lead to digital overload, where the sheer volume of information and interactions becomes overwhelming.</p>
<h3 id="mental-health-impacts">Mental Health Impacts</h3>
<p>Excessive use of technology, especially social media, has been linked to increased levels of anxiety, depression, and stress. The constant barrage of notifications and the pressure to stay connected can contribute to feelings of inadequacy and burnout.</p>
<h3 id="physical-health-concerns">Physical Health Concerns</h3>
<p>Extended screen time can lead to physical health issues such as eye strain, poor posture, and a sedentary lifestyle. These factors contribute to a range of problems, including headaches, back pain, and a higher risk of chronic diseases like obesity and heart disease.</p>
<h2 id="benefits-of-a-digital-detox">Benefits of a Digital Detox</h2>
<h3 id="improved-mental-clarity">Improved Mental Clarity</h3>
<p>Taking a break from screens allows the brain to rest and recharge. It can lead to enhanced focus, creativity, and mental clarity, making it easier to tackle tasks and solve problems effectively.</p>
<h3 id="better-sleep-quality">Better Sleep Quality</h3>
<p>Exposure to screens, especially before bedtime, can disrupt sleep patterns due to the blue light emitted by devices. A digital detox helps regulate sleep cycles, leading to better quality sleep and improved overall health.</p>
<h3 id="enhanced-physical-health">Enhanced Physical Health</h3>
<p>Reducing screen time encourages more physical activity and outdoor engagement. This can improve cardiovascular health, increase energy levels, and promote a healthier lifestyle.</p>
<h3 id="strengthened-relationships">Strengthened Relationships</h3>
<p>Disconnecting from digital devices fosters more meaningful face-to-face interactions. This can strengthen relationships with family and friends, enhancing emotional well-being and social support.</p>
<h2 id="signs-you-need-a-digital-detox">Signs You Need a Digital Detox</h2>
<ul>
<li><strong>Constant Check-Ins:</strong> Feeling the urge to check your phone or social media frequently.</li>
<li><strong>Sleep Issues:</strong> Difficulty falling asleep or poor sleep quality due to screen use.</li>
<li><strong>Eye Strain:</strong> Experiencing headaches, dry eyes, or blurred vision after screen use.</li>
<li><strong>Anxiety and Stress:</strong> Increased feelings of anxiety, stress, or irritability related to technology.</li>
<li><strong>Neglect of Responsibilities:</strong> Ignoring tasks or responsibilities in favor of screen time.</li>
</ul>
<h2 id="how-to-implement-a-digital-detox">How to Implement a Digital Detox</h2>
<h3 id="set-boundaries">Set Boundaries</h3>
<p>Establish specific times of the day to unplug from digital devices. For example, avoid screens an hour before bed and designate tech-free periods during meals or family time.</p>
<h3 id="create-tech-free-zones">Create Tech-Free Zones</h3>
<p>Designate certain areas of your home as tech-free zones, such as the bedroom or dining room. This helps create a clear separation between online and offline spaces.</p>
<h3 id="practice-mindfulness">Practice Mindfulness</h3>
<p>Incorporate mindfulness practices into your daily routine. Activities such as meditation, deep breathing exercises, and journaling can help reduce stress and improve mental clarity.</p>
<h3 id="engage-in-offline-activities">Engage in Offline Activities</h3>
<p>Rediscover hobbies and activities that don&#39;t involve screens. Reading books, hiking, painting, or playing sports can provide a refreshing break from digital devices and promote a healthier lifestyle.</p>
<h2 id="maintaining-a-balanced-digital-life">Maintaining a Balanced Digital Life</h2>
<p>After completing a digital detox, it&#39;s important to maintain a balanced approach to technology use. Set ongoing boundaries, prioritize offline activities, and regularly assess your digital habits to ensure they align with your well-being goals.</p>
<h2 id="conclusion">Conclusion</h2>
<p>A digital detox is a powerful tool for restoring balance in a tech-saturated world. By taking intentional breaks from screens, you can improve mental clarity, enhance physical health, and strengthen personal relationships. Embrace the benefits of a digital detox and create a healthier, more balanced life.</p>

<h4>Contributed By <a href="https://github.com/arunimaChintu">Arunima Dutta</a></h4>
</article>
</body>
</html>
  `;

  // async function insertVideo() {
  //   const result = await ImagePicker.launchImageLibrary({
  //     mediaType: 'video',
  //     presentationStyle: 'popover',
  //   });

  //   if (result.assets && result.assets.length > 0) {
  //     const fileUri = result.assets[0].uri;
  //     console.log('Image URI:', fileUri);
  //     setvideoData(`${fileUri}`);
  //     // Convert the video URI to a Blob
  //     // await RichText.current?.insertVideo(blobUrl);
  //     // Insert video through local file url
  //     RichText.current?.insertVideo(fileUri);
  //   } else {
  //     console.log('No video selected');
  //   }
  // }
  /*
  const onPressAddImage =  () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(options, async response => {
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
          .then(async resizedImageUri => {
            // If the image is resized successfully, upload it
          })
          .catch(err => {
            console.log(err);
            Alert.alert('Error', 'Could not resize the image.');
          });

        // setImageUtils(uri ? uri : '');
        await RichText.current?.insertImage(uri ? uri : '');
      }
    });
  };
*/
  return (
    <ScrollView style={[styles.container, {paddingBottom: insets.bottom}]}>
      {/* <View style={styles.box}>
        <Text style={styles.text}>Write your post</Text>

        <TouchableOpacity
          onPress={() => {
            //if (article.length > 20) {
            navigation.navigate('PreviewScreen', {
              article: article,
            });
            // }
          }}>
          <Text style={styles.preview}>Preview</Text>
        </TouchableOpacity>
      </View> */}

      <RichToolbar
        style={[styles.richBar]}
        editor={RichText}
        disabled={false}
        iconTint={'white'}
        selectedIconTint={'black'}
        disabledIconTint={'purple'}
        onPressAddImage={onPressAddImage}
        iconSize={30}
        actions={[
          // Text Formatting Actions
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,

          // Heading Actions
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.heading4,
          actions.heading5,
          actions.heading6,

          // Alignment Actions
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,

          // List Actions
          actions.insertBulletsList,
          actions.insertOrderedList,

          // Insert Actions
          actions.insertLink,
          actions.insertImage,
          //actions.insertHTML,
          actions.table,

          // Undo/Redo Actions
          actions.undo,
          actions.redo,

          // Blockquote Action
          actions.blockquote,
        ]}
        iconMap={{
          // Custom Icons for Text Formatting Actions
          [actions.setStrikethrough]: ({tintColor}) => (
            <FontAwesome name="strikethrough" color={tintColor} size={26} />
          ),

          // Custom Icons for Alignment Actions
          [actions.alignLeft]: ({tintColor}) => (
            <Feather name="align-left" color={tintColor} size={35} />
          ),
          [actions.alignCenter]: ({tintColor}) => (
            <Feather name="align-center" color={tintColor} size={35} />
          ),
          [actions.alignRight]: ({tintColor}) => (
            <Feather name="align-right" color={tintColor} size={35} />
          ),

          // Custom Icons for Undo/Redo Actions
          [actions.undo]: ({tintColor}) => (
            <IonIcon name="arrow-undo" color={tintColor} size={35} />
          ),
          [actions.redo]: ({tintColor}) => (
            <IonIcon name="arrow-redo" color={tintColor} size={35} />
          ),

          // Custom Icons for Heading Actions
          [actions.heading1]: ({tintColor}) => (
            <Text style={[styles.tib, {color: tintColor}]}>H1</Text>
          ),
          [actions.heading2]: ({tintColor}) => (
            <Text style={[styles.tib, {color: tintColor}]}>H2</Text>
          ),
          [actions.heading3]: ({tintColor}) => (
            <Text style={[styles.tib, {color: tintColor}]}>H3</Text>
          ),
          [actions.heading4]: ({tintColor}) => (
            <Text style={[styles.tib, {color: tintColor}]}>H4</Text>
          ),
          [actions.heading5]: ({tintColor}) => (
            <Text style={[styles.tib, {color: tintColor}]}>H5</Text>
          ),
          [actions.heading6]: ({tintColor}) => (
            <Text style={[styles.tib, {color: tintColor}]}>H6</Text>
          ),

          // Custom Icon for Image Insertion
          [actions.insertImage]: ({tintColor}) => (
            <Entypo name="image" color={tintColor} size={29} />
          ),

          // Custom Icon for Blockquote Action
          [actions.blockquote]: ({tintColor}) => (
            <Entypo name="quote" color={tintColor} size={35} />
          ),
        }}
        insertImage={onPressAddImage}
      />

      <RichEditor
        disabled={false}
        containerStyle={styles.editor}
        ref={RichText}
        style={styles.rich}
        placeholder={'Start Writing Here'}
        initialContentHTML={article}
        onChange={text => setArticle(text)}
        editorInitializedCallback={editorInitializedCallback}
        onHeightChange={handleHeightChange}
        initialHeight={600}
      />

      {/**
     *
     *  <Text style={styles.text}>Result</Text>

      <HTMLView value={article} stylesheet={styles} />
     */}
    </ScrollView>
  );
};

export default EditorScreen;

const styles = StyleSheet.create({
  /********************************/
  /* styles for html tags */
  a: {
    fontWeight: 'bold',
    color: 'purple',
  },
  div: {
    fontFamily: 'monospace',
  },
  p: {
    fontSize: 30,
  },
  /*******************************/
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  editor: {
    backgroundColor: ON_PRIMARY_COLOR,
    borderColor: 'black',
    marginHorizontal: 4,
  },
  rich: {
    //minHeight: 700,
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  richBar: {
    height: 55,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 0,
    marginBottom: hp(0.8),
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
  },

  preview: {
    fontWeight: '500',
    fontSize: 18,
  },
  tib: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#515156',
  },

  box: {
    flex: 0,
    width: '94%',
    marginBottom: 20,
    marginTop: 10,
    marginStart: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  preview_button: {
    marginRight: 15,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  fontOption: {
    fontSize: 18,
    paddingVertical: 10,
  },
  closeButton: {
    marginTop: 15,
    color: 'blue',
    fontSize: 18,
  },
});
