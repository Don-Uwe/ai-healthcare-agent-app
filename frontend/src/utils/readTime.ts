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

  const wordsPerMinute = 200;
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return `${minutes} min read`;
}