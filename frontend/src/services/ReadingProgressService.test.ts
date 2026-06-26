import {
  deleteReadingProgressItem,
  getReadingProgressItem,
  setReadingProgressItem,
} from '../helper/MMKVUtils';
import {
  clearProgress,
  getProgress,
  saveProgress,
} from './ReadingProgressService';

jest.mock('../helper/MMKVUtils', () => ({
  deleteReadingProgressItem: jest.fn(),
  getReadingProgressItem: jest.fn(),
  setReadingProgressItem: jest.fn(),
}));

const mockedGetReadingProgressItem =
  getReadingProgressItem as jest.MockedFunction<typeof getReadingProgressItem>;
const mockedSetReadingProgressItem =
  setReadingProgressItem as jest.MockedFunction<typeof setReadingProgressItem>;
const mockedDeleteReadingProgressItem =
  deleteReadingProgressItem as jest.MockedFunction<
    typeof deleteReadingProgressItem
  >;

describe('ReadingProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDeleteReadingProgressItem.mockResolvedValue();
    mockedSetReadingProgressItem.mockResolvedValue();
  });

  it('returns valid progress for the requested article', async () => {
    mockedGetReadingProgressItem.mockResolvedValue(
      JSON.stringify({
        articleId: 'article-1',
        scrollPosition: 42,
        updatedAt: 123456,
      }),
    );

    await expect(getProgress('article-1')).resolves.toEqual({
      articleId: 'article-1',
      scrollPosition: 42,
      updatedAt: 123456,
    });
  });

  it('removes malformed JSON and returns null', async () => {
    mockedGetReadingProgressItem.mockResolvedValue('{broken');

    await expect(getProgress('article-1')).resolves.toBeNull();
    expect(mockedDeleteReadingProgressItem).toHaveBeenCalledWith(
      'reading_progress_article-1',
    );
  });

  it('rejects progress saved for another article', async () => {
    mockedGetReadingProgressItem.mockResolvedValue(
      JSON.stringify({
        articleId: 'article-2',
        scrollPosition: 42,
        updatedAt: 123456,
      }),
    );

    await expect(getProgress('article-1')).resolves.toBeNull();
    expect(mockedDeleteReadingProgressItem).toHaveBeenCalledWith(
      'reading_progress_article-1',
    );
  });

  it('clamps saved progress to the supported range', async () => {
    await saveProgress('article-1', 150);

    const [, serialized] = mockedSetReadingProgressItem.mock.calls[0];
    expect(JSON.parse(serialized)).toMatchObject({
      articleId: 'article-1',
      scrollPosition: 100,
    });
  });

  it('clears the requested article progress', async () => {
    await clearProgress('article-1');

    expect(mockedDeleteReadingProgressItem).toHaveBeenCalledWith(
      'reading_progress_article-1',
    );
  });
});
