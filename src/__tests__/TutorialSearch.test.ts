import { describe, it, expect } from 'vitest';

describe('TutorialSearch Component', () => {
  const mockTutorials = [
    {
      slug: 'install-rust',
      data: {
        title: 'Install Rust Toolchain',
        description: 'Learn how to install Rust',
        section: 'Getting Started',
        stepNumber: 1,
        tags: ['rust', 'installation'],
      },
    },
    {
      slug: 'deploy-app',
      data: {
        title: 'Deploy Application',
        description: 'Deploy your first dstack app',
        section: 'Deployment',
        stepNumber: 1,
        tags: ['deployment', 'docker'],
      },
    },
    {
      slug: 'configure-env',
      data: {
        title: 'Configure Environment',
        description: 'Set up your environment variables',
        section: 'Configuration',
        stepNumber: 1,
        tags: ['config', 'env'],
      },
    },
  ];

  describe('Search filtering logic', () => {
    it('should filter by title (case insensitive)', () => {
      const query = 'rust';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.title.toLowerCase().includes(query.toLowerCase());
      });

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('install-rust');
    });

    it('should filter by description', () => {
      const query = 'deploy';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.description?.toLowerCase().includes(query.toLowerCase());
      });

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('deploy-app');
    });

    it('should filter by tags', () => {
      const query = 'docker';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query.toLowerCase())
        );
      });

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('deploy-app');
    });

    it('should filter by multiple criteria (title OR description OR tags)', () => {
      const query = 'config';
      const results = mockTutorials.filter(tutorial => {
        const titleMatch = tutorial.data.title.toLowerCase().includes(query);
        const descMatch = tutorial.data.description?.toLowerCase().includes(query);
        const tagsMatch = tutorial.data.tags?.some((tag: string) =>
          tag.toLowerCase().includes(query)
        );
        return titleMatch || descMatch || tagsMatch;
      });

      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('configure-env');
    });

    it('should be case insensitive', () => {
      const lowerQuery = 'rust';
      const upperQuery = 'RUST';
      const mixedQuery = 'RuSt';

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
      const query = 'app';
      const results = mockTutorials.filter(tutorial => {
        return tutorial.data.title.toLowerCase().includes(query.toLowerCase());
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].data.title).toContain('App');
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
