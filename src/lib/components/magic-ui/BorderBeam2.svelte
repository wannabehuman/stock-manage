<script>
  import { onMount } from 'svelte';
  
  export let duration = 15;
  export let colorFrom = "#a57b49";
  export let colorTo = "#d4a574";
  export let borderWidth = 2;
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

{#if mounted}
  <div 
    class="beam-border"
    style="
      --duration: {duration}s;
      --color-from: {colorFrom};
      --color-to: {colorTo};
      --border-width: {borderWidth}px;
    "
  ></div>
{/if}

<style>
  .beam-border {
    position: absolute;
    inset: -2px;
    border-radius: 0.5rem;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      var(--color-from) 90deg,
      var(--color-to) 180deg,
      var(--color-from) 270deg,
      transparent 360deg
    );
    animation: beam-rotate var(--duration) linear infinite;
    pointer-events: none;
    z-index: -1;
  }
  
  @keyframes beam-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>