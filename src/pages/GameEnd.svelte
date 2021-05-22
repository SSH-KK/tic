<script lang="ts">
  import { Navigate } from 'svelte-router-spa'

  import { gameStatus, GameStatus } from '../store/game'
</script>

{#if $gameStatus === GameStatus.ended}
  <div class="columns is-centered">
    <div class="column is-half">
      <div class="notification">
        <span class="is-size-3">Game end</span>
      </div>
    </div>
  </div>
{:else}
  <div class="columns is-centered">
    <div class="column is-half">
      <div
        class="notification is-info is-flex is-align-items-center is-flex-direction-column"
      >
        <div
          class="notification is-info is-flex is-align-items-center is-flex-direction-column"
        >
          <div class="mb-2">
            <span class="is-size-3"
              >{$gameStatus === GameStatus.notStarted
                ? 'No current game'
                : 'Game is running'}</span
            >
          </div>
          {#if $gameStatus === GameStatus.notStarted}
            <Navigate to="/" styles="button is-primary">Go home</Navigate>
          {:else}
            <Navigate to="/game" styles="button is-primary"
              >Resume game</Navigate
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
