import { describe, it, expect, beforeEach } from 'vitest';
import { isTutorialComplete } from '../utils/progress';

// Mock tutorials data
const mockTutorials = [
  {
    slug: 'tutorial-1',
    data: {
      title: 'Tutorial 1',
      section: 'TDX Host Setup',
      stepNumber: 1,
      totalSteps: 3
    }
  },
  {
    slug: 'tutorial-2',
    data: {
      title: 'Tutorial 2',
      section: 'TDX Host Setup',
      stepNumber: 2,
      totalSteps: 3
    }
  },
  {
    slug: 'tutorial-3',
    data: {
      title: 'Tutorial 3',
      section: 'TDX Host Setup',
      stepNumber: 3,
      totalSteps: 3
    }
  },
  {
    slug: 'appendix-1',
    data: {
      title: 'Appendix',
      section: 'Advanced Topics',
      stepNumber: null,
      totalSteps: null,
      isAppendix: true
    }
  }
];

describe('TutorialComplete Component Logic', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should calculate total tutorial count', () => {
    const totalCount = mockTutorials.length;
    expect(totalCount).toBe(4);
  });

  it('should calculate completed count when tutorials are marked complete', () => {
    // Mark one tutorial complete
    localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
      'tutorial-1': { completed: true, timestamp: new Date().toISOString() }
    }));

    const completedCount = mockTutorials.filter(t => isTutorialComplete(t.slug)).length;
    expect(completedCount).toBe(1);
  });

  it('should calculate completion percentage correctly', () => {
    const totalCount = mockTutorials.length;
    const completedCount = 1;
    const percentage = Math.round((completedCount / totalCount) * 100);

    expect(percentage).toBe(25);
  });

  it('should group tutorials by section', () => {
    const sections = new Map<string, { completed: number; total: number }>();

    mockTutorials.forEach(tutorial => {
      const section = tutorial.data.section;
      if (!sections.has(section)) {
        sections.set(section, { completed: 0, total: 0 });
      }
      const sectionData = sections.get(section)!;
      sectionData.total++;
    });

    expect(sections.size).toBe(2);
    expect(sections.get('TDX Host Setup')?.total).toBe(3);
    expect(sections.get('Advanced Topics')?.total).toBe(1);
  });

  it('should calculate section-level completion', () => {
    // Mark 2 tutorials in TDX Host Setup as complete
    localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
      'tutorial-1': { completed: true, timestamp: new Date().toISOString() },
      'tutorial-2': { completed: true, timestamp: new Date().toISOString() }
    }));

    const sections = new Map<string, { completed: number; total: number }>();

    mockTutorials.forEach(tutorial => {
      const section = tutorial.data.section;
      if (!sections.has(section)) {
        sections.set(section, { completed: 0, total: 0 });
      }
      const sectionData = sections.get(section)!;
      sectionData.total++;
      if (isTutorialComplete(tutorial.slug)) {
        sectionData.completed++;
      }
    });

    const tdxHostSetup = sections.get('TDX Host Setup')!;
    expect(tdxHostSetup.completed).toBe(2);
    expect(tdxHostSetup.total).toBe(3);

    const advancedTopics = sections.get('Advanced Topics')!;
    expect(advancedTopics.completed).toBe(0);
    expect(advancedTopics.total).toBe(1);
  });

  it('should detect when all tutorials are complete', () => {
    // Mark all tutorials complete
    localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
      'tutorial-1': { completed: true, timestamp: new Date().toISOString() },
      'tutorial-2': { completed: true, timestamp: new Date().toISOString() },
      'tutorial-3': { completed: true, timestamp: new Date().toISOString() },
      'appendix-1': { completed: true, timestamp: new Date().toISOString() }
    }));

    const completedCount = mockTutorials.filter(t => isTutorialComplete(t.slug)).length;
    const allComplete = completedCount === mockTutorials.length;

    expect(allComplete).toBe(true);
    expect(completedCount).toBe(4);
  });

  it('should detect when not all tutorials are complete', () => {
    // Mark some tutorials complete
    localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
      'tutorial-1': { completed: true, timestamp: new Date().toISOString() },
      'tutorial-2': { completed: true, timestamp: new Date().toISOString() }
    }));

    const completedCount = mockTutorials.filter(t => isTutorialComplete(t.slug)).length;
    const allComplete = completedCount === mockTutorials.length;

    expect(allComplete).toBe(false);
    expect(completedCount).toBe(2);
  });

  it('should handle empty tutorials array', () => {
    const emptyTutorials: any[] = [];
    const totalCount = emptyTutorials.length;
    const completedCount = emptyTutorials.filter(t => isTutorialComplete(t.slug)).length;

    expect(totalCount).toBe(0);
    expect(completedCount).toBe(0);
  });

  it('should calculate 100% when all tutorials complete', () => {
    localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
      'tutorial-1': { completed: true, timestamp: new Date().toISOString() },
      'tutorial-2': { completed: true, timestamp: new Date().toISOString() },
      'tutorial-3': { completed: true, timestamp: new Date().toISOString() },
      'appendix-1': { completed: true, timestamp: new Date().toISOString() }
    }));

    const totalCount = mockTutorials.length;
    const completedCount = mockTutorials.filter(t => isTutorialComplete(t.slug)).length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    expect(percentage).toBe(100);
  });

  it('should create section breakdown array correctly', () => {
    const sections = new Map<string, { completed: number; total: number }>();

    mockTutorials.forEach(tutorial => {
      const section = tutorial.data.section;
      if (!sections.has(section)) {
        sections.set(section, { completed: 0, total: 0 });
      }
      const sectionData = sections.get(section)!;
      sectionData.total++;
    });

    const sectionBreakdown = Array.from(sections.entries()).map(([section, data]) => ({
      section,
      completed: data.completed,
      total: data.total
    }));

    expect(sectionBreakdown).toHaveLength(2);
    expect(sectionBreakdown[0]).toHaveProperty('section');
    expect(sectionBreakdown[0]).toHaveProperty('completed');
    expect(sectionBreakdown[0]).toHaveProperty('total');
  });
});
