<script lang="ts">
  import { statusbar } from '../store/game'

  let inner: HTMLElement

  statusbar.watch(state => {
    if (!inner) return
    inner.style.height = `calc(${state * 100}% - 0.5rem)`
  })
</script>

<div class="background">
  <div class="value" bind:this={inner} />
</div>

<style>
  div {
    border-radius: 4px;
  }

  .background {
    background-color: #4a4a4a;
    position: absolute;
    left: 0.75rem;
    top: calc(5vh + 0.75rem);
    bottom: calc(5vh + 0.75rem);
    width: 3vw;
  }

  .value {
    position: absolute;
    top: 0;
    left: 0;

    margin: 0.25rem;

    width: calc(100% - 0.5rem);
    height: calc(50% - 0.5rem);

    background-color: #f0f0f0;
  }
</style>
