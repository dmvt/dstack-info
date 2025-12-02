/**
 * Prerequisite resolution utilities
 * Handles finding the nearest incomplete prerequisite in a dependency chain
 */

import type { ProgressData } from './progress';

export interface TutorialInfo {
  slug: string;
  title: string;
  description: string;
  estimatedTime?: string;
  prerequisites?: string[];
  isAppendix?: boolean;
}

/**
 * Build a map of tutorial slugs to their info for quick lookup
 */
export function buildTutorialMap(tutorials: TutorialInfo[]): Map<string, TutorialInfo> {
  return new Map(tutorials.map(t => [t.slug, t]));
}

/**
 * Check if a tutorial and all its prerequisites are complete
 * @param slug - The tutorial slug to check
 * @param tutorialMap - Map of all tutorials
 * @param progress - Current progress data
 * @returns true if the tutorial and all its prerequisites are complete
 */
export function isTutorialChainComplete(
  slug: string,
  tutorialMap: Map<string, TutorialInfo>,
  progress: ProgressData
): boolean {
  const tutorial = tutorialMap.get(slug);
  if (!tutorial) return true; // Unknown tutorial, assume complete

  // Check if this tutorial is complete
  if (!progress[slug]?.completed) {
    return false;
  }

  // Check all prerequisites recursively
  const prerequisites = tutorial.prerequisites || [];
  for (const prereqSlug of prerequisites) {
    if (!isTutorialChainComplete(prereqSlug, tutorialMap, progress)) {
      return false;
    }
  }

  return true;
}

/**
 * Find the nearest incomplete prerequisite in the dependency chain
 * Returns the closest prerequisite that needs to be completed
 *
 * Example: A -> B -> C -> D (where -> means "is prerequisite for")
 * If on D and C is incomplete: returns C
 * If on D and C is complete but B is incomplete: returns B
 * If on D and all (A, B, C) are complete: returns null
 *
 * @param prerequisites - Direct prerequisites of the current tutorial
 * @param tutorialMap - Map of all tutorials
 * @param progress - Current progress data
 * @returns The nearest incomplete prerequisite, or null if all are complete
 */
export function findNearestIncompletePrerequisite(
  prerequisites: string[],
  tutorialMap: Map<string, TutorialInfo>,
  progress: ProgressData
): TutorialInfo | null {
  if (!prerequisites || prerequisites.length === 0) {
    return null;
  }

  // Check each direct prerequisite
  for (const prereqSlug of prerequisites) {
    const prereqTutorial = tutorialMap.get(prereqSlug);
    if (!prereqTutorial) continue;

    // Skip appendix tutorials - they are not required prerequisites
    if (prereqTutorial.isAppendix) continue;

    // If this prerequisite is not complete, check if its chain is complete
    if (!progress[prereqSlug]?.completed) {
      // This prerequisite is incomplete - but first check if IT has incomplete prerequisites
      const prereqPrerequisites = prereqTutorial.prerequisites || [];
      const deeperIncomplete = findNearestIncompletePrerequisite(
        prereqPrerequisites,
        tutorialMap,
        progress
      );

      // If there's a deeper incomplete prerequisite, return that
      // Otherwise return this one
      return deeperIncomplete || prereqTutorial;
    }

    // This prerequisite is complete, but check its prerequisites recursively
    const prereqPrerequisites = prereqTutorial.prerequisites || [];
    const deeperIncomplete = findNearestIncompletePrerequisite(
      prereqPrerequisites,
      tutorialMap,
      progress
    );

    if (deeperIncomplete) {
      return deeperIncomplete;
    }
  }

  // All prerequisites and their chains are complete
  return null;
}

/**
 * Determine if the prerequisites box should be shown
 * @param prerequisites - Direct prerequisites of the current tutorial
 * @param tutorialMap - Map of all tutorials
 * @param progress - Current progress data
 * @returns true if there's at least one incomplete prerequisite in the chain
 */
export function shouldShowPrerequisites(
  prerequisites: string[] | undefined,
  tutorialMap: Map<string, TutorialInfo>,
  progress: ProgressData
): boolean {
  if (!prerequisites || prerequisites.length === 0) {
    return false;
  }

  return findNearestIncompletePrerequisite(prerequisites, tutorialMap, progress) !== null;
}

/**
 * Result of collecting all incomplete prerequisites
 */
export interface IncompletePrerequisites {
  /** The nearest/deepest incomplete prerequisite - should be most prominent */
  primary: TutorialInfo;
  /** Other incomplete prerequisites in the chain - shown as secondary */
  others: TutorialInfo[];
}

/**
 * Collect all incomplete prerequisites in the dependency chain
 * Returns the primary (nearest) and all other incomplete prerequisites
 *
 * @param prerequisites - Direct prerequisites of the current tutorial
 * @param tutorialMap - Map of all tutorials
 * @param progress - Current progress data
 * @returns Object with primary and other incomplete prerequisites, or null if all complete
 */
export function collectAllIncompletePrerequisites(
  prerequisites: string[] | undefined,
  tutorialMap: Map<string, TutorialInfo>,
  progress: ProgressData
): IncompletePrerequisites | null {
  if (!prerequisites || prerequisites.length === 0) {
    return null;
  }

  // Collect all incomplete prerequisites
  const allIncomplete: TutorialInfo[] = [];
  const visited = new Set<string>();

  function collectIncomplete(prereqSlugs: string[]) {
    for (const slug of prereqSlugs) {
      if (visited.has(slug)) continue;
      visited.add(slug);

      const tutorial = tutorialMap.get(slug);
      if (!tutorial) continue;

      // Skip appendix tutorials - they are not required prerequisites
      if (tutorial.isAppendix) continue;

      // If incomplete, add to list
      if (!progress[slug]?.completed) {
        allIncomplete.push(tutorial);
      }

      // Recurse into this tutorial's prerequisites
      const nestedPrereqs = tutorial.prerequisites || [];
      if (nestedPrereqs.length > 0) {
        collectIncomplete(nestedPrereqs);
      }
    }
  }

  collectIncomplete(prerequisites);

  if (allIncomplete.length === 0) {
    return null;
  }

  // Find the primary (nearest/deepest) using existing function
  const primary = findNearestIncompletePrerequisite(prerequisites, tutorialMap, progress);
  if (!primary) {
    return null;
  }

  // Others are all incomplete except the primary
  const others = allIncomplete.filter(t => t.slug !== primary.slug);

  return { primary, others };
}
