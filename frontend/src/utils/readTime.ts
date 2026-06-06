/**
 * Calculates estimated read time for an article
 * @param content - The article text content
 * @returns A string like "5 min read"
 */
export function getReadTime(content: string): string {
  if (!content || content.trim().length === 0) {
    return '1 min read';
  }
  
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return `${minutes} min read`;
}