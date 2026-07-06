import { resolveDeepLinkTarget } from '../../src/helper/DeepLinkService';
import * as ExpoLinking from 'expo-linking';

// Mock expo-linking just in case it relies on native modules during tests
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `ultimatehealth://${path.replace(/^\//, '')}`),
  parse: jest.fn((url: string) => {
    const urlObject = new URL(url);
    const path = urlObject.hostname + urlObject.pathname;
    return {
      path: path.startsWith('/') ? path.slice(1) : path,
      queryParams: {},
      scheme: urlObject.protocol.replace(':', ''),
      hostname: urlObject.hostname,
    };
  }),
}));

describe('DeepLinkService', () => {
  describe('resolveDeepLinkTarget', () => {
    it('should correctly resolve the create-post deep link', () => {
      // Mock the parse specifically for this test to match expo-linking output for ultimatehealth://create-post
      (ExpoLinking.parse as jest.Mock).mockReturnValueOnce({
        path: 'create-post',
        queryParams: {},
        scheme: 'ultimatehealth',
        hostname: '',
      });

      const url = 'ultimatehealth://create-post';
      const result = resolveDeepLinkTarget(url);

      expect(result).toEqual({
        name: 'ArticleDescriptionScreen',
        params: {
          article: undefined,
          htmlContent: undefined,
          translationSource: undefined,
        },
        requiresAuth: true,
      });
    });
  });
});
