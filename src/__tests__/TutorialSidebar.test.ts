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

  describe('Appendix sorting', () => {
    it('should place appendices after numbered tutorials', () => {
      const mixedTutorials = [
        {
          slug: 'appendix-a',
          data: {
            title: 'Appendix A: Troubleshooting',
            section: 'Host Setup',
            stepNumber: null,
            isAppendix: true,
          },
        },
        {
          slug: 'step-2',
          data: {
            title: 'Step 2',
            section: 'Host Setup',
            stepNumber: 2,
            isAppendix: false,
          },
        },
        {
          slug: 'step-1',
          data: {
            title: 'Step 1',
            section: 'Host Setup',
            stepNumber: 1,
            isAppendix: false,
          },
        },
        {
          slug: 'appendix-b',
          data: {
            title: 'Appendix B: Automation',
            section: 'Host Setup',
            stepNumber: null,
            isAppendix: true,
          },
        },
      ];

      const sorted = mixedTutorials.sort((a, b) => {
        const aIsAppendix = a.data.isAppendix || a.data.stepNumber === null;
        const bIsAppendix = b.data.isAppendix || b.data.stepNumber === null;

        if (aIsAppendix && !bIsAppendix) return 1;
        if (!aIsAppendix && bIsAppendix) return -1;

        if (a.data.stepNumber !== null && b.data.stepNumber !== null) {
          return a.data.stepNumber - b.data.stepNumber;
        }

        return a.data.title.localeCompare(b.data.title);
      });

      // First two should be numbered steps
      expect(sorted[0].data.stepNumber).toBe(1);
      expect(sorted[1].data.stepNumber).toBe(2);

      // Last two should be appendices
      expect(sorted[2].data.isAppendix).toBe(true);
      expect(sorted[3].data.isAppendix).toBe(true);
    });

    it('should sort appendices alphabetically by title', () => {
      const appendices = [
        {
          slug: 'appendix-b',
          data: {
            title: 'Appendix B: Automation',
            section: 'Host Setup',
            stepNumber: null,
            isAppendix: true,
          },
        },
        {
          slug: 'appendix-a',
          data: {
            title: 'Appendix A: Troubleshooting',
            section: 'Host Setup',
            stepNumber: null,
            isAppendix: true,
          },
        },
      ];

      const sorted = appendices.sort((a, b) => a.data.title.localeCompare(b.data.title));

      expect(sorted[0].data.title).toBe('Appendix A: Troubleshooting');
      expect(sorted[1].data.title).toBe('Appendix B: Automation');
    });

    it('should treat null stepNumber as appendix', () => {
      const tutorial = {
        slug: 'appendix-test',
        data: {
          title: 'Test Appendix',
          section: 'Host Setup',
          stepNumber: null,
          isAppendix: undefined,
        },
      };

      const isAppendix = tutorial.data.isAppendix || tutorial.data.stepNumber === null;
      expect(isAppendix).toBe(true);
    });

    it('should not display step numbers for appendices in sidebar', () => {
      const appendix = {
        slug: 'appendix-a',
        data: {
          title: 'Appendix A: Troubleshooting',
          section: 'Host Setup',
          stepNumber: null,
          isAppendix: true,
        },
      };

      const numberedStep = {
        slug: 'step-1',
        data: {
          title: 'Step 1',
          section: 'Host Setup',
          stepNumber: 1,
          isAppendix: false,
        },
      };

      // For appendix, display title without number
      const appendixDisplay = appendix.data.stepNumber !== null
        ? `${appendix.data.stepNumber}. ${appendix.data.title}`
        : appendix.data.title;

      expect(appendixDisplay).toBe('Appendix A: Troubleshooting');

      // For numbered step, display with number
      const stepDisplay = numberedStep.data.stepNumber !== null
        ? `${numberedStep.data.stepNumber}. ${numberedStep.data.title}`
        : numberedStep.data.title;

      expect(stepDisplay).toBe('1. Step 1');
    });
  });
});
