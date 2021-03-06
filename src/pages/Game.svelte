<script lang="ts">
  import { Navigate, navigateTo } from 'svelte-router-spa'
  import dayjs from 'dayjs'
  import mousetrap from 'svelte-use-mousetrap'
  import { CaretUp } from 'svelte-bootstrap-icons/lib/CaretUp'
  import { CaretDown } from 'svelte-bootstrap-icons/lib/CaretDown'
  import { Gear } from 'svelte-bootstrap-icons/lib/Gear'
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
    boardApi,
  } from '../store/game'
  import { pass, resign } from '../store/game/action'
  import { selectedCoords, selectedApi } from '../store/game/ui'
  import { bestMove, bestMoveFx } from '../store/game/hints/bestMove'
  import { bestQuarter, bestQuarterFx } from '../store/game/hints/bestQuarter'
  import { heatmap, heatmapFx } from '../store/game/hints/heatmap'

  import Statusbar from '../components/Statusbar.svelte'
  import { notificationApi } from '../store/notification'
  import { derived } from 'svelte/store'
  import { t } from 'svelte-i18n'

  const hintPending = derived(
    [bestMoveFx.pending, bestQuarterFx.pending, heatmapFx.pending],
    values => values.filter(val => val).length > 0,
  )

  let showStatusbar = true

  function bestQuarterHandler() {
    if (!$selectedCoords.size && !$hintPending) bestQuarter()
  }

  function heatmapHandler() {
    if (!$hintPending) heatmap()
  }

  function bestMoveHandler() {
    if (!$hintPending) bestMove()
  }
</script>

{#if $gameStatus === GameStatus.notStarted}
  <div class="mt-3 columns is-centered">
    <div class="is-half column">
      <div
        class="notification is-info is-flex is-align-items-center is-flex-direction-column"
      >
        <div class="mb-2">
          <span class="is-size-3">{$t('game.nocurrent')}</span>
        </div>
        <Navigate to="/" styles="button is-primary"
          >{$t('game.gohome')}</Navigate
        >
      </div>
    </div>
  </div>
{:else if $gameStatus === GameStatus.waiting}
  <div class="mt-3 columns is-centered">
    <div class="is-half column">
      <div class="notification is-info">
        <span class="is-size-3">{$t('game.wait')}</span>
        <button
          class="button is-primary is-pulled-right is-medium"
          on:click={() => {
            resign()
            navigateTo('/')
          }}>{$t('cancel')}</button
        >
      </div>
    </div>
  </div>
{:else if $gameStatus === GameStatus.running}
  <div
    use:mousetrap={[
      [['q'], bestMoveHandler],
      [['w'], bestQuarterHandler],
      [['e'], heatmapHandler],
      [['u'], boardApi.toggleShowProbabilityMap],
      [['i'], () => (showStatusbar = !showStatusbar)],
      [['a'], boardApi.clearLeelaHints],
      [['s'], selectedApi.clear],
      [['d'], notificationApi.removeLast],
      [['D'], notificationApi.clear],
      [['p'], pass],
      [['g'], boardApi.useHint],
    ]}
    class="wrapper"
  >
    <div class="level mb-0">
      <div class="level-left">
        <div class="level-item">
          <span class="is-size-4" class:has-text-primary={$whiteTimer.isActive}
            >{$t('white')}: {$gameSummary.white.nickname}</span
          >
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <div class="dropdown is-right is-hoverable">
            <div class="dropdown-trigger">
              <button class="button">
                <span class="icon is-small"><Gear /></span>
                {$t('game.settings.title')}
                <span class="icon is-small"><CaretDown /></span>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  class="dropdown-item"
                  on:click={() => boardApi.toggleShowProbabilityMap()}
                >
                  {$board.showProbabilityMap
                    ? $t('game.settings.hide')
                    : $t('game.settings.show')}
                  {$t('game.settings.territory')} (U)
                </a>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  class="dropdown-item"
                  on:click={() => (showStatusbar = !showStatusbar)}
                >
                  {showStatusbar
                    ? $t('game.settings.hide')
                    : $t('game.settings.show')}
                  {$t('game.settings.statusbar')} (I)
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="level-item">
          <span
            class="is-size-3 timer"
            class:has-text-primary={$whiteTimer.isActive}
            >{dayjs($whiteTimer.leftTime).format('mm:ss')}</span
          >
        </div>
        <div class="level-item">
          <button class="button is-danger is-outlined" on:click={() => resign()}
            >{$t('game.resign')}</button
          >
        </div>
      </div>
    </div>
    {#if showStatusbar}
      <Statusbar />
    {/if}
    <div class="board-wrapper">
      <Board />
    </div>
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <span class="is-size-4" class:has-text-primary={$blackTimer.isActive}
            >{$t('black')}: {$gameSummary.black.nickname}</span
          >
        </div>
      </div>
      <div class="level-right">
        {#if $board.leelaHints.length}
          <div class="level-item">
            <button class="button" on:click={() => boardApi.clearLeelaHints()}
              >{$t('game.clear.hints')} (A)</button
            >
          </div>
        {/if}
        {#if $selectedCoords.size}
          <div class="level-item">
            <button class="button" on:click={() => selectedApi.clear()}
              >{$t('game.clear.selection')} (S)</button
            >
          </div>
        {/if}
        <div class="level-item">
          <div class="dropdown is-up is-right is-hoverable">
            <div class="dropdown-trigger">
              <button class="button" class:is-loading={$hintPending}>
                <span class="icon is-small"><Controller /></span>
                {$t('game.hints.title')}
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
                  class:has-text-grey={$hintPending}
                  on:click={bestMoveHandler}
                >
                  {$t('game.hints.bestMove')} (Q)
                </a>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  class="dropdown-item"
                  class:has-text-grey={$selectedCoords.size || $hintPending}
                  on:click={bestQuarterHandler}
                  >{$t('game.hints.bestQuarter')} (W)</a
                >
                <hr class="dropdown-divider" />
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  class="dropdown-item"
                  class:has-text-grey={$hintPending}
                  on:click={heatmapHandler}>{$t('game.hints.heatmap')} (E)</a
                >
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
            on:click={() => pass()}>{$t('game.pass')} (P)</button
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
