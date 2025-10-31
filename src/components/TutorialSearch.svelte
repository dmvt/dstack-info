<script lang="ts">
  import { onMount } from 'svelte';

  export let tutorials: any[];

  let searchQuery = '';
  let searchResults: any[] = [];
  let showResults = false;
  let mounted = false;

  $: if (searchQuery.trim().length > 0) {
    // Filter tutorials by title, description, or tags
    searchResults = tutorials.filter(tutorial => {
      const query = searchQuery.toLowerCase();
      const titleMatch = tutorial.data.title.toLowerCase().includes(query);
      const descMatch = tutorial.data.description?.toLowerCase().includes(query);
      const tagsMatch = tutorial.data.tags?.some((tag: string) =>
        tag.toLowerCase().includes(query)
      );
      return titleMatch || descMatch || tagsMatch;
    });
    showResults = true;
  } else {
    searchResults = [];
    showResults = false;
  }

  function handleFocus() {
    if (searchQuery.trim().length > 0) {
      showResults = true;
    }
  }

  function handleBlur() {
    // Delay to allow click on results
    setTimeout(() => {
      showResults = false;
    }, 200);
  }

  onMount(() => {
    mounted = true;
  });
</script>

{#if mounted}
  <div class="relative mb-6">
    <div class="relative">
      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm"></i>
      <input
        type="text"
        bind:value={searchQuery}
        on:focus={handleFocus}
        on:blur={handleBlur}
        placeholder="Search tutorials..."
        class="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-default rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-cyber-blue transition-colors"
      />
    </div>

    {#if showResults && searchResults.length > 0}
      <div class="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border-default rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
        {#each searchResults as result}
          <a
            href="/tutorial/{result.slug}"
            class="block px-4 py-3 hover:bg-bg-deep transition-colors border-b border-border-default last:border-b-0"
          >
            <div class="text-sm font-medium text-text-primary mb-1">
              {result.data.title}
            </div>
            {#if result.data.description}
              <div class="text-xs text-text-secondary line-clamp-2">
                {result.data.description}
              </div>
            {/if}
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-text-secondary">
                {result.data.section}
              </span>
              <span class="text-text-secondary">·</span>
              <span class="text-xs text-text-secondary">
                Step {result.data.stepNumber}
              </span>
            </div>
          </a>
        {/each}
      </div>
    {/if}

    {#if showResults && searchQuery.trim().length > 0 && searchResults.length === 0}
      <div class="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border-default rounded-lg shadow-lg p-4 z-50">
        <p class="text-sm text-text-secondary text-center">
          No tutorials found for "{searchQuery}"
        </p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
