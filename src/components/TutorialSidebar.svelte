<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { isTutorialComplete } from '../utils/progress';

  export let tutorials: any[];
  export let currentSlug: string;

  let mounted = false;
  let completionStatus: Record<string, boolean> = {};

  // Group tutorials by section
  $: tutorialsBySection = tutorials.reduce((acc, tutorial) => {
    const section = tutorial.data.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(tutorial);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort tutorials within each section: numbered steps first, then appendices
  $: sortedSections = Object.entries(tutorialsBySection).map(([section, tutList]) => ({
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
  }));

  function updateCompletionStatus() {
    tutorials.forEach(tutorial => {
      completionStatus[tutorial.slug] = isTutorialComplete(tutorial.slug);
    });
    // Force reactivity
    completionStatus = { ...completionStatus };
  }

  onMount(() => {
    // Load initial completion status
    updateCompletionStatus();
    mounted = true;

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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tutorialProgressUpdate', handleCustomUpdate);
    };
  });
</script>

{#if mounted}
  <nav class="space-y-6">
    {#each sortedSections as { section, tutorials: sectionTutorials }}
      <div>
        <div class="text-text-secondary text-xs uppercase font-semibold mb-2 px-3">
          {section}
        </div>
        <div class="space-y-1">
          {#each sectionTutorials as tutorial}
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
          {/each}
        </div>
      </div>
    {/each}
  </nav>
{/if}
