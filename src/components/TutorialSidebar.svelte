<script lang="ts">
  import { onMount } from 'svelte';
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

  // Sort tutorials within each section by stepNumber
  $: sortedSections = Object.entries(tutorialsBySection).map(([section, tutList]) => ({
    section,
    tutorials: tutList.sort((a, b) => a.data.stepNumber - b.data.stepNumber)
  }));

  onMount(() => {
    // Load completion status for all tutorials
    tutorials.forEach(tutorial => {
      completionStatus[tutorial.slug] = isTutorialComplete(tutorial.slug);
    });
    mounted = true;
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
                {tutorial.data.stepNumber}. {tutorial.data.title}
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
