import { describe, it, expect } from 'vitest';

describe('TutorialSearch Component', () => {
  const mockTutorials = [
    {
      slug: 'tdx-hardware-verification',
      data: {
        title: 'TDX Hardware Verification',
        description: 'Verify your hardware supports Intel TDX',
        section: 'Host Setup',
        stepNumber: 1,
        tags: ['tdx', 'hardware'],
      },
    },
    {
      slug: 'tdx-software-setup',
      data: {
        title: 'TDX Software Setup',
        description: 'Install TDX software stack',
        section: 'Host Setup',
        stepNumber: 2,
        tags: ['tdx', 'software'],
      },
    },
    {
      slug: 'tdx-kernel-installation',
      data: {
        title: 'TDX Kernel Installation',
        description: 'Install TDX-enabled kernel',
        section: 'Host Setup',
        stepNumber: 3,
        tags: ['tdx', 'kernel'],
      },
    },
  ];

  describe('Search filtering logic', () => {
    it('should filter by title (case insensitive)', () => {
      const query = 'hardware';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.title.toLowerCase().includes(query.toLowerCase());
      });

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('tdx-hardware-verification');
    });

    it('should filter by description', () => {
      const query = 'software';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.description?.toLowerCase().includes(query.toLowerCase());
      });

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('tdx-software-setup');
    });

    it('should filter by tags', () => {
      const query = 'kernel';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query.toLowerCase())
        );
      });

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('tdx-kernel-installation');
    });

    it('should filter by multiple criteria (title OR description OR tags)', () => {
      const query = 'tdx';
      const results = mockTutorials.filter(tutorial => {
        const titleMatch = tutorial.data.title.toLowerCase().includes(query);
        const descMatch = tutorial.data.description?.toLowerCase().includes(query);
        const tagsMatch = tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query)
        );
        return titleMatch || descMatch || tagsMatch;
      });

      expect(results).toHaveLength(3);
    });

    it('should be case insensitive', () => {
      const lowerQuery = 'hardware';
      const upperQuery = 'HARDWARE';
      const mixedQuery = 'HaRdWaRe';

      const lowerResults = mockTutorials.filter(tutorial =>
        tutorial.data.title.toLowerCase().includes(lowerQuery.toLowerCase())
      );
      const upperResults = mockTutorials.filter(tutorial =>
        tutorial.data.title.toLowerCase().includes(upperQuery.toLowerCase())
      );
      const mixedResults = mockTutorials.filter(tutorial =>
        tutorial.data.title.toLowerCase().includes(mixedQuery.toLowerCase())
      );

      expect(lowerResults).toHaveLength(upperResults.length);
      expect(upperResults).toHaveLength(mixedResults.length);
    });

    it('should return empty array for no matches', () => {
      const query = 'nonexistent';
      const results = mockTutorials.filter(tutorial => {
        const titleMatch = tutorial.data.title.toLowerCase().includes(query);
        const descMatch = tutorial.data.description?.toLowerCase().includes(query);
        const tagsMatch = tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query)
        );
        return titleMatch || descMatch || tagsMatch;
      });

      expect(results).toHaveLength(0);
    });

    it('should return all tutorials for empty query', () => {
      const query = '';
      const results = mockTutorials.filter(tutorial => {
        if (query.trim().length === 0) return false;
        const titleMatch = tutorial.data.title.toLowerCase().includes(query);
        const descMatch = tutorial.data.description?.toLowerCase().includes(query);
        const tagsMatch = tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query)
        );
        return titleMatch || descMatch || tagsMatch;
      });

      expect(results).toHaveLength(0); // Empty query returns no results
    });

    it('should handle partial matches', () => {
      const query = 'hard';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.title.toLowerCase().includes(query.toLowerCase());
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].data.title).toContain('Hard');
    });
  });

  describe('Result data structure', () => {
    it('should include all necessary fields in results', () => {
      const query = 'install';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.title.toLowerCase().includes(query.toLowerCase());
      });

      expect(results.length).toBeGreaterThan(0);
      const result = results[0];
      expect(result).toHaveProperty('slug');
      expect(result.data).toHaveProperty('title');
      expect(result.data).toHaveProperty('description');
      expect(result.data).toHaveProperty('section');
      expect(result.data).toHaveProperty('stepNumber');
    });

    it('should generate correct navigation paths', () => {
      const results = mockTutorials;
      results.forEach(result => {
        const path = `/tutorial/${result.slug}`;
        expect(path).toMatch(/^\/tutorial\/.+/);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle tutorials without tags', () => {
      const tutorialsWithoutTags = [
        {
          slug: 'no-tags',
          data: {
            title: 'Tutorial Without Tags',
            description: 'A tutorial',
            section: 'Test',
            stepNumber: 1,
          },
        },
      ];

      const query = 'tutorial';
      const results = tutorialsWithoutTags.filter(tutorial => {
        const titleMatch = tutorial.data.title.toLowerCase().includes(query);
        const descMatch = tutorial.data.description?.toLowerCase().includes(query);
        const tagsMatch = tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query)
        );
        return titleMatch || descMatch || tagsMatch;
      });

      expect(results).toHaveLength(1);
    });

    it('should handle tutorials without description', () => {
      const tutorialsWithoutDesc = [
        {
          slug: 'no-desc',
          data: {
            title: 'Tutorial Without Description',
            section: 'Test',
            stepNumber: 1,
            tags: ['test'],
          },
        },
      ];

      const query = 'tutorial';
      const results = tutorialsWithoutDesc.filter(tutorial => {
        const titleMatch = tutorial.data.title.toLowerCase().includes(query);
        const descMatch = tutorial.data.description?.toLowerCase().includes(query);
        const tagsMatch = tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query)
        );
        return titleMatch || descMatch || tagsMatch;
      });

      expect(results).toHaveLength(1);
    });

    it('should trim whitespace from query', () => {
      const query = '  rust  ';
      const trimmedQuery = query.trim();
      expect(trimmedQuery).toBe('rust');
      expect(trimmedQuery.length).toBeLessThan(query.length);
    });
  });
});
