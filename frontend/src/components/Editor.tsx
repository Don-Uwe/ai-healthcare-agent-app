import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import {wp, hp} from '../helper/Metric';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {useRef, useState} from 'react';

export default function Editor({
  callback,
}: {
  callback: (reason: string) => void;
}) {
  const RichText = useRef();
  const [feedback, setFeedback] = useState('');
  const RichTextTool = useRef('');
  function handleHeightChange(_height) {}

  function editorInitializedCallback() {
    RichText.current?.registerToolbar(function (_items) {});
  }

  const createFeebackHTMLStructure = (feedback: string) => {
    return `<!DOCTYPE html>
   <html>
   <head>
   <style>
   /**
    * Copyright 2024,UltimateHealth. All rights reserved.
    */
   body {
     font-family: Arial, sans-serif;
     font-size: 40px; 
     line-height: 1.5; 
     color: #333; 
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
   table {
       border-collapse: collapse;
       width: 100%;
     }
   
     th, td {
       border: 1px solid #ddd;
       padding: 8px;
       text-align: left;
     }
   
     th {
       background-color: #f0f0f0;
     }
   .tag-list {
     list-style-type: none;
     padding: 0;
     margin: 0;
     display: flex;
     flex-wrap: wrap;
   }
   
   .tag-list li {
     margin-right: 10px;
   }
   
   .tag {
     color: blue;
     text-decoration: none;
   }
   </style>
   </head>
   <body>
   ${feedback}
   <hr>
   </body>
   `;
  };
  return (
    <View style={styles.inputContainer}>
      <RichToolbar
        style={[styles.richBar]}
        editor={RichText}
        disabled={false}
        iconTint={'black'}
        selectedIconTint={PRIMARY_COLOR}
        disabledIconTint={'purple'}
        iconSize={30}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.heading4,
          actions.heading5,
          actions.heading6,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertLink,
          actions.table,
          actions.undo,
          actions.redo,
          actions.blockquote,
        ]}
        iconMap={{
          [actions.setStrikethrough]: ({tintColor}) => (
            <FontAwesome name="strikethrough" color={tintColor} size={26} />
          ),
          [actions.alignLeft]: ({tintColor}) => (
            <Feather name="align-left" color={tintColor} size={35} />
          ),
          [actions.alignCenter]: ({tintColor}) => (
            <Feather name="align-center" color={tintColor} size={35} />
          ),
          [actions.alignRight]: ({tintColor}) => (
            <Feather name="align-right" color={tintColor} size={35} />
          ),
          [actions.undo]: ({tintColor}) => (
            <Ionicons name="arrow-undo" color={tintColor} size={35} />
          ),
          [actions.redo]: ({tintColor}) => (
            <Ionicons name="arrow-redo" color={tintColor} size={35} />
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
          [actions.blockquote]: ({tintColor}) => (
            <Entypo name="quote" color={tintColor} size={35} />
          ),
        }}
      />
      <RichEditor
        disabled={false}
        containerStyle={styles.editor}
        ref={RichText}
        style={styles.rich}
        placeholder={'Reason for improvement'}
        initialContentHTML={feedback}
        onChange={text => setFeedback(text)}
        editorInitializedCallback={editorInitializedCallback}
        onHeightChange={handleHeightChange}
        initialHeight={300}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => {
          // emit socket event for feedback
          const ans = createFeebackHTMLStructure(feedback);
          callback(ans);
        }}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: hp(40),
    overflow: 'hidden',
    borderColor: '#000',
    borderWidth: 0.2,
    marginHorizontal: wp(0),
    marginTop: hp(0),
  },
  editor: {
    backgroundColor: 'blue',
    borderColor: 'black',
    marginHorizontal: 1,
  },
  rich: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  richBar: {
    height: 40,
    backgroundColor: ON_PRIMARY_COLOR,
    marginTop: 0,
    marginBottom: hp(0.8),
  },
  tib: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#515156',
  },

  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    //padding: 5,
    paddingVertical: 12,
    marginHorizontal: 10,
    alignItems: 'center',
    borderRadius: 7,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
