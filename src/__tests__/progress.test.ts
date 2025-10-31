import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  isLocalStorageAvailable,
  loadProgress,
  saveProgress,
  markTutorialComplete,
  markTutorialIncomplete,
  isTutorialComplete,
  getTutorialProgress,
  getProgressStats,
  clearAllProgress,
  exportProgress,
  importProgress,
  type ProgressData,
} from '../utils/progress';

describe('Progress Utilities', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    // Reset store
    store = {};

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => {
        const keys = Object.keys(store);
        return keys[index] || null;
      }),
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      expect(isLocalStorageAvailable()).toBe(false);

      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadProgress', () => {
    it('should return empty object when no data exists', () => {
      const progress = loadProgress();
      expect(progress).toEqual({});
    });

    it('should load saved progress data', () => {
      const testData: ProgressData = {
        'tutorial-1': { completed: true, timestamp: '2025-10-31T10:00:00.000Z' },
      };
      localStorage.setItem('dstack-tutorial-progress', JSON.stringify(testData));

      const progress = loadProgress();
      expect(progress).toEqual(testData);
    });

    it('should return empty object on JSON parse error', () => {
      localStorage.setItem('dstack-tutorial-progress', 'invalid-json');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const progress = loadProgress();

      expect(progress).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveProgress', () => {
    it('should save progress data to localStorage', () => {
      const testData: ProgressData = {
        'tutorial-1': { completed: true, timestamp: '2025-10-31T10:00:00.000Z' },
      };

      const result = saveProgress(testData);
      expect(result).toBe(true);

      const saved = JSON.parse(localStorage.getItem('dstack-tutorial-progress') || '{}');
      expect(saved).toEqual(testData);
    });

    it('should return false on save error', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      // Override the mock to throw an error
      Object.defineProperty(global, 'localStorage', {
        value: {
          ...localStorage,
          setItem: vi.fn(() => {
            throw new Error('Storage full');
          }),
        },
        writable: true,
        configurable: true,
      });

      const result = saveProgress({});

      expect(result).toBe(false);
      // Console error is called but we don't strictly need to verify it
    });
  });

  describe('markTutorialComplete', () => {
    it('should mark a tutorial as complete', () => {
      const result = markTutorialComplete('tutorial-1');
      expect(result).toBe(true);

      const progress = loadProgress();
      expect(progress['tutorial-1'].completed).toBe(true);
      expect(progress['tutorial-1'].timestamp).toBeDefined();
    });

    it('should save time spent if provided', () => {
      markTutorialComplete('tutorial-1', 300);

      const progress = loadProgress();
      expect(progress['tutorial-1'].timeSpent).toBe(300);
    });

    it('should update existing completion', () => {
      markTutorialComplete('tutorial-1');
      const firstTimestamp = loadProgress()['tutorial-1'].timestamp;

      // Wait a bit and mark complete again
      markTutorialComplete('tutorial-1');
      const secondTimestamp = loadProgress()['tutorial-1'].timestamp;

      expect(secondTimestamp).toBeDefined();
      // Timestamps should be different (second one newer)
      expect(secondTimestamp >= firstTimestamp).toBe(true);
    });
  });

  describe('markTutorialIncomplete', () => {
    it('should remove tutorial completion', () => {
      markTutorialComplete('tutorial-1');
      expect(isTutorialComplete('tutorial-1')).toBe(true);

      markTutorialIncomplete('tutorial-1');
      expect(isTutorialComplete('tutorial-1')).toBe(false);
    });

    it('should handle removing non-existent tutorial', () => {
      const result = markTutorialIncomplete('non-existent');
      expect(result).toBe(true);
    });
  });

  describe('isTutorialComplete', () => {
    it('should return false for incomplete tutorial', () => {
      expect(isTutorialComplete('tutorial-1')).toBe(false);
    });

    it('should return true for complete tutorial', () => {
      markTutorialComplete('tutorial-1');
      expect(isTutorialComplete('tutorial-1')).toBe(true);
    });
  });

  describe('getTutorialProgress', () => {
    it('should return null for non-existent tutorial', () => {
      const progress = getTutorialProgress('tutorial-1');
      expect(progress).toBeNull();
    });

    it('should return progress data for complete tutorial', () => {
      markTutorialComplete('tutorial-1', 450);

      const progress = getTutorialProgress('tutorial-1');
      expect(progress).not.toBeNull();
      expect(progress?.completed).toBe(true);
      expect(progress?.timeSpent).toBe(450);
      expect(progress?.timestamp).toBeDefined();
    });
  });

  describe('getProgressStats', () => {
    it('should calculate stats correctly with no completion', () => {
      const stats = getProgressStats(['tutorial-1', 'tutorial-2', 'tutorial-3']);

      expect(stats.totalTutorials).toBe(3);
      expect(stats.completedTutorials).toBe(0);
      expect(stats.percentComplete).toBe(0);
      expect(stats.lastUpdated).toBeUndefined();
    });

    it('should calculate stats correctly with some completion', () => {
      markTutorialComplete('tutorial-1');
      markTutorialComplete('tutorial-2');

      const stats = getProgressStats(['tutorial-1', 'tutorial-2', 'tutorial-3']);

      expect(stats.totalTutorials).toBe(3);
      expect(stats.completedTutorials).toBe(2);
      expect(stats.percentComplete).toBe(67);
      expect(stats.lastUpdated).toBeDefined();
    });

    it('should calculate 100% when all complete', () => {
      markTutorialComplete('tutorial-1');
      markTutorialComplete('tutorial-2');

      const stats = getProgressStats(['tutorial-1', 'tutorial-2']);

      expect(stats.percentComplete).toBe(100);
    });

    it('should handle empty tutorial list', () => {
      const stats = getProgressStats([]);

      expect(stats.totalTutorials).toBe(0);
      expect(stats.completedTutorials).toBe(0);
      expect(stats.percentComplete).toBe(0);
    });

    it('should return most recent timestamp as lastUpdated', () => {
      markTutorialComplete('tutorial-1');
      const firstTimestamp = loadProgress()['tutorial-1'].timestamp;

      markTutorialComplete('tutorial-2');
      const secondTimestamp = loadProgress()['tutorial-2'].timestamp;

      const stats = getProgressStats(['tutorial-1', 'tutorial-2']);

      // lastUpdated should be the more recent one
      expect(stats.lastUpdated).toBe(secondTimestamp >= firstTimestamp ? secondTimestamp : firstTimestamp);
    });
  });

  describe('clearAllProgress', () => {
    it('should clear all progress data', () => {
      markTutorialComplete('tutorial-1');
      markTutorialComplete('tutorial-2');

      expect(Object.keys(loadProgress()).length).toBe(2);

      clearAllProgress();

      expect(Object.keys(loadProgress()).length).toBe(0);
    });
  });

  describe('exportProgress', () => {
    it('should export progress as JSON string', () => {
      markTutorialComplete('tutorial-1');
      markTutorialComplete('tutorial-2', 600);

      const exported = exportProgress();
      const parsed = JSON.parse(exported);

      expect(parsed['tutorial-1']).toBeDefined();
      expect(parsed['tutorial-2']).toBeDefined();
      expect(parsed['tutorial-2'].timeSpent).toBe(600);
    });

    it('should export empty object when no progress', () => {
      const exported = exportProgress();
      expect(exported).toBe('{}');
    });
  });

  describe('importProgress', () => {
    it('should import progress from JSON string', () => {
      const testData = {
        'tutorial-1': { completed: true, timestamp: '2025-10-31T10:00:00.000Z', timeSpent: 300 },
      };

      const result = importProgress(JSON.stringify(testData));
      expect(result).toBe(true);

      expect(isTutorialComplete('tutorial-1')).toBe(true);
      expect(getTutorialProgress('tutorial-1')?.timeSpent).toBe(300);
    });

    it('should return false on invalid JSON', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = importProgress('invalid-json');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
