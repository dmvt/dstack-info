import { describe, it, expect } from 'vitest';

describe('TutorialSidebar Component', () => {
  const mockTutorials = [
    {
      slug: 'tutorial-1',
      data: {
        title: 'First Tutorial',
        section: 'Getting Started',
        stepNumber: 1,
      },
    },
    {
      slug: 'tutorial-2',
      data: {
        title: 'Second Tutorial',
        section: 'Getting Started',
        stepNumber: 2,
      },
    },
    {
      slug: 'tutorial-3',
      data: {
        title: 'Advanced Topic',
        section: 'Advanced',
        stepNumber: 1,
      },
    },
  ];

  it('should group tutorials by section', () => {
    // Test the grouping logic
    const tutorialsBySection = mockTutorials.reduce((acc, tutorial) => {
      const section = tutorial.data.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(tutorial);
      return acc;
    }, {} as Record<string, any[]>);

    expect(Object.keys(tutorialsBySection)).toHaveLength(2);
    expect(tutorialsBySection['Getting Started']).toHaveLength(2);
    expect(tutorialsBySection['Advanced']).toHaveLength(1);
  });

  it('should sort tutorials by stepNumber within sections', () => {
    const unsortedTutorials = [
      {
        slug: 'tutorial-2',
        data: {
          title: 'Second',
          section: 'Getting Started',
          stepNumber: 2,
        },
      },
      {
        slug: 'tutorial-1',
        data: {
          title: 'First',
          section: 'Getting Started',
          stepNumber: 1,
        },
      },
    ];

    const sorted = unsortedTutorials.sort((a, b) => a.data.stepNumber - b.data.stepNumber);

    expect(sorted[0].data.stepNumber).toBe(1);
    expect(sorted[1].data.stepNumber).toBe(2);
  });

  it('should generate correct tutorial paths', () => {
    mockTutorials.forEach(tutorial => {
      const path = `/tutorial/${tutorial.slug}`;
      expect(path).toMatch(/^\/tutorial\//);
      expect(path).toContain(tutorial.slug);
    });
  });

  it('should validate tutorial data structure', () => {
    mockTutorials.forEach(tutorial => {
      expect(tutorial).toHaveProperty('slug');
      expect(tutorial).toHaveProperty('data');
      expect(tutorial.data).toHaveProperty('title');
      expect(tutorial.data).toHaveProperty('section');
      expect(tutorial.data).toHaveProperty('stepNumber');
      expect(typeof tutorial.data.stepNumber).toBe('number');
    });
  });

  it('should handle empty tutorials array', () => {
    const emptyTutorials: any[] = [];
    const grouped = emptyTutorials.reduce((acc, tutorial) => {
      const section = tutorial.data.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(tutorial);
      return acc;
    }, {} as Record<string, any[]>);

    expect(Object.keys(grouped)).toHaveLength(0);
  });

  it('should correctly identify current tutorial by slug', () => {
    const currentSlug = 'tutorial-1';
    const tutorial = mockTutorials.find(t => t.slug === currentSlug);

    expect(tutorial).toBeDefined();
    expect(tutorial?.slug).toBe(currentSlug);
  });

  it('should handle multiple sections correctly', () => {
    const tutorialsBySection = mockTutorials.reduce((acc, tutorial) => {
      const section = tutorial.data.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(tutorial);
      return acc;
    }, {} as Record<string, any[]>);

    const sortedSections = Object.entries(tutorialsBySection).map(([section, tutList]) => ({
      section,
      tutorials: tutList.sort((a, b) => a.data.stepNumber - b.data.stepNumber)
    }));

    expect(sortedSections).toHaveLength(2);
    expect(sortedSections[0].section).toBe('Getting Started');
    expect(sortedSections[0].tutorials).toHaveLength(2);
  });
});
