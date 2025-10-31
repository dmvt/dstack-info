import { describe, it, expect } from 'vitest';
import type { TutorialFrontmatter, Tutorial } from '../types/tutorial';

describe('Tutorial Types', () => {
  it('should validate TutorialFrontmatter with all required fields', () => {
    const validFrontmatter: TutorialFrontmatter = {
      title: 'Test Tutorial',
      description: 'Test description',
      section: 'Getting Started',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: new Date('2025-10-31'),
    };

    expect(validFrontmatter.title).toBe('Test Tutorial');
    expect(validFrontmatter.stepNumber).toBe(1);
    expect(validFrontmatter.totalSteps).toBe(5);
  });

  it('should allow optional prerequisites field', () => {
    const frontmatter: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: new Date(),
      prerequisites: ['Ubuntu 22.04', 'Root access'],
    };

    expect(frontmatter.prerequisites).toBeDefined();
    expect(Array.isArray(frontmatter.prerequisites)).toBe(true);
    expect(frontmatter.prerequisites?.length).toBe(2);
  });

  it('should allow optional tags field', () => {
    const frontmatter: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: new Date(),
      tags: ['basics', 'installation'],
    };

    expect(frontmatter.tags).toBeDefined();
    expect(Array.isArray(frontmatter.tags)).toBe(true);
  });

  it('should allow optional difficulty field with valid enum values', () => {
    const beginner: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: new Date(),
      difficulty: 'beginner',
    };

    const intermediate: TutorialFrontmatter = {
      ...beginner,
      difficulty: 'intermediate',
    };

    const advanced: TutorialFrontmatter = {
      ...beginner,
      difficulty: 'advanced',
    };

    expect(beginner.difficulty).toBe('beginner');
    expect(intermediate.difficulty).toBe('intermediate');
    expect(advanced.difficulty).toBe('advanced');
  });

  it('should allow optional estimatedTime field', () => {
    const frontmatter: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: new Date(),
      estimatedTime: '15 minutes',
    };

    expect(frontmatter.estimatedTime).toBe('15 minutes');
  });

  it('should validate Tutorial interface with slug and data', () => {
    const tutorial: Tutorial = {
      slug: 'test-tutorial',
      data: {
        title: 'Test Tutorial',
        description: 'Test description',
        section: 'Getting Started',
        stepNumber: 1,
        totalSteps: 5,
        lastUpdated: new Date('2025-10-31'),
      },
      body: '# Test Content\n\nThis is a test.',
    };

    expect(tutorial.slug).toBe('test-tutorial');
    expect(tutorial.data.title).toBe('Test Tutorial');
    expect(tutorial.body).toContain('# Test Content');
  });

  it('should validate stepNumber is within valid range', () => {
    const frontmatter: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 3,
      totalSteps: 5,
      lastUpdated: new Date(),
    };

    expect(frontmatter.stepNumber).toBeGreaterThan(0);
    expect(frontmatter.stepNumber).toBeLessThanOrEqual(frontmatter.totalSteps);
  });

  it('should handle Date object for lastUpdated', () => {
    const testDate = new Date('2025-10-31');
    const frontmatter: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: testDate,
    };

    expect(frontmatter.lastUpdated).toBeInstanceOf(Date);
    expect(frontmatter.lastUpdated.getFullYear()).toBe(2025);
  });

  it('should allow empty prerequisites array', () => {
    const frontmatter: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: new Date(),
      prerequisites: [],
    };

    expect(Array.isArray(frontmatter.prerequisites)).toBe(true);
    expect(frontmatter.prerequisites.length).toBe(0);
  });

  it('should allow empty tags array', () => {
    const frontmatter: TutorialFrontmatter = {
      title: 'Test',
      description: 'Test',
      section: 'Test',
      stepNumber: 1,
      totalSteps: 5,
      lastUpdated: new Date(),
      tags: [],
    };

    expect(Array.isArray(frontmatter.tags)).toBe(true);
    expect(frontmatter.tags.length).toBe(0);
  });

  it('should validate tutorial with all optional fields', () => {
    const completeFrontmatter: TutorialFrontmatter = {
      title: 'Complete Tutorial',
      description: 'A complete tutorial with all fields',
      section: 'Advanced',
      stepNumber: 2,
      totalSteps: 10,
      lastUpdated: new Date('2025-10-31'),
      prerequisites: ['Prerequisite 1', 'Prerequisite 2'],
      tags: ['tag1', 'tag2', 'tag3'],
      difficulty: 'advanced',
      estimatedTime: '30 minutes',
    };

    expect(completeFrontmatter.title).toBe('Complete Tutorial');
    expect(completeFrontmatter.prerequisites?.length).toBe(2);
    expect(completeFrontmatter.tags?.length).toBe(3);
    expect(completeFrontmatter.difficulty).toBe('advanced');
    expect(completeFrontmatter.estimatedTime).toBe('30 minutes');
  });

  it('should validate slug format in Tutorial', () => {
    const tutorial: Tutorial = {
      slug: 'sample-tutorial',
      data: {
        title: 'Sample',
        description: 'Sample',
        section: 'Sample',
        stepNumber: 1,
        totalSteps: 1,
        lastUpdated: new Date(),
      },
      body: 'Content',
    };

    // Slug should be lowercase with hyphens
    expect(tutorial.slug).toMatch(/^[a-z0-9-]+$/);
  });
});
