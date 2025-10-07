<script>
  import { createEventDispatcher } from 'svelte';
  
  export let className = '';
  export let shimmerColor = '#ffffff';
  export let shimmerSize = '0.05em';
  export let shimmerDuration = '3s';
  export let borderRadius = '100px';
  export let background = 'linear-gradient(110deg, #000103 45%, #1e2631 55%, #000103)';
  export let disabled = false;
  export let type = 'button';
  
  const dispatch = createEventDispatcher();
  
  function handleClick(event) {
    if (!disabled) {
      dispatch('click', event);
    }
  }
</script>

<button
  {type}
  {disabled}
  class="inline-flex h-12 items-center justify-center rounded-lg border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 px-6 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 {className}"
  style="
    background: {background};
    border-radius: {borderRadius};
    --shimmer-color: {shimmerColor};
    --shimmer-size: {shimmerSize};
    --shimmer-duration: {shimmerDuration};
  "
  class:disabled
  on:click={handleClick}
>
  <span class="relative z-10 flex items-center gap-2">
    <slot />
  </span>
  
  <!-- Shimmer effect -->
  <div class="shimmer-overlay"></div>
</button>

<style>
  .shimmer-overlay {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      110deg,
      transparent 25%,
      var(--shimmer-color) 50%,
      transparent 75%
    );
    opacity: 0;
    animation: shimmer var(--shimmer-duration) ease-in-out infinite;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  button:hover .shimmer-overlay {
    opacity: 0;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  button:disabled .shimmer-overlay {
    display: none;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>