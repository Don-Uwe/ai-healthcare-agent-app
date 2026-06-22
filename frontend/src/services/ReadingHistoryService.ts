import {createMMKV} from 'react-native-mmkv';
import type {MMKV} from 'react-native-mmkv';

let _storage: MMKV | null = null;
let _initialized = false;

function getStorage(): MMKV | null {
  if (_initialized) return _storage;
  _initialized = true;
  try {
    _storage = createMMKV({id: 'reading-history-storage'});
  } catch {
    _storage = null;
  }
  return _storage;
}

const HISTORY_KEY = 'reading_history';
const MAX_HISTORY = 50;
const DEBOUNCE_MS = 60_000; // 60 seconds

export type ReadingHistoryItem = {
  articleId: string;
  title: string;
  authorName: string;
  category: string; // first tag name, or '' if none
  coverImage: string;
  viewedAt: number; // Date.now()
};

/**
 * Load the history array from MMKV.
 * Returns [] on missing key, MMKV unavailable, or corrupted JSON.
 */
export function getReadingHistory(): ReadingHistoryItem[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getString(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ReadingHistoryItem[];
  } catch {
    // Corrupted data — wipe and start fresh
    try { getStorage()?.remove(HISTORY_KEY); } catch {}
    return [];
  }
}

/**
 * Persist history array to MMKV.
 */
function saveHistory(history: ReadingHistoryItem[]): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.set(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage write failure — silent; don't crash the article view
  }
}

/**
 * Record an article view.
 *
 * Rules:
 *  - If same article viewed within last 60 s → skip (debounce).
 *  - If already in history → lift to index 0, refresh timestamp.
 *  - New entry → prepend, trim to MAX_HISTORY.
 */
export function recordArticleView(
  item: Omit<ReadingHistoryItem, 'viewedAt'>,
): void {
  try {
    const now = Date.now();
    const history = getReadingHistory();

    const existingIndex = history.findIndex(
      h => h.articleId === item.articleId,
    );

    if (existingIndex !== -1) {
      const existing = history[existingIndex];
      // Debounce: same article opened again within 60 s → skip
      if (now - existing.viewedAt < DEBOUNCE_MS) return;
      // Lift to top with fresh timestamp
      history.splice(existingIndex, 1);
      history.unshift({...item, viewedAt: now});
    } else {
      history.unshift({...item, viewedAt: now});
    }

    // Cap at 50
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    saveHistory(history);
  } catch {
    // Never crash an article screen due to history logic
  }
}

/**
 * Wipe all reading history.
 */
export function clearReadingHistory(): void {
  try {
    getStorage()?.remove(HISTORY_KEY)
  } catch {}
}