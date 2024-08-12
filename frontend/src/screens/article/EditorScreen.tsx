/* eslint-disable react/no-unstable-nested-components */
import React, {useRef, useState} from 'react';
import {StyleSheet, Text, ScrollView} from 'react-native';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import IonIcon from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {EditorScreenProp} from '../../type';
import * as ImagePicker from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const EditorScreen = ({navigation}: EditorScreenProp) => {
  const insets = useSafeAreaInsets();
  const strikethrough = require('../../assets/stricketThrough.png'); //icon for strikethrough
  //const video = require('../../assets/play-button.png'); //icon for Addvideo
  const RichText = useRef(); //reference to the RichEditor component
  const [article, setArticle] = useState('');
  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.preview_button}
          onPress={() => {
            //if (article.length > 20) {
            navigation.navigate('PreviewScreen', {
              article: article,
            });
            // }
          }}>
          <Fontisto name="preview" size={26} color="black" />
          {/* <MaterialIcons name="preview" size={30} /> */}
        </TouchableOpacity>
      ),
    });
  }, [navigation, article]);
  // this function will be called when the editor has been initialized
  function editorInitializedCallback() {
    RichText.current?.registerToolbar(function (_items) {
      // items contain all the actions that are currently active
      // console.log(
      //   'Toolbar click, selected items (insert end callback):',
      //   items,
      // );
    });
  }

  // Callback after height change
  function handleHeightChange(_height) {
    // console.log("editor height change:", height);
  }

  async function onPressAddImage() {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      presentationStyle: 'popover',
      quality: 0.7,
      includeBase64: true,
    });
    if (result.assets && result.assets.length > 0) {
      const type = result.assets[0].type;
      const base64String = result.assets[0].base64;
      const str = `data:${type};base64,${base64String}`;
      await RichText.current?.insertImage(str);
    } else {
      console.log('No image selected');
    }
  }

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
          // 'insertVideo',
          'insertImage',
          // ...defaultActions,
          actions.setStrikethrough,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.undo,
          actions.redo,
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.heading4,
          actions.heading5,
          actions.heading6,
          actions.blockquote,
          actions.insertHTML,
        ]}
        // map icons for self made actions
        iconMap={{
          [actions.alignLeft]: ({tintColor}) => (
            <Feather name="align-left" color={tintColor} size={35} />
          ),

          [actions.blockquote]: ({tintColor}) => (
            <Entypo name="quote" color={tintColor} size={35} />
          ),

          [actions.undo]: ({tintColor}) => (
            <IonIcon name="arrow-undo" color={tintColor} size={35} />
          ),

          [actions.redo]: ({tintColor}) => (
            <IonIcon name="arrow-redo" color={tintColor} size={35} />
          ),

          [actions.alignCenter]: ({tintColor}) => (
            <Feather name="align-center" color={tintColor} size={35} />
          ),

          [actions.alignRight]: ({tintColor}) => (
            <Feather name="align-right" color={tintColor} size={35} />
          ),

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

          [actions.setStrikethrough]: strikethrough,
          // ['insertVideo']: video,
          ['insertImage']: ({tintColor}) => (
            <Entypo name="image" color={tintColor} size={26} />
          ),
        }}
        // insertVideo={insertVideo}
        insertImage={onPressAddImage}
      />
      <RichEditor
        disabled={false}
        containerStyle={styles.editor}
        ref={RichText}
        style={styles.rich}
        placeholder={'Start Writing Here'}
        onChange={text => setArticle(text)}
        editorInitializedCallback={editorInitializedCallback}
        onHeightChange={handleHeightChange}
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
    backgroundColor: '#FFFFFF',
  },
  editor: {
    // backgroundColor: 'black',
    borderColor: 'black',
    borderWidth: 1,
    marginHorizontal: 10,
  },
  rich: {
    minHeight: 300,
    flex: 1,
  },
  richBar: {
    height: 55,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 14,
    marginBottom: 34,
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
});
