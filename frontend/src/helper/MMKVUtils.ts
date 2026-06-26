import AsyncStorage from '@react-native-async-storage/async-storage';
import {PodcastData} from '../type';

type MMKVStorageLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clearAll: () => void;
};

type SerializedPodcastDownloadRecord = Omit<PodcastData, 'filePath' | 'downloadAt'> & {
  filePath: string;
  downloadAt: string;
  audioUrl?: string;
  audio_url?: string;
};

export type PodcastDownloadRecord = Omit<SerializedPodcastDownloadRecord, 'downloadAt'> & {
  downloadAt: Date;
};

const PODCAST_STORAGE_KEY = 'DOWNLOAD_PODCAST_DATA';
const PODCAST_CACHE_ID = 'podcast_cache';
const READING_PROGRESS_CACHE_ID = 'reading_progress_cache';

let podcastMMKV: MMKVStorageLike | null = null;
let hasAttemptedInitialization = false;
let readingProgressMMKV: MMKVStorageLike | null = null;
let hasAttemptedReadingProgressInitialization = false;

const initializeMMKV = (): MMKVStorageLike | null => {
  if (hasAttemptedInitialization) {
    return podcastMMKV;
  }

  hasAttemptedInitialization = true;

  try {
     
    const mmkvModule = require('react-native-mmkv') as {
      createMMKV?: (config: {id: string}) => MMKVStorageLike;
    };

    if (mmkvModule?.createMMKV) {
      podcastMMKV = mmkvModule.createMMKV({id: PODCAST_CACHE_ID});
    }
  } catch (error) {
    console.log('MMKV module not available, falling back to AsyncStorage', error);
    podcastMMKV = null;
  }

  return podcastMMKV;
};

const initializeReadingProgressMMKV = (): MMKVStorageLike | null => {
  if (hasAttemptedReadingProgressInitialization) {
    return readingProgressMMKV;
  }

  hasAttemptedReadingProgressInitialization = true;

  try {
    const mmkvModule = require('react-native-mmkv') as {
      createMMKV?: (config: {id: string}) => MMKVStorageLike;
    };

    if (mmkvModule?.createMMKV) {
      readingProgressMMKV = mmkvModule.createMMKV({
        id: READING_PROGRESS_CACHE_ID,
      });
    }
  } catch (error) {
    console.log('Reading progress MMKV module not available', error);
    readingProgressMMKV = null;
  }

  return readingProgressMMKV;
};

const parsePodcastData = (
  value: string | null | undefined,
): PodcastDownloadRecord[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as SerializedPodcastDownloadRecord[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(item => ({
      ...item,
      downloadAt: new Date(item.downloadAt),
    }));
  } catch (error) {
    console.log('Podcast cache parse error', error);
    return [];
  }
};

const persistPodcastData = async (value: string): Promise<void> => {
  const mmkv = initializeMMKV();

  if (mmkv) {
    try {
      mmkv.set(PODCAST_STORAGE_KEY, value);
      return;
    } catch (error) {
      console.log('MMKV write error', error);
    }
  }

  await AsyncStorage.setItem(PODCAST_STORAGE_KEY, value);
};

export const setItem = async (
  value: PodcastDownloadRecord[],
): Promise<void> => {
  await persistPodcastData(JSON.stringify(value ?? []));
};

export const retrieveItem = async (): Promise<PodcastDownloadRecord[]> => {
  const mmkv = initializeMMKV();

  if (mmkv) {
    console.log('Retrieving podcast data from MMKV');
    return parsePodcastData(mmkv.getString(PODCAST_STORAGE_KEY));
  }
  console.log('Retrieving podcast data from AsyncStorage');
  const storedValue = await AsyncStorage.getItem(PODCAST_STORAGE_KEY);
  return parsePodcastData(storedValue);
};

export const deleteItem = async (): Promise<void> => {
  const mmkv = initializeMMKV();

  if (mmkv) {
    try {
      mmkv.delete(PODCAST_STORAGE_KEY);
      return;
    } catch (error) {
      console.log('MMKV delete error', error);
    }
  }

  await AsyncStorage.removeItem(PODCAST_STORAGE_KEY);
};

export const clearMMKV = async (): Promise<void> => {
  const mmkv = initializeMMKV();

  if (mmkv) {
    try {
      mmkv.clearAll();
      return;
    } catch (error) {
      console.log('MMKV clear error', error);
    }
  }

  await AsyncStorage.removeItem(PODCAST_STORAGE_KEY);
};

export const setReadingProgressItem = async (
  key: string,
  value: string,
): Promise<void> => {
  const mmkv = initializeReadingProgressMMKV();
  mmkv?.set(key, value);
};

export const getReadingProgressItem = async (
  key: string,
): Promise<string | null> => {
  const mmkv = initializeReadingProgressMMKV();
  return mmkv?.getString(key) ?? null;
};

export const deleteReadingProgressItem = async (key: string): Promise<void> => {
  const mmkv = initializeReadingProgressMMKV();
  mmkv?.delete(key);
};
