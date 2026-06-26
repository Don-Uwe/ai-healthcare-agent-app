import {
  deleteReadingProgressItem,
  getReadingProgressItem,
  setReadingProgressItem,
} from '../helper/MMKVUtils';

const PROGRESS_KEY_PREFIX = 'reading_progress_';

export interface ReadingProgress {
  articleId: string;
  scrollPosition: number;
  updatedAt: number;
}

const getProgressKey = (articleId: string) =>
  `${PROGRESS_KEY_PREFIX}${articleId}`;

const isReadingProgress = (
  value: unknown,
  articleId: string,
): value is ReadingProgress => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const progress = value as Partial<ReadingProgress>;
  return (
    progress.articleId === articleId &&
    typeof progress.scrollPosition === 'number' &&
    Number.isFinite(progress.scrollPosition) &&
    progress.scrollPosition >= 0 &&
    progress.scrollPosition <= 100 &&
    typeof progress.updatedAt === 'number' &&
    Number.isFinite(progress.updatedAt) &&
    progress.updatedAt > 0
  );
};

export const saveProgress = async (
  articleId: string,
  percentage: number,
): Promise<void> => {
  const progress: ReadingProgress = {
    articleId,
    scrollPosition: Math.min(100, Math.max(0, percentage)),
    updatedAt: Date.now(),
  };

  await setReadingProgressItem(
    getProgressKey(articleId),
    JSON.stringify(progress),
  );
};

export const getProgress = async (
  articleId: string,
): Promise<ReadingProgress | null> => {
  const key = getProgressKey(articleId);
  const raw = await getReadingProgressItem(key);

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isReadingProgress(parsed, articleId)) {
      return parsed;
    }
  } catch {
    // Invalid persisted data is removed below.
  }

  await deleteReadingProgressItem(key).catch(() => undefined);
  return null;
};

export const clearProgress = async (articleId: string): Promise<void> => {
  await deleteReadingProgressItem(getProgressKey(articleId));
};
