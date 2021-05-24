<script lang="ts">
  import { Navigate } from 'svelte-router-spa'
  import dayjs from 'dayjs'
  import { CaretUp } from 'svelte-bootstrap-icons/lib/CaretUp'
  import { Controller } from 'svelte-bootstrap-icons/lib/Controller'

  import Board from '../components/Board.svelte'

  import {
    gameStatus,
    GameStatus,
    gameSummary,
    blackTimer,
    whiteTimer,
    locking,
    board,
  } from '../store/game'
  import { pass, resign } from '../store/game/action'
  import { selectedCoords, selectedApi } from '../store/game/ui'
  import { bestMove, bestMoveFx } from '../store/game/hints/bestMove'
  import { boardApi } from '../store/game/board'

  const bestMoveFxPending = bestMoveFx.pending
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
        {#if $board.leelaHints.length}
          <div class="level-item">
            <button class="button" on:click={() => boardApi.clearLeelaHints()}
              >Clear hints</button
            >
          </div>
        {/if}
        {#if $selectedCoords.size}
          <div class="level-item">
            <button class="button" on:click={() => selectedApi.clear()}
              >Clear selection</button
            >
          </div>
        {/if}
        <div class="level-item">
          <div class="dropdown is-up is-right is-hoverable">
            <div class="dropdown-trigger">
              <button class="button">
                <span class="icon is-small"><Controller /></span>
                Leela
                <span class="icon is-small">
                  <CaretUp />
                </span>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  class="dropdown-item"
                  on:click={() => bestMove()}
                  disabled={$bestMoveFxPending}
                >
                  Best move
                </a>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="dropdown-item"> Best quarter </a>
                <hr class="dropdown-divider" />
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="dropdown-item"> Heatmap </a>
              </div>
            </div>
          </div>
        </div>
        <div class="level-item">
          <span
            class="is-size-3 timer"
            class:has-text-primary={$blackTimer.isActive}
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
  .timer {
    min-width: 3em;
    text-align: center;
  }

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
