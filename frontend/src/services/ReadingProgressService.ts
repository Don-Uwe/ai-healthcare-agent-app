// filepath: frontend/src/services/ReadingProgressService.ts
import { MMKVUtils } from "../helper/MMKVUtils";

const PROGRESS_KEY_PREFIX = "reading_progress_";

interface ReadingProgress {
  articleId: string;
  scrollPosition: number; // 0-100 percentage
  updatedAt: number;
}

export const saveProgress = async (articleId: string, percentage: number): Promise<void> => {
  const key = `${PROGRESS_KEY_PREFIX}${articleId}`;
  await MMKVUtils.setItem(key, JSON.stringify({
    articleId,
    scrollPosition: percentage,
    updatedAt: Date.now(),
  }));
};

export const getProgress = async (articleId: string): Promise<ReadingProgress | null> => {
  const key = `${PROGRESS_KEY_PREFIX}${articleId}`;
  const raw = await MMKVUtils.getItem(key);
  return raw ? JSON.parse(raw) : null;
};

export const clearProgress = async (articleId: string): Promise<void> => {
  const key = `${PROGRESS_KEY_PREFIX}${articleId}`;
  await MMKVUtils.removeItem(key);
};