<script lang="ts">
  import { onMount } from 'svelte';
  import { loadProgress } from '../utils/progress';
  import {
    buildTutorialMap,
    findNearestIncompletePrerequisite,
    type TutorialInfo
  } from '../utils/prerequisites';

  // Props passed from Astro
  export let prerequisites: string[] = [];
  export let allTutorials: TutorialInfo[] = [];

  let nearestIncomplete: TutorialInfo | null = null;
  let isLoading = true;

  onMount(() => {
    updatePrerequisiteDisplay();

    // Listen for progress updates from other components
    window.addEventListener('tutorialProgressUpdate', updatePrerequisiteDisplay);

    return () => {
      window.removeEventListener('tutorialProgressUpdate', updatePrerequisiteDisplay);
    };
  });

  function updatePrerequisiteDisplay() {
    const progress = loadProgress();
    const tutorialMap = buildTutorialMap(allTutorials);
    nearestIncomplete = findNearestIncompletePrerequisite(prerequisites, tutorialMap, progress);
    isLoading = false;
  }
</script>

{#if isLoading}
  <!-- Show nothing while loading to prevent flash -->
{:else if nearestIncomplete}
  <div class="mb-8 p-6 bg-bg-card border border-border-default rounded-lg">
    <h2 class="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
      <i class="fa-solid fa-list-check text-lime-green"></i>
      Prerequisites
    </h2>
    <p class="text-text-secondary mb-4">
      Complete these tutorials before starting this one:
    </p>
    <a
      href={`/tutorial/${nearestIncomplete.slug}`}
      class="prerequisite-link flex items-start gap-3 p-3 rounded-lg border border-lime-green bg-bg-space transition-all duration-200"
    >
      <i class="fa-solid fa-arrow-right text-lime-green mt-1 transition-transform duration-200"></i>
      <div class="flex-1">
        <div class="font-semibold text-lime-green transition-colors">
          {nearestIncomplete.title}
        </div>
        <div class="text-sm text-text-secondary mt-1">
          {nearestIncomplete.description}
        </div>
        {#if nearestIncomplete.estimatedTime}
          <div class="text-xs text-cyber-blue mt-1 flex items-center gap-1">
            <i class="fa-solid fa-clock"></i>
            {nearestIncomplete.estimatedTime}
          </div>
        {/if}
      </div>
    </a>
  </div>
{/if}

<style>
  .prerequisite-link {
    text-decoration: none !important;
  }

  .prerequisite-link:hover {
    transform: translateX(4px);
    text-decoration: none !important;
  }

  .prerequisite-link:hover i.fa-arrow-right {
    transform: translateX(4px);
  }

  /* Ensure no underline on any nested elements */
  .prerequisite-link * {
    text-decoration: none !important;
  }
</style>
