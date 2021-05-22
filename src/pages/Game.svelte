<script lang="ts">
  import { Navigate } from 'svelte-router-spa'

  import { gameStatus, GameStatus } from '../store/game'
  import { resign } from '../store/game/action'
</script>

<div class="container mt-3">
  {#if $gameStatus === GameStatus.notStarted}
    <div class="columns is-centered">
      <div class="is-half column">
        <div
          class="notification is-info is-flex is-align-items-center is-flex-direction-column"
        >
          <div class="mb-2">
            <span class="is-size-3">No current game</span>
          </div>
          <Navigate to="/" styles="button is-primary">Go home</Navigate>
        </div>
      </div>
    </div>
  {:else if $gameStatus === GameStatus.waiting}
    <div class="columns is-centered">
      <div class="is-half column">
        <div
          class="notification is-info is-flex is-align-items-center is-flex-direction-column"
        >
          <span class="is-size-3">Waiting game</span>
        </div>
      </div>
    </div>
  {:else if $gameStatus === GameStatus.running}
    <div class="columns is-centered">
      <div class="is-half column">
        <div
          class="notification is-info is-flex is-align-items-center is-flex-direction-column"
        >
          <div
            class="notification is-info is-flex is-align-items-center is-flex-direction-column"
          >
            <div class="mb-2">
              <span class="is-size-3">Game is running</span>
            </div>
            <button class="button is-danger" on:click={() => resign()}
              >Resign</button
            >
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
