import React, {useRef} from 'react';
import {StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {WebView} from 'react-native-webview';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {PreviewScreenProp} from '../../type';
import {demo} from '../../helper/Utils';

export default function PreviewScreen({navigation, route}: PreviewScreenProp) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {article} = route.params;
  const webViewRef = useRef<WebView>(null);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.textWhite}>Post</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadCss = () => {
    const cssString = `
    *{
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Merriweather', serif;
        font-size: 24px;
        line-height: 1.5;
        color: #333;
        background-color: #f9f9f9;
      }
      
      /* Article Container */
      
      .article {
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        background-color: #fff;
        border: 1px solid #ddd;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      
      /* Headings */
      
      h1, h2, h3, h4, h5, h6 {
        font-weight: bold;
        color: #337ab7;
        margin-bottom: 10px;
      }
      
      h1 {
        font-size: 46px;
      }
      
      h2 {
        font-size: 36px;
      }
      
      h3 {
        font-size: 32px;
      }
      
      h4 {
        font-size: 26px;
      }
      
      h5 {
        font-size: 22px;
      }
      
      h6 {
        font-size: 18px;
      }
      
      /* Paragraphs */
      
      p {
        margin-bottom: 20px;
      }
      
      /* Dividers */
      
      div.divider {
        height: 1px;
        background-color: #ccc;
        margin: 20px 0;
      }
      
      /* Ordered Lists */
      
      ol {
        margin: 20px 0;
        padding: 0 20px;
      }
      
      ol li {
        margin-bottom: 10px;
      }
      
      ol li:before {
        content: counter(ol-li);
        counter-increment: ol-li;
        font-weight: bold;
        font-size: 18px;
        margin-right: 10px;
        color: #337ab7;
      }
      
      /* List Items */
      
      li {
        margin-bottom: 10px;
      }
      
      /* Links */
      
      a {
        text-decoration: none;
        color: #337ab7;
      }
      
      a:hover {
        color: #23527c;
      }
      
      /* Images */
      
      img {
        max-width: 100%;
        height: auto;
        margin: 20px 0;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      
      /* Responsive Design */
      
      @media (max-width: 768px) {
        .article {
          padding: 10px;
        }
        h1 {
          font-size: 24px;
        }
        h2 {
          font-size: 18px;
        }
        h3 {
          font-size: 16px;
        }
        h4, h5, h6 {
          font-size: 14px;
        }
        img {
          margin: 10px 0;
        }
      }
      
      /* Mobile Responsive Styles */
      
      @media (max-width: 480px) {
        /* Article Container */
        .article {
          padding: 5px;
        }
      
        /* Headings */
        h1 {
          font-size: 18px;
        }
        h2 {
          font-size: 16px;
        }
        h3 {
          font-size: 14px;
        }
        h4, h5, h6 {
          font-size: 12px;
        }
      
        /* Paragraphs */
        p {
          margin-bottom: 10px;
        }
      
        /* Dividers */
        div.divider {
          margin: 10px 0;
        }
      
        /* Ordered Lists */
        ol {
          margin: 10px 0;
          padding: 0 10px;
        }
        ol li {
          margin-bottom: 5px;
        }
        ol li:before {
          font-size: 14px;
        }
      
        /* List Items */
        li {
          margin-bottom: 5px;
        }
      
        /* Links */
        a {
          font-size: 14px;
        }
      
        /* Images */
        img {
          margin: 5px 0;
          border-radius: 5px;
        }
      }
      
      @media (max-width: 320px) {
        /* Article Container */
        .article {
          padding: 0;
        }
      
        /* Headings */
        h1 {
          font-size: 20px;
        }
        h2 {
          font-size: 16px;
        }
        h3 {
          font-size: 12px;
        }
        h4, h5, h6 {
          font-size: 10px;
        }
      
        /* Paragraphs */
        p {
          margin-bottom: 5px;
        }
      
        /* Dividers */
        div.divider {
          margin: 5px 0;
        }
      
        /* Ordered Lists */
        ol {
          margin: 5px 0;
          padding: 0 5px;
        }
        ol li {
          margin-bottom: 0;
        }
        ol li:before {
          font-size: 12px;
        }
      
        /* List Items */
        li {
          margin-bottom: 0;
        }
      
        /* Links */
        a {
          font-size: 12px;
        }
      
        /* Images */
        img {
          margin: 0;
          border-radius: 0;
        }
      }
      `;
    return `<html>
      <head>
        <style>
          ${cssString}
        </style>
      </head>
      <body>
        ${demo}
      </body>
    </html>`;
  };

  return (
    <WebView
      style={{
        padding: 10,
        margin: 10,
        width: '99%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      ref={webViewRef}
      originWhitelist={['*']}
      source={{html: loadCss()}} // replace with your URL
      javaScriptEnabled={true}
      // onLoad={loadCss}
      //style={{flex: 1}}
    />
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
    marginRight: 10,
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
