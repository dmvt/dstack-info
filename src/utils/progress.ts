/**
 * Progress tracking utilities for tutorial completion
 * Uses localStorage to persist progress across sessions
 */

export interface TutorialProgress {
  completed: boolean;
  timestamp: string;
  timeSpent?: number; // in seconds
}

export interface ProgressData {
  [tutorialSlug: string]: TutorialProgress;
}

export interface ProgressStats {
  totalTutorials: number;
  completedTutorials: number;
  percentComplete: number;
  lastUpdated?: string;
}

const STORAGE_KEY = 'dstack-tutorial-progress';

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Load all progress data from localStorage
 */
export function loadProgress(): ProgressData {
  if (!isLocalStorageAvailable()) {
    return {};
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load progress data:', e);
    return {};
  }
}

/**
 * Save all progress data to localStorage
 */
export function saveProgress(data: ProgressData): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save progress data:', e);
    return false;
  }
}

/**
 * Mark a tutorial as complete
 */
export function markTutorialComplete(tutorialSlug: string, timeSpent?: number): boolean {
  const progress = loadProgress();
  progress[tutorialSlug] = {
    completed: true,
    timestamp: new Date().toISOString(),
    timeSpent,
  };
  return saveProgress(progress);
}

/**
 * Mark a tutorial as incomplete
 */
export function markTutorialIncomplete(tutorialSlug: string): boolean {
  const progress = loadProgress();
  delete progress[tutorialSlug];
  return saveProgress(progress);
}

/**
 * Check if a tutorial is complete
 */
export function isTutorialComplete(tutorialSlug: string): boolean {
  const progress = loadProgress();
  return progress[tutorialSlug]?.completed || false;
}

/**
 * Get progress for a specific tutorial
 */
export function getTutorialProgress(tutorialSlug: string): TutorialProgress | null {
  const progress = loadProgress();
  return progress[tutorialSlug] || null;
}

/**
 * Get overall progress statistics
 */
export function getProgressStats(allTutorialSlugs: string[]): ProgressStats {
  const progress = loadProgress();
  const completedTutorials = allTutorialSlugs.filter(slug =>
    progress[slug]?.completed
  ).length;

  const timestamps = Object.values(progress)
    .map(p => p.timestamp)
    .sort()
    .reverse();

  return {
    totalTutorials: allTutorialSlugs.length,
    completedTutorials,
    percentComplete: allTutorialSlugs.length > 0
      ? Math.round((completedTutorials / allTutorialSlugs.length) * 100)
      : 0,
    lastUpdated: timestamps[0],
  };
}

/**
 * Clear all progress data
 */
export function clearAllProgress(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear progress data:', e);
    return false;
  }
}

/**
 * Export progress data as JSON string
 */
export function exportProgress(): string {
  const progress = loadProgress();
  return JSON.stringify(progress, null, 2);
}

/**
 * Import progress data from JSON string
 */
export function importProgress(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    return saveProgress(data);
  } catch (e) {
    console.error('Failed to import progress data:', e);
    return false;
  }
}
