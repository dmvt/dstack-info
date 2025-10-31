import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const TUTORIALS_DIR = path.join(process.cwd(), 'src/content/tutorials');

interface ParsedFrontmatter {
  title?: string;
  description?: string;
  section?: string;
  stepNumber?: number;
  totalSteps?: number;
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
        frontmatter[currentKey as keyof ParsedFrontmatter] = parseInt(value) as any;
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
      expect(frontmatter.stepNumber, `${file} missing stepNumber`).toBeGreaterThan(0);
      expect(frontmatter.totalSteps, `${file} missing totalSteps`).toBeGreaterThan(0);
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
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)!.push(frontmatter.stepNumber!);
    });

    sections.forEach((steps, section) => {
      const sorted = [...steps].sort((a, b) => a - b);
      expect(sorted[0], `${section} should start at step 1`).toBe(1);
    });
  });

  it('should have consistent totalSteps within sections', () => {
    const files = getTutorialFiles();
    const sectionTotals = new Map<string, number>();

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);
      const section = frontmatter.section!;
      if (sectionTotals.has(section)) {
        expect(frontmatter.totalSteps).toBe(sectionTotals.get(section));
      } else {
        sectionTotals.set(section, frontmatter.totalSteps!);
      }
    });
  });

  describe('install-rust tutorial', () => {
    it('should exist and have correct metadata', () => {
      const { frontmatter } = readTutorial('install-rust.md');

      expect(frontmatter.title).toBe('Install Rust Toolchain');
      expect(frontmatter.section).toBe('Getting Started');
      expect(frontmatter.stepNumber).toBe(2);
      expect(frontmatter.difficulty).toBe('beginner');
      expect(frontmatter.tags).toContain('rust');
      expect(frontmatter.tags).toContain('installation');
    });

    it('should have prerequisites', () => {
      const { frontmatter } = readTutorial('install-rust.md');

      expect(frontmatter.prerequisites).toBeDefined();
      expect(frontmatter.prerequisites!.length).toBeGreaterThan(0);
    });

    it('should have substantial body content', () => {
      const { content } = readTutorial('install-rust.md');
      const body = content.replace(/^---[\s\S]*?---/, '').trim();

      expect(body.length).toBeGreaterThan(100);
      expect(body).toContain('# Install Rust Toolchain');
    });
  });

  describe('setup-dev-environment tutorial', () => {
    it('should exist and have correct metadata', () => {
      const { frontmatter } = readTutorial('setup-dev-environment.md');

      expect(frontmatter.title).toBe('Setup Development Environment');
      expect(frontmatter.section).toBe('Getting Started');
      expect(frontmatter.stepNumber).toBe(3);
      expect(frontmatter.difficulty).toBe('beginner');
      expect(frontmatter.tags).toContain('development');
      expect(frontmatter.tags).toContain('ide');
    });

    it('should have estimated time', () => {
      const { frontmatter } = readTutorial('setup-dev-environment.md');

      expect(frontmatter.estimatedTime).toBeDefined();
      expect(frontmatter.estimatedTime).toMatch(/\d+\s*(minute|hour)/i);
    });
  });

  describe('deploy-first-app tutorial', () => {
    it('should exist and have correct metadata', () => {
      const { frontmatter } = readTutorial('deploy-first-app.md');

      expect(frontmatter.title).toBe('Deploy Your First Application');
      expect(frontmatter.section).toBe('Deployment');
      expect(frontmatter.stepNumber).toBe(1);
      expect(frontmatter.difficulty).toBe('intermediate');
      expect(frontmatter.tags).toContain('deployment');
      expect(frontmatter.tags).toContain('docker');
      expect(frontmatter.tags).toContain('tee');
    });

    it('should have all required fields', () => {
      const { frontmatter } = readTutorial('deploy-first-app.md');

      expect(frontmatter.prerequisites).toBeDefined();
      expect(frontmatter.estimatedTime).toBeDefined();
      expect(frontmatter.totalSteps).toBe(3);
    });
  });

  describe('sample-tutorial', () => {
    it('should exist as the first tutorial', () => {
      const { frontmatter } = readTutorial('sample-tutorial.md');

      expect(frontmatter.section).toBe('Getting Started');
      expect(frontmatter.stepNumber).toBe(1);
    });
  });

  it('should have all tutorials with lastUpdated dates', () => {
    const files = getTutorialFiles();
    const today = '2025-10-31';

    files.forEach(file => {
      const { frontmatter } = readTutorial(file);
      expect(frontmatter.lastUpdated).toBe(today);
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
