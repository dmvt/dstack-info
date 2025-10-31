<script lang="ts">
  import { onMount } from 'svelte';
  import {
    isTutorialComplete,
    markTutorialComplete,
    markTutorialIncomplete,
  } from '../utils/progress';

  export let tutorialSlug: string;

  let isComplete = false;
  let mounted = false;

  onMount(() => {
    // Load completion status from localStorage
    isComplete = isTutorialComplete(tutorialSlug);
    mounted = true;
  });

  function toggleComplete() {
    if (isComplete) {
      markTutorialIncomplete(tutorialSlug);
      isComplete = false;
    } else {
      markTutorialComplete(tutorialSlug);
      isComplete = true;
    }

    // Dispatch custom event to notify sidebar
    window.dispatchEvent(new CustomEvent('tutorialProgressUpdate'));
  }
</script>

{#if mounted}
  <div class="flex items-center justify-between p-6 bg-bg-card border border-border-default rounded-lg">
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-text-primary mb-1">
        {isComplete ? 'Tutorial Completed!' : 'Mark as Complete'}
      </h3>
      <p class="text-sm text-text-secondary">
        {isComplete
          ? 'Great job! You can uncheck this if you need to revisit.'
          : 'Check this box when you finish this tutorial.'}
      </p>
    </div>

    <button
      on:click={toggleComplete}
      class="ml-6 flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all duration-200 {isComplete
        ? 'bg-lime-green border-lime-green text-bg-space hover:bg-lime-green/90'
        : 'bg-transparent border-border-default hover:border-cyber-blue'}"
      aria-label={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {#if isComplete}
        <i class="fas fa-check text-2xl"></i>
      {/if}
    </button>
  </div>
{/if}
