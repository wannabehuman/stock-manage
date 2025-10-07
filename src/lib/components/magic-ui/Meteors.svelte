<script>
  export let number = 20;
  
  function generateMeteors(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 3 + 2
    }));
  }
  
  $: meteors = generateMeteors(number);
</script>

<div class="meteors-container">
  {#each meteors as meteor (meteor.id)}
    <span
      class="meteor"
      style="
        left: {meteor.left}%;
        animation-delay: {meteor.animationDelay}s;
        animation-duration: {meteor.animationDuration}s;
      "
    ></span>
  {/each}
</div>

<style>
  .meteors-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }
  
  .meteor {
    position: absolute;
    top: -10px;
    width: 2px;
    height: 2px;
    background: linear-gradient(45deg, #60a5fa, #3b82f6);
    border-radius: 50%;
    animation: meteor-fall linear infinite;
    opacity: 0;
  }
  
  .meteor::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #60a5fa, transparent);
    transform: rotate(45deg);
    transform-origin: right;
  }
  
  @keyframes meteor-fall {
    0% {
      transform: translateY(-100vh) translateX(-100px);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) translateX(100px);
      opacity: 0;
    }
  }
</style>