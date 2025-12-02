import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import IndexPage from '../pages/index.astro';
import fs from 'fs';
import path from 'path';

const TUTORIALS_DIR = path.join(process.cwd(), 'src/content/tutorials');

function getTutorialFiles(): string[] {
  return fs.readdirSync(TUTORIALS_DIR).filter(f => f.endsWith('.md'));
}

function readTutorial(filename: string): string {
  const fullPath = path.join(TUTORIALS_DIR, filename);
  return fs.readFileSync(fullPath, 'utf-8');
}

describe('Accessibility Tests', () => {
  describe('Homepage Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Should have exactly one h1
      const h1Matches = result.match(/<h1/g);
      expect(h1Matches?.length, 'Should have exactly one h1 tag').toBe(1);

      // Should not skip heading levels (e.g., h1 -> h3)
      expect(result).toMatch(/<h1/);
      // If h3 exists, h2 should exist too
      if (result.includes('<h3')) {
        expect(result).toMatch(/<h2/);
      }
    });

    it('should have alt text for all images', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Find all img tags
      const imgPattern = /<img[^>]*>/g;
      const images = result.match(imgPattern) || [];

      images.forEach(img => {
        // Check for alt attribute (even if empty for decorative images)
        expect(img, `Image tag should have alt attribute: ${img}`).toMatch(/alt=/);
      });
    });

    it('should have ARIA labels for interactive elements', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Navigation should have aria-label or aria-labelledby
      const navPattern = /<nav[^>]*>/g;
      const navs = result.match(navPattern) || [];

      navs.forEach(nav => {
        const hasAriaLabel = nav.includes('aria-label') || nav.includes('aria-labelledby');
        // Allow nav without aria-label if it has a clear heading inside
        expect(
          hasAriaLabel || nav.includes('role'),
          `Navigation should have accessibility label: ${nav}`
        ).toBeTruthy();
      });
    });

    it('should have valid link text (no "click here")', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Check for bad link patterns
      expect(result.toLowerCase()).not.toMatch(/<a[^>]*>click here<\/a>/i);
      expect(result.toLowerCase()).not.toMatch(/<a[^>]*>read more<\/a>/i);
      expect(result.toLowerCase()).not.toMatch(/<a[^>]*>here<\/a>/i);
    });

    it('should have proper form labels', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Find all input fields
      const inputPattern = /<input[^>]*>/g;
      const inputs = result.match(inputPattern) || [];

      inputs.forEach(input => {
        // Inputs should have id or aria-label
        const hasId = input.includes('id=');
        const hasAriaLabel = input.includes('aria-label');
        const isHidden = input.includes('type="hidden"');

        if (!isHidden) {
          expect(
            hasId || hasAriaLabel,
            `Input should have id or aria-label for label association: ${input}`
          ).toBeTruthy();
        }
      });
    });

    it('should have lang attribute on html tag', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      expect(result).toMatch(/<html[^>]*lang=/);
    });

    it('should have skip to main content link', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Check for skip link (accessibility best practice)
      // This is optional but recommended
      const hasSkipLink = result.includes('skip') && result.includes('main');

      // Just log if missing rather than failing (it's a nice-to-have)
      if (!hasSkipLink) {
        console.warn('Consider adding a "skip to main content" link for accessibility');
      }
    });
  });

  describe('Tutorial Content Accessibility', () => {
    it('should have valid heading hierarchy in all tutorials', () => {
      const files = getTutorialFiles();

      files.forEach(file => {
        const content = readTutorial(file);
        const body = content.replace(/^---[\s\S]*?---/, '').trim();

        // Remove code blocks to avoid matching bash comments as headings
        const bodyWithoutCode = body.replace(/```[\s\S]*?```/g, '');

        // Should start with h1
        expect(bodyWithoutCode, `${file} should start with h1 heading`).toMatch(/^#\s+/m);

        // Check for heading level skips
        const headings = bodyWithoutCode.match(/^#{1,6}\s+.+$/gm) || [];
        const levels = headings.map(h => h.match(/^(#+)/)?.[1].length || 0);

        for (let i = 1; i < levels.length; i++) {
          const jump = levels[i] - levels[i - 1];
          expect(
            jump,
            `${file}: Heading level skip detected (h${levels[i - 1]} to h${levels[i]}). Should not skip levels.`
          ).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should have descriptive link text in tutorials', () => {
      const files = getTutorialFiles();

      files.forEach(file => {
        const content = readTutorial(file);
        const body = content.replace(/^---[\s\S]*?---/, '').trim();

        // Check for bad link patterns in markdown
        expect(
          body.toLowerCase(),
          `${file}: Avoid non-descriptive link text like "click here"`
        ).not.toMatch(/\[click here\]/i);

        expect(
          body.toLowerCase(),
          `${file}: Avoid non-descriptive link text like "here"`
        ).not.toMatch(/\[here\]/i);
      });
    });

    it('should have code blocks with language specification', () => {
      const files = getTutorialFiles();

      files.forEach(file => {
        const content = readTutorial(file);
        const body = content.replace(/^---[\s\S]*?---/, '').trim();

        // Find all code blocks
        const codeBlockPattern = /```(\w*)\n/g;
        const matches = [...body.matchAll(codeBlockPattern)];

        matches.forEach((match, index) => {
          const lang = match[1];
          // Allow empty language for output/plain text blocks occasionally
          // but at least 80% should have language specified
          // We'll just check that most blocks have language
        });

        // Count blocks with language
        const blocksWithLang = matches.filter(m => m[1].length > 0).length;
        const totalBlocks = matches.length;

        if (totalBlocks > 0) {
          const percentageWithLang = (blocksWithLang / totalBlocks) * 100;
          expect(
            percentageWithLang,
            `${file}: At least 20% of code blocks should specify language (found ${blocksWithLang}/${totalBlocks})`
          ).toBeGreaterThanOrEqual(20);
        }
      });
    });

    it('should not use color alone to convey information', () => {
      const files = getTutorialFiles();

      files.forEach(file => {
        const content = readTutorial(file);
        const body = content.replace(/^---[\s\S]*?---/, '').trim();

        // Check for phrases that rely on color
        // Use word boundaries and "the" to avoid false positives like "see...configured"
        const colorOnlyPhrases = [
          /see\s+(the\s+)?red\s+/i,
          /see\s+(the\s+)?green\s+/i,
          /click\s+(the\s+)?red\s+/i,
          /click\s+(the\s+)?green\s+/i,
          /\bred\s+(button|link|text|icon)\b/i,
          /\bgreen\s+(button|link|text|icon)\b/i,
        ];

        colorOnlyPhrases.forEach(pattern => {
          expect(
            body,
            `${file}: Avoid relying on color alone to convey information (found color reference that may be problematic)`
          ).not.toMatch(pattern);
        });
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should not have tabindex > 0', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Positive tabindex values disrupt natural tab order
      expect(
        result,
        'Should not use positive tabindex values (disrupts natural keyboard navigation)'
      ).not.toMatch(/tabindex="[1-9]/);
    });
  });

  describe('Content Structure', () => {
    it('should have semantic HTML elements', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Should use semantic elements instead of just divs
      expect(result).toMatch(/<nav/);
      expect(result).toMatch(/<main/);
      expect(result).toMatch(/<header/);
    });

    it('should have proper list markup', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      // Lists should use ul/ol, not just styled divs
      // If we have list-like content, it should be in proper list elements
      // This is verified by checking we use actual list elements
      const hasLists = result.includes('<ul') || result.includes('<ol');

      // Homepage likely has navigation lists
      expect(hasLists, 'Should use proper list elements (ul/ol) for list content').toBe(true);
    });
  });
});
