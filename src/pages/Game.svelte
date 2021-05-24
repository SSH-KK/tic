<script lang="ts">
  import { Navigate } from 'svelte-router-spa'
  import dayjs from 'dayjs'

  import Board from '../components/Board.svelte'

  import {
    gameStatus,
    GameStatus,
    gameSummary,
    blackTimer,
    whiteTimer,
    locking,
  } from '../store/game'
  import { pass, resign } from '../store/game/action'
</script>

{#if $gameStatus === GameStatus.notStarted}
  <div class="mt-3 columns is-centered">
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
  <div class="mt-3 columns is-centered">
    <div class="is-half column">
      <div
        class="notification is-info is-flex is-align-items-center is-flex-direction-column"
      >
        <span class="is-size-3">Waiting game</span>
      </div>
    </div>
  </div>
{:else if $gameStatus === GameStatus.running}
  <div class="wrapper">
    <div class="level mb-0">
      <div class="level-left">
        <div class="level-item">
          <span class="is-size-4" class:has-text-primary={$whiteTimer.isActive}
            >White: {$gameSummary.white.nickname}</span
          >
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <span class="is-size-3" class:has-text-primary={$whiteTimer.isActive}
            >{dayjs($whiteTimer.leftTime).format('mm:ss')}</span
          >
        </div>
        <div class="level-item">
          <button class="button is-danger is-outlined" on:click={() => resign()}
            >Resign</button
          >
        </div>
      </div>
    </div>
    <div class="board-wrapper">
      <Board />
    </div>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <span class="is-size-4" class:has-text-primary={$blackTimer.isActive}
            >Black: {$gameSummary.black.nickname}</span
          >
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <span class="is-size-3" class:has-text-primary={$blackTimer.isActive}
            >{dayjs($blackTimer.leftTime).format('mm:ss')}</span
          >
        </div>
        <div class="level-item">
          <button
            disabled={$locking}
            class="button is-warning is-outlined"
            on:click={() => pass()}>Pass</button
          >
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
  }

  .level {
    height: 5vh;
  }

  .board-wrapper {
    width: 100vw;
    height: 90vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
