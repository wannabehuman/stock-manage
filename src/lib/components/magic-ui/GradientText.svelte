<script>
  export let className = '';
  export let colors = ['#ffaa40', '#9c40ff', '#ffaa40'];
  export let animationSpeed = '3s';
  export let showAnimation = true;
</script>

<span 
  class="animate-gradient bg-gradient-to-r bg-clip-text text-transparent {className}"
  style="
    background-image: linear-gradient(45deg, {colors.join(', ')});
    background-size: 300% 300%;
    animation-duration: {animationSpeed};
    animation-play-state: {showAnimation ? 'running' : 'paused'};
  "
>
  <slot />
</span>

<style>
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .animate-gradient {
    animation: gradient var(--duration, 3s) ease infinite;
  }
</style>