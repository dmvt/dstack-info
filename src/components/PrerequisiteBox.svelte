<script lang="ts">
  import { onMount } from 'svelte';
  import { loadProgress } from '../utils/progress';
  import {
    buildTutorialMap,
    collectAllIncompletePrerequisites,
    type TutorialInfo,
    type IncompletePrerequisites
  } from '../utils/prerequisites';

  // Props passed from Astro
  export let prerequisites: string[] = [];
  export let allTutorials: TutorialInfo[] = [];

  let incompletePrereqs: IncompletePrerequisites | null = null;
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
    incompletePrereqs = collectAllIncompletePrerequisites(prerequisites, tutorialMap, progress);
    isLoading = false;
  }
</script>

{#if isLoading}
  <!-- Show nothing while loading to prevent flash -->
{:else if incompletePrereqs}
  <div class="mb-8 p-6 bg-bg-card border border-border-default rounded-lg">
    <h2 class="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
      <i class="fa-solid fa-list-check text-lime-green"></i>
      Prerequisites
    </h2>
    <p class="text-text-secondary mb-4">
      Complete {incompletePrereqs.others.length > 0 ? 'these tutorials' : 'this tutorial'} before starting this one:
    </p>

    <!-- Primary prerequisite - most prominent -->
    <a
      href={`/tutorial/${incompletePrereqs.primary.slug}`}
      class="prerequisite-link primary flex items-start gap-3 p-3 rounded-lg border border-lime-green bg-bg-space transition-all duration-200"
    >
      <i class="fa-solid fa-arrow-right text-lime-green mt-1 transition-transform duration-200"></i>
      <div class="flex-1">
        <div class="font-semibold text-lime-green transition-colors">
          {incompletePrereqs.primary.title}
        </div>
        <div class="text-sm text-text-secondary mt-1">
          {incompletePrereqs.primary.description}
        </div>
        {#if incompletePrereqs.primary.estimatedTime}
          <div class="text-xs text-cyber-blue mt-1 flex items-center gap-1">
            <i class="fa-solid fa-clock"></i>
            {incompletePrereqs.primary.estimatedTime}
          </div>
        {/if}
      </div>
    </a>

    <!-- Other incomplete prerequisites - less prominent -->
    {#if incompletePrereqs.others.length > 0}
      <div class="mt-4 pt-4 border-t border-border-default">
        <p class="text-xs text-text-tertiary mb-2 uppercase tracking-wide">Also required</p>
        <div class="space-y-2">
          {#each incompletePrereqs.others as other}
            <a
              href={`/tutorial/${other.slug}`}
              class="prerequisite-link secondary flex items-center gap-2 p-2 rounded border border-border-default hover:border-text-tertiary transition-all duration-200"
            >
              <i class="fa-solid fa-circle text-text-tertiary text-[6px]"></i>
              <span class="text-sm text-text-secondary hover:text-text-primary transition-colors">
                {other.title}
              </span>
              {#if other.estimatedTime}
                <span class="text-xs text-text-tertiary ml-auto">
                  {other.estimatedTime}
                </span>
              {/if}
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .prerequisite-link {
    text-decoration: none !important;
  }

  .prerequisite-link.primary:hover {
    transform: translateX(4px);
  }

  .prerequisite-link.primary:hover i.fa-arrow-right {
    transform: translateX(4px);
  }

  .prerequisite-link.secondary:hover {
    transform: translateX(2px);
  }

  /* Ensure no underline on any nested elements */
  .prerequisite-link * {
    text-decoration: none !important;
  }
</style>
