import { getArticleDifficulty } from '../ReadingDifficulty';

describe('getArticleDifficulty', () => {
  it('returns null for undefined or null input', () => {
    expect(getArticleDifficulty(undefined)).toBeNull();
    expect(getArticleDifficulty(null)).toBeNull();
  });

  it('returns null if article content/body is missing or empty', () => {
    expect(getArticleDifficulty({})).toBeNull();
    expect(getArticleDifficulty({ content: '' })).toBeNull();
    expect(getArticleDifficulty({ body: '' })).toBeNull();
  });

  it('returns predefined difficulty when valid', () => {
    expect(getArticleDifficulty({ difficulty: 'Beginner' })).toBe('Beginner');
    expect(getArticleDifficulty({ difficulty: 'Intermediate' })).toBe('Intermediate');
    expect(getArticleDifficulty({ difficulty: 'Advanced' })).toBe('Advanced');
  });

  it('normalizes predefined difficulty casing and whitespace', () => {
    expect(getArticleDifficulty({ difficulty: '  beginner  ' })).toBe('Beginner');
    expect(getArticleDifficulty({ difficulty: 'INTERMEDIATE' })).toBe('Intermediate');
    expect(getArticleDifficulty({ difficulty: 'adVAnced' })).toBe('Advanced');
  });

  it('ignores invalid predefined difficulty and returns null if no content exists', () => {
    expect(getArticleDifficulty({ difficulty: 'Expert' })).toBeNull();
    expect(getArticleDifficulty({ difficulty: 'InvalidValue', content: '' })).toBeNull();
  });

  it('returns null if clean text is under 100 characters', () => {
    expect(getArticleDifficulty({ content: 'Short text under 100 characters.' })).toBeNull();
  });

  it('correctly strips HTML tags before calculating difficulty', () => {
    const item = {
      content: '<p>This is a paragraph with <b>bold</b> text and <i>italic</i> styling. It is meant to test the HTML cleaning process of the difficulty scorer. The ARI score should be calculated after stripping all the HTML tags properly.</p>',
    };
    expect(getArticleDifficulty(item)).not.toBeNull();
  });

  it('classifies as Beginner based on Automated Readability Index (ARI) score', () => {
    const item = {
      content: 'The cat sat on the mat. The dog ran in the park. The pig is big. The cow is red. The hen is fat. The fox is quick. The boy is happy. The girl is glad. The sky is blue. The grass is green.',
    };
    expect(getArticleDifficulty(item)).toBe('Beginner');
  });

  it('classifies as Intermediate based on Automated Readability Index (ARI) score', () => {
    const item = {
      content: 'Applying reading metrics requires using medium vocabulary and decent sentence pattern. The reader can easily follow the points without much brain effort. There are no huge words or confusing structures here today.',
    };
    expect(getArticleDifficulty(item)).toBe('Intermediate');
  });

  it('classifies as Advanced based on Automated Readability Index (ARI) score', () => {
    const item = {
      content: 'Applying intermediate readability calculations requires using longer vocabulary and structured sentence structure. The algorithm automatically determines the difficulty based on word and sentence length parameters. Writing clear sentences with some complexity helps achieve a moderate classification score.',
    };
    expect(getArticleDifficulty(item)).toBe('Advanced');
  });
});
