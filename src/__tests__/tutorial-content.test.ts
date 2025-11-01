import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const TUTORIALS_DIR = path.join(process.cwd(), 'src/content/tutorials');

interface ParsedFrontmatter {
  title?: string;
  description?: string;
  section?: string;
  stepNumber?: number | null;
  totalSteps?: number | null;
  isAppendix?: boolean;
  lastUpdated?: string;
  prerequisites?: string[];
  tags?: string[];
  difficulty?: string;
  estimatedTime?: string;
}

function parseFrontmatter(content: string): ParsedFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter: ParsedFrontmatter = {};
  const lines = match[1].split('\n');
  let currentArray: string[] | null = null;
  let currentKey: string | null = null;

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();

      if (value === '') {
        // Array field
        currentArray = [];
        frontmatter[currentKey as keyof ParsedFrontmatter] = currentArray as any;
      } else if (key === 'stepNumber' || key === 'totalSteps') {
        // Handle null values for appendices
        frontmatter[currentKey as keyof ParsedFrontmatter] = (value === 'null' ? null : parseInt(value)) as any;
      } else if (key === 'isAppendix') {
        frontmatter.isAppendix = value === 'true';
      } else {
        frontmatter[currentKey as keyof ParsedFrontmatter] = value.replace(/^["']|["']$/g, '') as any;
        currentArray = null;
      }
    } else if (currentArray && line.trim().startsWith('-')) {
      currentArray.push(line.trim().substring(1).trim().replace(/^["']|["']$/g, ''));
    }
  }

  return frontmatter;
}

function getTutorialFiles(): string[] {
  return fs.readdirSync(TUTORIALS_DIR).filter(f => f.endsWith('.md'));
}

function readTutorial(filename: string): { frontmatter: ParsedFrontmatter; content: string } {
  const fullPath = path.join(TUTORIALS_DIR, filename);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const frontmatter = parseFrontmatter(content);
  return { frontmatter, content };
}

describe('Tutorial Content Validation', () => {
  it('should have at least 4 tutorial files', () => {
    const files = getTutorialFiles();
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  it('should have valid frontmatter for all tutorials', () => {
    const files = getTutorialFiles();

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);
      expect(frontmatter.title, `${file} missing title`).toBeTruthy();
      expect(frontmatter.description, `${file} missing description`).toBeTruthy();
      expect(frontmatter.section, `${file} missing section`).toBeTruthy();

      // Appendices can have null stepNumber/totalSteps
      const isAppendix = frontmatter.isAppendix || frontmatter.stepNumber === null;
      if (!isAppendix) {
        expect(frontmatter.stepNumber, `${file} missing stepNumber`).toBeGreaterThan(0);
        expect(frontmatter.totalSteps, `${file} missing totalSteps`).toBeGreaterThan(0);
      }

      expect(frontmatter.lastUpdated, `${file} missing lastUpdated`).toBeTruthy();
      expect(frontmatter.difficulty, `${file} missing difficulty`).toMatch(/beginner|intermediate|advanced/);
    });
  });

  it('should have proper step numbering within sections', () => {
    const files = getTutorialFiles();
    const sections = new Map<string, number[]>();

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);
      const section = frontmatter.section!;

      // Only check numbered tutorials (skip appendices)
      if (frontmatter.stepNumber !== null && frontmatter.stepNumber !== undefined) {
        if (!sections.has(section)) {
          sections.set(section, []);
        }
        sections.get(section)!.push(frontmatter.stepNumber);
      }
    });

    sections.forEach((steps, section) => {
      const sorted = [...steps].sort((a, b) => a - b);
      expect(sorted[0], `${section} should start at step 1`).toBe(1);
    });
  });

  it('should have consistent totalSteps within sections', () => {
    const files = getTutorialFiles();
    const sectionTotals = new Map<string, number | null>();

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);
      const section = frontmatter.section!;

      // Only check numbered tutorials (skip appendices)
      if (frontmatter.totalSteps !== null && frontmatter.totalSteps !== undefined) {
        if (sectionTotals.has(section)) {
          expect(frontmatter.totalSteps).toBe(sectionTotals.get(section));
        } else {
          sectionTotals.set(section, frontmatter.totalSteps);
        }
      }
    });
  });


  it('should have all tutorials with lastUpdated dates', () => {
    const files = getTutorialFiles();

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);

      // Check that lastUpdated exists and is a valid date format
      expect(frontmatter.lastUpdated, `${file} missing lastUpdated`).toBeTruthy();
      expect(frontmatter.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('should have valid tag formats', () => {
    const files = getTutorialFiles();

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);
      if (frontmatter.tags) {
        frontmatter.tags.forEach(tag => {
          expect(tag).toMatch(/^[a-z0-9-]+$/);
        });
      }
    });
  });

  it('should have descriptions under 200 characters', () => {
    const files = getTutorialFiles();

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);
      expect(frontmatter.description!.length).toBeLessThanOrEqual(200);
    });
  });

  it('should have meaningful content sections', () => {
    const files = getTutorialFiles();

    files.forEach(file => {
      const { content } = readTutorial(file);
      const body = content.replace(/^---[\s\S]*?---/, '').trim();

      // Should have headings
      expect(body).toMatch(/^#+ /m);
      // Should have code blocks or commands
      expect(body.match(/```/g)?.length || 0).toBeGreaterThan(0);
    });
  });
});
