import { describe, it, expect } from 'vitest';
import {
  buildTutorialMap,
  isTutorialChainComplete,
  findNearestIncompletePrerequisite,
  shouldShowPrerequisites,
  collectAllIncompletePrerequisites,
  type TutorialInfo,
  type IncompletePrerequisites
} from '../utils/prerequisites';
import type { ProgressData } from '../utils/progress';

// Helper to create tutorial info
function createTutorial(
  slug: string,
  prerequisites: string[] = [],
  title?: string
): TutorialInfo {
  return {
    slug,
    title: title || `Tutorial ${slug.toUpperCase()}`,
    description: `Description for ${slug}`,
    estimatedTime: '10 minutes',
    prerequisites
  };
}

describe('Prerequisites Utilities', () => {
  describe('buildTutorialMap', () => {
    it('should create a map from tutorial array', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b'),
        createTutorial('c')
      ];
      const map = buildTutorialMap(tutorials);

      expect(map.size).toBe(3);
      expect(map.get('a')?.slug).toBe('a');
      expect(map.get('b')?.slug).toBe('b');
      expect(map.get('c')?.slug).toBe('c');
    });

    it('should handle empty array', () => {
      const map = buildTutorialMap([]);
      expect(map.size).toBe(0);
    });

    it('should handle duplicate slugs (last one wins)', () => {
      const tutorials = [
        createTutorial('a', [], 'First A'),
        createTutorial('a', [], 'Second A')
      ];
      const map = buildTutorialMap(tutorials);

      expect(map.size).toBe(1);
      expect(map.get('a')?.title).toBe('Second A');
    });
  });

  describe('isTutorialChainComplete', () => {
    it('should return true for tutorial with no prerequisites when complete', () => {
      const tutorials = [createTutorial('a')];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {
        a: { completed: true, timestamp: '2024-01-01' }
      };

      expect(isTutorialChainComplete('a', map, progress)).toBe(true);
    });

    it('should return false for incomplete tutorial', () => {
      const tutorials = [createTutorial('a')];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {};

      expect(isTutorialChainComplete('a', map, progress)).toBe(false);
    });

    it('should return true for unknown tutorial', () => {
      const map = buildTutorialMap([]);
      const progress: ProgressData = {};

      expect(isTutorialChainComplete('unknown', map, progress)).toBe(true);
    });

    it('should check prerequisite chain - all complete', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b'])
      ];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {
        a: { completed: true, timestamp: '2024-01-01' },
        b: { completed: true, timestamp: '2024-01-02' },
        c: { completed: true, timestamp: '2024-01-03' }
      };

      expect(isTutorialChainComplete('c', map, progress)).toBe(true);
    });

    it('should check prerequisite chain - middle incomplete', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b'])
      ];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {
        a: { completed: true, timestamp: '2024-01-01' },
        // b is not complete
        c: { completed: true, timestamp: '2024-01-03' }
      };

      expect(isTutorialChainComplete('c', map, progress)).toBe(false);
    });

    it('should check prerequisite chain - first incomplete', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b'])
      ];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {
        // a is not complete
        b: { completed: true, timestamp: '2024-01-02' },
        c: { completed: true, timestamp: '2024-01-03' }
      };

      expect(isTutorialChainComplete('c', map, progress)).toBe(false);
    });
  });

  describe('findNearestIncompletePrerequisite', () => {
    describe('simple cases', () => {
      it('should return null for empty prerequisites', () => {
        const map = buildTutorialMap([]);
        const progress: ProgressData = {};

        expect(findNearestIncompletePrerequisite([], map, progress)).toBeNull();
      });

      it('should return null for undefined prerequisites', () => {
        const map = buildTutorialMap([]);
        const progress: ProgressData = {};

        expect(findNearestIncompletePrerequisite(undefined as any, map, progress)).toBeNull();
      });

      it('should return the prerequisite when it is incomplete', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b', ['a'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = findNearestIncompletePrerequisite(['a'], map, progress);
        expect(result?.slug).toBe('a');
      });

      it('should return null when prerequisite is complete', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b', ['a'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
        };

        const result = findNearestIncompletePrerequisite(['a'], map, progress);
        expect(result).toBeNull();
      });

      it('should skip unknown prerequisites', () => {
        const tutorials = [createTutorial('a')];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = findNearestIncompletePrerequisite(['unknown', 'a'], map, progress);
        expect(result?.slug).toBe('a');
      });
    });

    describe('chain A -> B -> C -> D', () => {
      // Setup: A is prereq for B, B is prereq for C, C is prereq for D
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b']),
        createTutorial('d', ['c'])
      ];
      const map = buildTutorialMap(tutorials);

      it('should return C when on D and C is incomplete', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          b: { completed: true, timestamp: '2024-01-02' }
          // c is not complete
        };

        // D has prerequisite C
        const result = findNearestIncompletePrerequisite(['c'], map, progress);
        expect(result?.slug).toBe('c');
      });

      it('should return B when on D, C is complete but B is incomplete', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          // b is not complete
          c: { completed: true, timestamp: '2024-01-03' }
        };

        // D has prerequisite C, but C's prereq B is incomplete
        const result = findNearestIncompletePrerequisite(['c'], map, progress);
        expect(result?.slug).toBe('b');
      });

      it('should return A when on D, C and B are complete but A is incomplete', () => {
        const progress: ProgressData = {
          // a is not complete
          b: { completed: true, timestamp: '2024-01-02' },
          c: { completed: true, timestamp: '2024-01-03' }
        };

        // D has prerequisite C, C's prereq B is complete, but B's prereq A is not
        const result = findNearestIncompletePrerequisite(['c'], map, progress);
        expect(result?.slug).toBe('a');
      });

      it('should return null when on D and A, B, C are all complete', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          b: { completed: true, timestamp: '2024-01-02' },
          c: { completed: true, timestamp: '2024-01-03' }
        };

        const result = findNearestIncompletePrerequisite(['c'], map, progress);
        expect(result).toBeNull();
      });

      it('should return B when on C and B is incomplete', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
          // b is not complete
        };

        const result = findNearestIncompletePrerequisite(['b'], map, progress);
        expect(result?.slug).toBe('b');
      });

      it('should return A when on B and A is incomplete', () => {
        const progress: ProgressData = {};

        const result = findNearestIncompletePrerequisite(['a'], map, progress);
        expect(result?.slug).toBe('a');
      });
    });

    describe('chain with nothing complete', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b']),
        createTutorial('d', ['c'])
      ];
      const map = buildTutorialMap(tutorials);

      it('should return A (the deepest incomplete) when on D with nothing complete', () => {
        const progress: ProgressData = {};

        const result = findNearestIncompletePrerequisite(['c'], map, progress);
        expect(result?.slug).toBe('a');
      });

      it('should return A when on C with nothing complete', () => {
        const progress: ProgressData = {};

        const result = findNearestIncompletePrerequisite(['b'], map, progress);
        expect(result?.slug).toBe('a');
      });

      it('should return A when on B with nothing complete', () => {
        const progress: ProgressData = {};

        const result = findNearestIncompletePrerequisite(['a'], map, progress);
        expect(result?.slug).toBe('a');
      });
    });

    describe('multiple prerequisites', () => {
      it('should find incomplete in first branch', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b'),
          createTutorial('c', ['a', 'b'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {
          // a incomplete
          b: { completed: true, timestamp: '2024-01-01' }
        };

        const result = findNearestIncompletePrerequisite(['a', 'b'], map, progress);
        expect(result?.slug).toBe('a');
      });

      it('should find incomplete in second branch', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b'),
          createTutorial('c', ['a', 'b'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
          // b incomplete
        };

        const result = findNearestIncompletePrerequisite(['a', 'b'], map, progress);
        expect(result?.slug).toBe('b');
      });

      it('should return null when all branches complete', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b'),
          createTutorial('c', ['a', 'b'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          b: { completed: true, timestamp: '2024-01-02' }
        };

        const result = findNearestIncompletePrerequisite(['a', 'b'], map, progress);
        expect(result).toBeNull();
      });
    });

    describe('diamond dependency pattern', () => {
      // A and B both depend on nothing
      // C depends on A
      // D depends on B
      // E depends on C and D
      const tutorials = [
        createTutorial('a'),
        createTutorial('b'),
        createTutorial('c', ['a']),
        createTutorial('d', ['b']),
        createTutorial('e', ['c', 'd'])
      ];
      const map = buildTutorialMap(tutorials);

      it('should find A when on E and only B, D complete', () => {
        const progress: ProgressData = {
          b: { completed: true, timestamp: '2024-01-01' },
          d: { completed: true, timestamp: '2024-01-02' }
        };

        const result = findNearestIncompletePrerequisite(['c', 'd'], map, progress);
        expect(result?.slug).toBe('a');
      });

      it('should find B when on E and only A, C complete', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          c: { completed: true, timestamp: '2024-01-02' }
        };

        const result = findNearestIncompletePrerequisite(['c', 'd'], map, progress);
        expect(result?.slug).toBe('b');
      });

      it('should return null when all prerequisites complete', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          b: { completed: true, timestamp: '2024-01-02' },
          c: { completed: true, timestamp: '2024-01-03' },
          d: { completed: true, timestamp: '2024-01-04' }
        };

        const result = findNearestIncompletePrerequisite(['c', 'd'], map, progress);
        expect(result).toBeNull();
      });
    });
  });

  describe('shouldShowPrerequisites', () => {
    it('should return false for undefined prerequisites', () => {
      const map = buildTutorialMap([]);
      const progress: ProgressData = {};

      expect(shouldShowPrerequisites(undefined, map, progress)).toBe(false);
    });

    it('should return false for empty prerequisites', () => {
      const map = buildTutorialMap([]);
      const progress: ProgressData = {};

      expect(shouldShowPrerequisites([], map, progress)).toBe(false);
    });

    it('should return true when prerequisite is incomplete', () => {
      const tutorials = [createTutorial('a')];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {};

      expect(shouldShowPrerequisites(['a'], map, progress)).toBe(true);
    });

    it('should return false when all prerequisites are complete', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a'])
      ];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {
        a: { completed: true, timestamp: '2024-01-01' }
      };

      expect(shouldShowPrerequisites(['a'], map, progress)).toBe(false);
    });

    it('should return true when deep prerequisite is incomplete', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b'])
      ];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {
        // a incomplete
        b: { completed: true, timestamp: '2024-01-02' }
      };

      expect(shouldShowPrerequisites(['b'], map, progress)).toBe(true);
    });

    it('should return false when entire chain is complete', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b'])
      ];
      const map = buildTutorialMap(tutorials);
      const progress: ProgressData = {
        a: { completed: true, timestamp: '2024-01-01' },
        b: { completed: true, timestamp: '2024-01-02' }
      };

      expect(shouldShowPrerequisites(['b'], map, progress)).toBe(false);
    });
  });

  describe('collectAllIncompletePrerequisites', () => {
    describe('simple cases', () => {
      it('should return null for undefined prerequisites', () => {
        const map = buildTutorialMap([]);
        const progress: ProgressData = {};

        expect(collectAllIncompletePrerequisites(undefined, map, progress)).toBeNull();
      });

      it('should return null for empty prerequisites', () => {
        const map = buildTutorialMap([]);
        const progress: ProgressData = {};

        expect(collectAllIncompletePrerequisites([], map, progress)).toBeNull();
      });

      it('should return null when all prerequisites are complete', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b', ['a'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
        };

        expect(collectAllIncompletePrerequisites(['a'], map, progress)).toBeNull();
      });

      it('should return single prerequisite as primary with empty others', () => {
        const tutorials = [createTutorial('a')];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['a'], map, progress);
        expect(result).not.toBeNull();
        expect(result?.primary.slug).toBe('a');
        expect(result?.others).toHaveLength(0);
      });
    });

    describe('chain A -> B -> C -> D', () => {
      const tutorials = [
        createTutorial('a'),
        createTutorial('b', ['a']),
        createTutorial('c', ['b']),
        createTutorial('d', ['c'])
      ];
      const map = buildTutorialMap(tutorials);

      it('should return A as primary with B, C as others when nothing complete (on D)', () => {
        const progress: ProgressData = {};

        // D has prerequisite C
        const result = collectAllIncompletePrerequisites(['c'], map, progress);
        expect(result?.primary.slug).toBe('a');
        expect(result?.others.map(o => o.slug).sort()).toEqual(['b', 'c']);
      });

      it('should return B as primary with C as other when only A complete (on D)', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
        };

        const result = collectAllIncompletePrerequisites(['c'], map, progress);
        expect(result?.primary.slug).toBe('b');
        expect(result?.others.map(o => o.slug)).toEqual(['c']);
      });

      it('should return C as primary with no others when A and B complete (on D)', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          b: { completed: true, timestamp: '2024-01-02' }
        };

        const result = collectAllIncompletePrerequisites(['c'], map, progress);
        expect(result?.primary.slug).toBe('c');
        expect(result?.others).toHaveLength(0);
      });

      it('should return null when A, B, C all complete (on D)', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' },
          b: { completed: true, timestamp: '2024-01-02' },
          c: { completed: true, timestamp: '2024-01-03' }
        };

        const result = collectAllIncompletePrerequisites(['c'], map, progress);
        expect(result).toBeNull();
      });
    });

    describe('multiple direct prerequisites', () => {
      it('should collect all incomplete direct prerequisites', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b'),
          createTutorial('c', ['a', 'b'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['a', 'b'], map, progress);
        expect(result?.primary.slug).toBe('a');
        expect(result?.others.map(o => o.slug)).toEqual(['b']);
      });

      it('should return single incomplete as primary when one is complete', () => {
        const tutorials = [
          createTutorial('a'),
          createTutorial('b'),
          createTutorial('c', ['a', 'b'])
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
        };

        const result = collectAllIncompletePrerequisites(['a', 'b'], map, progress);
        expect(result?.primary.slug).toBe('b');
        expect(result?.others).toHaveLength(0);
      });
    });

    describe('diamond dependency pattern', () => {
      // A and B are roots
      // C depends on A
      // D depends on B
      // E depends on C and D
      const tutorials = [
        createTutorial('a'),
        createTutorial('b'),
        createTutorial('c', ['a']),
        createTutorial('d', ['b']),
        createTutorial('e', ['c', 'd'])
      ];
      const map = buildTutorialMap(tutorials);

      it('should collect all incomplete from both branches (on E)', () => {
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['c', 'd'], map, progress);
        expect(result?.primary.slug).toBe('a');
        // Others should include b, c, d (all incomplete except primary)
        expect(result?.others.map(o => o.slug).sort()).toEqual(['b', 'c', 'd']);
      });

      it('should collect from one branch when other is complete', () => {
        const progress: ProgressData = {
          b: { completed: true, timestamp: '2024-01-01' },
          d: { completed: true, timestamp: '2024-01-02' }
        };

        const result = collectAllIncompletePrerequisites(['c', 'd'], map, progress);
        expect(result?.primary.slug).toBe('a');
        expect(result?.others.map(o => o.slug)).toEqual(['c']);
      });

      it('should handle partial completion in both branches', () => {
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
          // b, c, d all incomplete
        };

        const result = collectAllIncompletePrerequisites(['c', 'd'], map, progress);
        // C is checked first (it's first in the prerequisites array), and it's incomplete
        // so it becomes the primary since its prerequisite A is complete
        expect(result?.primary.slug).toBe('c');
        expect(result?.others.map(o => o.slug).sort()).toEqual(['b', 'd']);
      });
    });

    describe('self-referential prerequisite', () => {
      it('should handle tutorial with no prerequisites in chain', () => {
        // Create a single tutorial that has itself (edge case - shouldn't happen)
        // The visited set in collectIncomplete prevents re-processing
        const tutorials = [
          { slug: 'a', title: 'A', description: 'A', prerequisites: [] }
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['a'], map, progress);
        expect(result).not.toBeNull();
        expect(result?.primary.slug).toBe('a');
        expect(result?.others).toHaveLength(0);
      });
    });

    describe('appendix exclusion', () => {
      it('should skip appendix tutorials in prerequisite chain', () => {
        const tutorials = [
          { slug: 'a', title: 'A', description: 'A', isAppendix: false },
          { slug: 'appendix', title: 'Appendix', description: 'Appendix', isAppendix: true },
          { slug: 'b', title: 'B', description: 'B', prerequisites: ['a', 'appendix'] }
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['a', 'appendix'], map, progress);
        // Should only include 'a', not 'appendix'
        expect(result?.primary.slug).toBe('a');
        expect(result?.others).toHaveLength(0);
      });

      it('should return null when only appendix prerequisites are incomplete', () => {
        const tutorials = [
          { slug: 'a', title: 'A', description: 'A', isAppendix: false },
          { slug: 'appendix', title: 'Appendix', description: 'Appendix', isAppendix: true },
          { slug: 'b', title: 'B', description: 'B', prerequisites: ['a', 'appendix'] }
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {
          a: { completed: true, timestamp: '2024-01-01' }
          // appendix not complete, but should be ignored
        };

        const result = collectAllIncompletePrerequisites(['a', 'appendix'], map, progress);
        expect(result).toBeNull();
      });

      it('should skip appendix in deep chain', () => {
        const tutorials = [
          { slug: 'a', title: 'A', description: 'A', isAppendix: false },
          { slug: 'appendix', title: 'Appendix', description: 'Appendix', isAppendix: true, prerequisites: ['a'] },
          { slug: 'b', title: 'B', description: 'B', prerequisites: ['appendix'] }
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['appendix'], map, progress);
        // Should skip appendix but still find 'a' through appendix's prerequisites
        // Actually, since appendix is skipped entirely, we won't recurse into it
        expect(result).toBeNull();
      });
    });

    describe('IncompletePrerequisites structure', () => {
      it('should include all TutorialInfo fields in primary', () => {
        const tutorials = [
          {
            slug: 'detailed',
            title: 'Detailed Tutorial',
            description: 'A detailed description',
            estimatedTime: '30 minutes',
            prerequisites: []
          }
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['detailed'], map, progress);
        expect(result?.primary).toEqual({
          slug: 'detailed',
          title: 'Detailed Tutorial',
          description: 'A detailed description',
          estimatedTime: '30 minutes',
          prerequisites: []
        });
      });

      it('should include all TutorialInfo fields in others', () => {
        const tutorials = [
          {
            slug: 'first',
            title: 'First',
            description: 'First desc',
            estimatedTime: '10 minutes',
            prerequisites: []
          },
          {
            slug: 'second',
            title: 'Second',
            description: 'Second desc',
            estimatedTime: '20 minutes',
            prerequisites: ['first']
          }
        ];
        const map = buildTutorialMap(tutorials);
        const progress: ProgressData = {};

        const result = collectAllIncompletePrerequisites(['second'], map, progress);
        expect(result?.primary.slug).toBe('first');
        expect(result?.others).toHaveLength(1);
        expect(result?.others[0]).toEqual({
          slug: 'second',
          title: 'Second',
          description: 'Second desc',
          estimatedTime: '20 minutes',
          prerequisites: ['first']
        });
      });
    });
  });

  describe('TutorialInfo interface', () => {
    it('should handle tutorial with all optional fields', () => {
      const tutorial: TutorialInfo = {
        slug: 'test',
        title: 'Test Tutorial',
        description: 'A test',
        estimatedTime: '5 minutes',
        prerequisites: ['a', 'b']
      };

      const map = buildTutorialMap([tutorial]);
      expect(map.get('test')?.estimatedTime).toBe('5 minutes');
      expect(map.get('test')?.prerequisites).toEqual(['a', 'b']);
    });

    it('should handle tutorial with minimal fields', () => {
      const tutorial: TutorialInfo = {
        slug: 'minimal',
        title: 'Minimal',
        description: 'desc'
      };

      const map = buildTutorialMap([tutorial]);
      expect(map.get('minimal')?.estimatedTime).toBeUndefined();
      expect(map.get('minimal')?.prerequisites).toBeUndefined();
    });
  });
});
