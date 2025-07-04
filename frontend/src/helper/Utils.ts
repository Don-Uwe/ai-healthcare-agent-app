import NetInfo from '@react-native-community/netinfo';
import {Category, CategoryType, PodcastData} from '../type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GET_STORAGE_DATA} from './APIUtils';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

export const checkInternetConnection = (
  callback: (isConnected: boolean) => void,
) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    return callback(state.isConnected ? state.isConnected : false);
  });

  return unsubscribe;
};

export function formatCount(count: number) {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return Math.floor(count / 1000) + 'k';
  } else {
    return Math.floor(count / 1000000) + 'M';
  }
}

export function msToTime(ms: number): string {
  let totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, '0');

  let result =
    hours >= 1
      ? `${pad(hours)}h:${pad(minutes)}m`
      : `${pad(minutes)}m:${pad(seconds)}s`;

  return result;
}

// Async Storage for get Item
export const retrieveItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    // error reading value
    console.log('Error reading value', e);
  }
};

// Async Storage Store Item
export const storeItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    // console.log(`Value saved for key : ${key}`, value);
  } catch (e) {
    console.log('Async Storage Data error', e);
  }
};

// Async storage remove item
export const removeItem = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    //navigation.navigate('LoginScreen');
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const createHTMLStructure = (
  title: string,
  body: string,
  tags: Category[],
  social_link: string,
  author: string,
) => {
  return `<!DOCTYPE html>
<html>
<head>

<title>${title}</title>
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
${body}
<hr>
<ul class="tag-list">
  ${tags
    .map(tag => `<li><a class="tag" href="#">#${tag.name}</a></li>`)
    .join('')}
</ul>
<h3>Author</h3>
<h4>${author}</a></h4>
</body>
`;
};

// General purpose podcast app, no need to encrypted download data here, 
// We will ensure that, there will be no copyrighted content, or we can't give access to download
// copyrighted content, as per ultimatehealth system
/** Download podcast */
export const downloadAudio = async (_podcast: PodcastData) => {
  // Check for existing downloads
  const existingPodcastsStr = await retrieveItem('DOWNLOAD_PODCAST_DATA');
  try {
    let existingPodcasts = existingPodcastsStr
      ? JSON.parse(existingPodcastsStr)
      : [];

    if (Array.isArray(existingPodcasts) && existingPodcasts.length >= 5) {
      return {
        message: "You can't keep more than 5 audio",
        success: false,
      };
    }
    // download the file
    const path = await downloadFile(_podcast.audio_url, _podcast.title);
    if (path) {
      if (!Array.isArray(existingPodcasts)) {
        existingPodcasts = [];
      }
      existingPodcasts.push({
        ..._podcast,
       // filePath: `file://${path}`,
        filePath: path,
        downloadAt: Date.now(),
      });
      await storeItem('DOWNLOAD_PODCAST_DATA', JSON.stringify(existingPodcasts));

      return {
        message: 'File saved successfully',
        success: true,
      };
    } else {
      return {
        message: 'Something went wrong, try again after sometime',
        success: false,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      message: 'Something went wrong, try again after sometime',
      success: false,
    };
  }
};

const downloadFile = async (key: string, title: string) => {
  const safeTitle = title.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${safeTitle}_${Date.now()}.mp3`;
  const downloadUrl = `${GET_STORAGE_DATA}/${key}`;

  const customDirectory =
    Platform.OS === 'android'
      ? RNFS.ExternalDirectoryPath
      : RNFS.DocumentDirectoryPath;

  const filePath = `${customDirectory}/${fileName}`;

  const directoryExists = await RNFS.exists(customDirectory);

  if (!directoryExists) {
    await RNFS.mkdir(customDirectory);
  }
  const result = await RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: filePath,
  }).promise;

  if (result.statusCode === 200) {
    console.log('Audio downloaded to:', filePath);
    return filePath;
  } else {
    console.error('Download failed:', result.statusCode);
    return null;
  }
};

export const cleanUpDownloads = async ()=>{
  // TODO: 
}

export const createFeebackHTMLStructure = (feedback: string) => {
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

export const KEYS = {
  USER_ID: 'USER_ID',
  USER_TOKEN: 'USER_TOKEN',
  USER_TOKEN_EXPIRY_DATE: 'USER_TOKEN_EXPIRY_DATE',
  VULTR_CHAT_MODEL: 'zephyr-7b-beta-f32',
  VULTR_COLLECTION: 'care_companion',
  USER_HANDLE: 'USER_HANDLE',
  DOWNLOAD_PODCAST_DATA: 'DOWNLOAD_PODCAST_DATA',
};

export const VULTR_CHAT_ROLES = {
  user: 'user',
  system: 'system',
  assistant: 'assistant',
};
export const VULTR_CHAT_PROFILE_AVTARS = {
  user: '',
  system: '',
  assistant:
    'https://static.vecteezy.com/system/resources/previews/026/309/247/non_2x/robot-chat-or-chat-bot-logo-modern-conversation-automatic-technology-logo-design-template-vector.jpg',
};

export const Categories: CategoryType[] = [
  {id: 1, name: 'Cardiology'},
  {id: 2, name: 'Neurology'},
  {id: 3, name: 'Oncology'},
  {id: 4, name: 'Dermatology'},
  {id: 5, name: 'Gastroenterology'},
  {id: 6, name: 'Endocrinology'},
  {id: 7, name: 'Pediatrics'},
  {id: 8, name: 'Orthopedics'},
  {id: 9, name: 'Psychiatry'},
  {id: 10, name: 'Pulmonology'},
];

export const StatusEnum = {
  UNASSIGNED: 'unassigned', // can't change
  IN_PROGRESS: 'in-progress', // can't change
  REVIEW_PENDING: 'review-pending', // can't change
  PUBLISHED: 'published',
  DISCARDED: 'discarded', // can't change
  AWAITING_USER: 'awaiting-user',
};
