import { generateArticleSummary } from '../services/SummaryService';

global.fetch = jest.fn();

describe('generateArticleSummary', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when fetch throws a network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const result = await generateArticleSummary('Some article text here for testing purposes');
    expect(result).toBeNull();
  });

  it('returns null when API returns non-OK status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    });
    const result = await generateArticleSummary('Article content here');
    expect(result).toBeNull();
  });

  it('returns null when response JSON is malformed', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'NOT VALID JSON' }] } }],
      }),
    });
    const result = await generateArticleSummary('Article content here');
    expect(result).toBeNull();
  });

});
