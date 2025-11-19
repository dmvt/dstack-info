<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { isTutorialComplete } from '../utils/progress';
  import type { Heading } from '../utils/markdown';

  export let tutorials: any[];
  export let currentSlug: string;
  export let headings: Heading[] = [];

  let mounted = false;
  let completionStatus: Record<string, boolean> = {};
  let collapsedSections: Record<string, boolean> = {};
  let initializedForSlug = '';
  let activeHeadingId = '';

  // Group tutorials by section
  $: tutorialsBySection = tutorials.reduce((acc, tutorial) => {
    const section = tutorial.data.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(tutorial);
    return acc;
  }, {} as Record<string, any[]>);

  // Define section order (tutorials flow: TDX setup -> Prerequisites -> dstack installation)
  const sectionOrder = ['TDX Enablement', 'Prerequisites', 'dstack Installation'];

  // Sort tutorials within each section: numbered steps first, then appendices
  $: sortedSections = Object.entries(tutorialsBySection)
    .map(([section, tutList]) => ({
      section,
      tutorials: tutList.sort((a, b) => {
        // Appendices come last
        const aIsAppendix = a.data.isAppendix || a.data.stepNumber === null;
        const bIsAppendix = b.data.isAppendix || b.data.stepNumber === null;

        if (aIsAppendix && !bIsAppendix) return 1;
        if (!aIsAppendix && bIsAppendix) return -1;

        // Both are numbered steps or both are appendices
        if (a.data.stepNumber !== null && b.data.stepNumber !== null) {
          return a.data.stepNumber - b.data.stepNumber;
        }

        // Both are appendices, sort alphabetically by title
        return a.data.title.localeCompare(b.data.title);
      })
    }))
    .sort((a, b) => {
      // Sort sections by defined order
      const aIndex = sectionOrder.indexOf(a.section);
      const bIndex = sectionOrder.indexOf(b.section);
      // Unknown sections go to the end
      if (aIndex === -1 && bIndex === -1) return a.section.localeCompare(b.section);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  // Initialize collapsed state: expand section containing current tutorial
  // Only initialize when slug changes, don't override user's manual toggles
  $: {
    const currentTutorial = tutorials.find(t => t.slug === currentSlug);
    if (currentTutorial && mounted && initializedForSlug !== currentSlug) {
      const currentSection = currentTutorial.data.section;

      // Collapse all sections by default, except the one with current tutorial
      sortedSections.forEach(({ section }) => {
        if (!(section in collapsedSections)) {
          collapsedSections[section] = section !== currentSection;
        }
      });

      // Expand the current section on initial load only
      collapsedSections[currentSection] = false;
      collapsedSections = { ...collapsedSections };
      initializedForSlug = currentSlug;
    }
  }

  function toggleSection(section: string) {
    collapsedSections[section] = !collapsedSections[section];
    // Force reactivity
    collapsedSections = { ...collapsedSections };
  }

  function scrollToHeading(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL hash without jumping
      history.pushState(null, '', `#${id}`);
    }
  }

  function updateCompletionStatus() {
    tutorials.forEach(tutorial => {
      completionStatus[tutorial.slug] = isTutorialComplete(tutorial.slug);
    });
    // Force reactivity
    completionStatus = { ...completionStatus };
  }

  function updateActiveHeading() {
    if (headings.length === 0) return;

    const offset = 100; // Offset from top of viewport
    let currentActive = '';

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= offset) {
          currentActive = heading.id;
        }
      }
    }

    // If no heading is past the offset, use the first one
    if (!currentActive && headings.length > 0) {
      currentActive = headings[0].id;
    }

    activeHeadingId = currentActive;
  }

  onMount(() => {
    // Load initial completion status
    updateCompletionStatus();
    mounted = true;

    // Initial active heading
    updateActiveHeading();

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dstack-tutorial-progress') {
        updateCompletionStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events from same page
    const handleCustomUpdate = () => {
      updateCompletionStatus();
    };
    window.addEventListener('tutorialProgressUpdate', handleCustomUpdate);

    // Scroll spy for TOC
    const handleScroll = () => {
      updateActiveHeading();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tutorialProgressUpdate', handleCustomUpdate);
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

{#if mounted}
  <nav class="space-y-6">
    {#each sortedSections as { section, tutorials: sectionTutorials }}
      <div>
        <!-- Collapsible Section Header -->
        <button
          on:click={() => toggleSection(section)}
          class="w-full flex items-center justify-between text-text-secondary text-xs uppercase font-semibold mb-2 px-3 hover:text-text-primary transition-colors"
        >
          <span>{section}</span>
          <i class="fas fa-chevron-down text-xs transition-transform duration-200 {collapsedSections[section] ? '-rotate-90' : ''}"></i>
        </button>

        <!-- Section Content (Collapsible) -->
        {#if !collapsedSections[section]}
          <div class="space-y-1">
            {#each sectionTutorials as tutorial}
              <div>
                <a
                  href="/tutorial/{tutorial.slug}"
                  class="flex items-center px-3 py-2 rounded-lg transition-colors {currentSlug === tutorial.slug
                    ? 'bg-cyber-blue/20 text-cyber-blue'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'}"
                >
                  <span class="flex-1 text-sm">
                    {#if tutorial.data.stepNumber !== null}
                      {tutorial.data.stepNumber}. {tutorial.data.title}
                    {:else}
                      {tutorial.data.title}
                    {/if}
                  </span>
                  {#if completionStatus[tutorial.slug]}
                    <i class="fas fa-check-circle text-lime-green text-sm ml-2"></i>
                  {/if}
                </a>

                <!-- Table of Contents (only for current tutorial) -->
                {#if currentSlug === tutorial.slug && headings.length > 0}
                  <div class="ml-3 mt-1 space-y-1 border-l border-border-default pl-3">
                    {#each headings as heading}
                      <button
                        on:click={() => scrollToHeading(heading.id)}
                        class="block w-full text-left text-xs py-1 transition-colors {heading.level === 3 ? 'pl-3' : ''} {activeHeadingId === heading.id ? 'text-cyber-blue font-medium' : 'text-text-secondary hover:text-cyber-blue'}"
                      >
                        {heading.text}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </nav>
{/if}
