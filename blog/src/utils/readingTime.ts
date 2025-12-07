/**
 * Reading time calculation utility
 * Calculates estimated reading time based on word count
 */

const WORDS_PER_MINUTE = 200; // Average reading speed

/**
 * Calculates the estimated reading time for given content
 * @param content - The text content (markdown/MDX content)
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(content: string): string {
  // Remove code blocks (they take longer to read/understand)
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, '');

  // Remove HTML tags
  const withoutHtml = withoutInlineCode.replace(/<[^>]*>/g, '');

  // Remove markdown syntax
  const withoutMarkdown = withoutHtml
    .replace(/#{1,6}\s/g, '')      // Headers
    .replace(/\*\*|__/g, '')       // Bold
    .replace(/\*|_/g, '')          // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
    .replace(/>\s/g, '')           // Blockquotes
    .replace(/-{3,}/g, '')         // Horizontal rules
    .replace(/\|/g, ' ');          // Table separators

  // Count words (split by whitespace, filter empty strings)
  const words = withoutMarkdown
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  const wordCount = words.length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return `${minutes} min read`;
}

/**
 * Calculates reading time and returns both minutes and formatted string
 * @param content - The text content
 * @returns Object with minutes and formatted string
 */
export function getReadingTimeDetails(content: string): {
  minutes: number;
  text: string;
  words: number;
} {
  // Remove code blocks
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, '');
  const withoutHtml = withoutInlineCode.replace(/<[^>]*>/g, '');

  const withoutMarkdown = withoutHtml
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/>\s/g, '')
    .replace(/-{3,}/g, '')
    .replace(/\|/g, ' ');

  const words = withoutMarkdown
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  const wordCount = words.length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return {
    minutes,
    text: `${minutes} min read`,
    words: wordCount,
  };
}
