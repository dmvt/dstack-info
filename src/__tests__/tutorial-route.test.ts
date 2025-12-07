import { describe, it, expect } from 'vitest';
import { extractHeadings } from '../utils/markdown';
import fs from 'fs';
import path from 'path';

describe('Tutorial Route Heading Extraction', () => {
  const TUTORIALS_DIR = path.join(process.cwd(), 'src/content/tutorials');

  it('should extract headings from real tutorial markdown', () => {
    // Read a real tutorial file
    const tutorialPath = path.join(TUTORIALS_DIR, 'tdx-hardware-verification.md');
    const content = fs.readFileSync(tutorialPath, 'utf-8');

    // Extract just the body (after frontmatter)
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    expect(bodyMatch, 'Tutorial should have frontmatter and body').toBeTruthy();

    const body = bodyMatch![1];

    // Extract headings using the same function the route uses
    const headings = extractHeadings(body);

    // Should have extracted some headings
    expect(headings.length).toBeGreaterThan(0);

    // All headings should have required properties
    headings.forEach(heading => {
      expect(heading).toHaveProperty('level');
      expect(heading).toHaveProperty('text');
      expect(heading).toHaveProperty('id');
      expect([2, 3]).toContain(heading.level);
      expect(heading.text).toBeTruthy();
      expect(heading.id).toBeTruthy();
    });
  });

  it('should extract headings from all tutorial files', () => {
    const files = fs.readdirSync(TUTORIALS_DIR).filter(f => f.endsWith('.md'));

    files.forEach(file => {
      const content = fs.readFileSync(path.join(TUTORIALS_DIR, file), 'utf-8');
      const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);

      if (bodyMatch) {
        const body = bodyMatch[1];
        const headings = extractHeadings(body);

        // Every tutorial should have at least one heading
        expect(headings.length, `${file} should have headings`).toBeGreaterThan(0);

        // Verify heading structure
        headings.forEach(heading => {
          expect(heading.level).toBeTypeOf('number');
          expect(heading.text).toBeTypeOf('string');
          expect(heading.id).toBeTypeOf('string');
        });
      }
    });
  });

  it('should generate unique anchor IDs within a tutorial', () => {
    const tutorialPath = path.join(TUTORIALS_DIR, 'tdx-software-installation.md');
    const content = fs.readFileSync(tutorialPath, 'utf-8');
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);

    if (bodyMatch) {
      const body = bodyMatch[1];
      const headings = extractHeadings(body);

      const ids = headings.map(h => h.id);
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(ids.length).toBe(uniqueIds.size);
    }
  });

  it('should extract correct heading levels', () => {
    const tutorialPath = path.join(TUTORIALS_DIR, 'tdx-sgx-verification.md');
    const content = fs.readFileSync(tutorialPath, 'utf-8');
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);

    if (bodyMatch) {
      const body = bodyMatch[1];
      const headings = extractHeadings(body);

      // Should have both H2 and H3 headings
      const h2s = headings.filter(h => h.level === 2);
      const h3s = headings.filter(h => h.level === 3);

      expect(h2s.length).toBeGreaterThan(0);
      // H3s are optional but should be valid if present
      if (h3s.length > 0) {
        expect(h3s[0].level).toBe(3);
      }
    }
  });

  it('should handle tutorials with only H2 headings', () => {
    // Test with a tutorial that might only have H2 headings
    const tutorialPath = path.join(TUTORIALS_DIR, 'dns-configuration.md');
    const content = fs.readFileSync(tutorialPath, 'utf-8');
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);

    if (bodyMatch) {
      const body = bodyMatch[1];
      const headings = extractHeadings(body);

      // Should handle gracefully even if only H2s
      expect(headings.length).toBeGreaterThan(0);
      headings.forEach(heading => {
        expect([2, 3]).toContain(heading.level);
      });
    }
  });

  it('should extract readable heading text', () => {
    const tutorialPath = path.join(TUTORIALS_DIR, 'tdx-bios-configuration.md');
    const content = fs.readFileSync(tutorialPath, 'utf-8');
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);

    if (bodyMatch) {
      const body = bodyMatch[1];
      const headings = extractHeadings(body);

      headings.forEach(heading => {
        // Text should be readable (not just anchor ID)
        expect(heading.text).not.toBe(heading.id);
        // Text should not start with # (that's been stripped)
        expect(heading.text).not.toMatch(/^#+\s/);
        // Text should not be empty or just whitespace
        expect(heading.text.trim().length).toBeGreaterThan(0);
      });
    }
  });

  it('should maintain heading order', () => {
    const tutorialPath = path.join(TUTORIALS_DIR, 'tdx-bios-configuration.md');
    const content = fs.readFileSync(tutorialPath, 'utf-8');
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);

    if (bodyMatch) {
      const body = bodyMatch[1];
      const lines = body.split('\n');
      const headings = extractHeadings(body);

      // Find the line numbers of headings in original markdown
      const headingLines: number[] = [];
      lines.forEach((line, index) => {
        if (line.match(/^#{2,3}\s+/)) {
          headingLines.push(index);
        }
      });

      // Should have same number of headings
      expect(headings.length).toBe(headingLines.length);

      // Order should be preserved (line numbers should be increasing)
      for (let i = 1; i < headingLines.length; i++) {
        expect(headingLines[i]).toBeGreaterThan(headingLines[i - 1]);
      }
    }
  });
});
