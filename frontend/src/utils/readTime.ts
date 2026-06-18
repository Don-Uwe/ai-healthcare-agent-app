/**
 * Strips HTML tags and calculates estimated read time
 * @param content - Raw HTML or plain text article content
 * @returns A string like "5 min read"
 */
export function getReadTime(content: string): string {
  if (!content || content.trim().length === 0) {
    return '1 min read';
  }

  // Strip HTML tags, images, and metadata
  const plainText = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordsPerMinute = 200; // Average reading speed
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return `${minutes} min read`;
}

/**
 * Calculates estimated read time in minutes
 * @param content - Plain text article content
 * @returns Estimated read time in minutes
 */
export function calculateReadTime(content: string): number {
  if (!content || content.trim().length === 0) {
    return 1; // Default to 1 minute for empty content
  }

  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
}