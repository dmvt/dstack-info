/**
 * Utility functions for parsing markdown content
 */

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

/**
 * Extract H2 and H3 headings from markdown content
 * @param markdown Raw markdown content
 * @returns Array of heading objects with level, text, and anchor ID
 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];

  // Split markdown into lines
  const lines = markdown.split('\n');

  for (const line of lines) {
    // Match H2 (##) or H3 (###) headers
    // Pattern: ^(#{2,3})\s+(.+)$
    const match = line.match(/^(#{2,3})\s+(.+)$/);

    if (match) {
      const level = match[1].length as 2 | 3;
      const text = match[2].trim();
      const id = generateAnchorId(text);

      headings.push({ level, text, id });
    }
  }

  return headings;
}

/**
 * Generate URL-friendly anchor ID from heading text
 * @param text Heading text
 * @returns Lowercase, hyphenated anchor ID
 */
export function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    // Remove special characters except spaces, hyphens, and alphanumeric
    .replace(/[^\w\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}
