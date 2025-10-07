<script>
  import { onMount } from 'svelte';
  
  export let size = 200;
  export let duration = 15;
  export let borderWidth = 1.5;
  export let colorFrom = "#ffaa40";
  export let colorTo = "#9c40ff";
  export let delay = 0;
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

{#if mounted}
  <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
    <div
      class="animate-border-beam absolute aspect-square rounded-full"
      style="
        width: calc(var(--size) * 1px);
        height: calc(var(--size) * 1px);
        background: linear-gradient(90deg, transparent, {colorFrom}, {colorTo}, transparent);
        animation-delay: {delay}s;
        animation-duration: {duration}s;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
      "
    ></div>
  </div>
{/if}

<style>
  @keyframes border-beam {
    0% {
      transform: translateX(-50%) translateY(-50%) rotate(0deg);
    }
    100% {
      transform: translateX(-50%) translateY(-50%) rotate(360deg);
    }
  }
  
  .animate-border-beam {
    animation: border-beam linear infinite;
  }
</style>