<script lang="ts">
  import { onMount } from 'svelte';
  import { isTutorialComplete, clearAllProgress } from '../utils/progress';

  export let tutorials: any[] = [];

  let mounted = false;
  let completedCount = 0;
  let totalCount = 0;
  let sectionBreakdown: Array<{ section: string; completed: number; total: number }> = [];

  function calculateProgress() {
    totalCount = tutorials.length;
    completedCount = tutorials.filter(t => isTutorialComplete(t.slug)).length;

    // Calculate section-based breakdown
    const sections = new Map<string, { completed: number; total: number }>();

    tutorials.forEach(tutorial => {
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

    sectionBreakdown = Array.from(sections.entries()).map(([section, data]) => ({
      section,
      completed: data.completed,
      total: data.total
    }));
  }

  function handleStartOver() {
    if (confirm('Are you sure you want to reset all tutorial progress? This cannot be undone.')) {
      clearAllProgress();
      // Dispatch event to update other components
      window.dispatchEvent(new Event('tutorialProgressUpdate'));
      // Recalculate progress
      calculateProgress();
    }
  }

  onMount(() => {
    calculateProgress();
    mounted = true;

    // Listen for progress updates
    const handleUpdate = () => {
      calculateProgress();
    };
    window.addEventListener('tutorialProgressUpdate', handleUpdate);

    return () => {
      window.removeEventListener('tutorialProgressUpdate', handleUpdate);
    };
  });
</script>

{#if mounted}
  <div class="max-w-3xl mx-auto">
    <!-- Congratulations Header -->
    <div class="text-center mb-12">
      <div class="mb-6">
        <i class="fas fa-trophy text-6xl text-lime-green"></i>
      </div>
      <h1 class="text-4xl font-bold mb-4 text-text-primary">
        {#if completedCount === totalCount}
          Congratulations!
        {:else}
          Tutorial Progress
        {/if}
      </h1>
      <p class="text-xl text-text-secondary">
        {#if completedCount === totalCount}
          You've completed all {totalCount} tutorials in the dstack series.
        {:else}
          You've completed {completedCount} of {totalCount} tutorials.
        {/if}
      </p>
    </div>

    <!-- Progress Statistics -->
    <div class="bg-bg-card border border-border-default rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4 text-text-primary">Overall Progress</h2>
      <div class="flex items-center justify-between mb-2">
        <span class="text-text-secondary">Completion Rate</span>
        <span class="text-2xl font-bold text-cyber-blue">
          {Math.round((completedCount / totalCount) * 100)}%
        </span>
      </div>
      <div class="w-full bg-bg-deep rounded-full h-3">
        <div
          class="h-3 rounded-full transition-all duration-300 {completedCount === totalCount ? 'bg-lime-green' : 'bg-cyber-blue'}"
          style="width: {Math.round((completedCount / totalCount) * 100)}%"
        ></div>
      </div>
    </div>

    <!-- Section Breakdown -->
    {#if sectionBreakdown.length > 0}
      <div class="bg-bg-card border border-border-default rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-text-primary">Progress by Section</h2>
        <div class="space-y-4">
          {#each sectionBreakdown as { section, completed, total }}
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-text-primary">{section}</span>
                <span class="text-sm text-text-secondary">{completed}/{total}</span>
              </div>
              <div class="w-full bg-bg-deep rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300 {completed === total ? 'bg-lime-green' : 'bg-cyber-purple'}"
                  style="width: {Math.round((completed / total) * 100)}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="/"
        class="px-6 py-3 bg-cyber-blue text-white rounded-lg hover:bg-cyber-blue/80 transition-colors text-center font-medium"
      >
        <i class="fas fa-home mr-2"></i>
        Back to Home
      </a>
      <button
        on:click={handleStartOver}
        class="px-6 py-3 bg-bg-card border border-border-default text-text-primary rounded-lg hover:bg-bg-deep transition-colors font-medium"
      >
        <i class="fas fa-redo mr-2"></i>
        Start Over
      </button>
    </div>

    {#if completedCount === totalCount}
      <!-- Completion Message -->
      <div class="mt-12 text-center">
        <p class="text-text-secondary">
          Ready for more? Check out the dstack documentation for advanced topics and best practices.
        </p>
      </div>
    {/if}
  </div>
{/if}
