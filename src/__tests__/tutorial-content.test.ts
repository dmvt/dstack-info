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
        // Ensure tags is an array
        expect(Array.isArray(frontmatter.tags), `${file}: tags should be an array, got ${typeof frontmatter.tags}: ${JSON.stringify(frontmatter.tags)}`).toBe(true);
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

  it('should have valid internal tutorial links', () => {
    const files = getTutorialFiles();
    const tutorialSlugs = files.map(f => f.replace('.md', ''));

    files.forEach(file => {
      const { content } = readTutorial(file);
      const body = content.replace(/^---[\s\S]*?---/, '').trim();

      // Find all markdown links [text](/tutorial/slug)
      const linkPattern = /\[([^\]]+)\]\(\/tutorial\/([a-z0-9-]+)\)/g;
      let match;

      while ((match = linkPattern.exec(body)) !== null) {
        const linkText = match[1];
        const linkedSlug = match[2];

        expect(
          tutorialSlugs,
          `${file}: Link "${linkText}" points to non-existent tutorial "${linkedSlug}"`
        ).toContain(linkedSlug);
      }
    });
  });

  it('should have valid prerequisite references', () => {
    const files = getTutorialFiles();
    const tutorialSlugs = files.map(f => f.replace('.md', ''));
    const tutorialsBySlug = new Map<string, ParsedFrontmatter>();

    // Build map of all tutorials
    files.forEach(file => {
      const slug = file.replace('.md', '');
      const { frontmatter } = readTutorial(file);
      tutorialsBySlug.set(slug, frontmatter);
    });

    files.forEach(file => {
      const slug = file.replace('.md', '');
      const { frontmatter } = readTutorial(file);

      if (frontmatter.prerequisites && frontmatter.prerequisites.length > 0) {
        frontmatter.prerequisites.forEach(prereqSlug => {
          // Check prerequisite exists
          expect(
            tutorialSlugs,
            `${file}: Prerequisite "${prereqSlug}" does not exist`
          ).toContain(prereqSlug);

          // Check for circular dependencies (tutorial can't require itself)
          expect(
            prereqSlug,
            `${file}: Tutorial cannot be its own prerequisite`
          ).not.toBe(slug);
        });
      }
    });
  });

  it('should not have circular prerequisite dependencies', () => {
    const files = getTutorialFiles();
    const graph = new Map<string, string[]>();

    // Build dependency graph
    files.forEach(file => {
      const slug = file.replace('.md', '');
      const { frontmatter } = readTutorial(file);
      graph.set(slug, frontmatter.prerequisites || []);
    });

    // Check for cycles using DFS
    function hasCycle(node: string, visited = new Set<string>(), stack = new Set<string>()): boolean {
      if (stack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      stack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (graph.has(neighbor) && hasCycle(neighbor, visited, stack)) {
          return true;
        }
      }

      stack.delete(node);
      return false;
    }

    graph.forEach((_, slug) => {
      expect(
        hasCycle(slug),
        `Circular dependency detected involving tutorial "${slug}"`
      ).toBe(false);
    });
  });

  it('should have valid prerequisite ordering within sections', () => {
    const files = getTutorialFiles();
    const tutorialsBySlug = new Map<string, ParsedFrontmatter>();

    files.forEach(file => {
      const slug = file.replace('.md', '');
      const { frontmatter } = readTutorial(file);
      tutorialsBySlug.set(slug, frontmatter);
    });

    files.forEach(file => {
      const slug = file.replace('.md', '');
      const { frontmatter } = readTutorial(file);

      if (frontmatter.prerequisites && frontmatter.stepNumber) {
        frontmatter.prerequisites.forEach(prereqSlug => {
          const prereq = tutorialsBySlug.get(prereqSlug);

          if (prereq && prereq.section === frontmatter.section && prereq.stepNumber) {
            // Prerequisites in the same section should have lower step numbers
            expect(
              prereq.stepNumber,
              `${file}: Prerequisite "${prereqSlug}" (step ${prereq.stepNumber}) should come before step ${frontmatter.stepNumber}`
            ).toBeLessThan(frontmatter.stepNumber);
          }
        });
      }
    });
  });
});
