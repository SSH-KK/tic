<script lang="ts">
  import { t } from 'svelte-i18n'
  import { Navigate } from 'svelte-router-spa'
  import PlayerResult from '../components/PlayerResult.svelte'

  import { gameStatus, GameStatus } from '../store/game'
  import { endResult } from '../store/game/end'
</script>

{#if $endResult}
  <div class="columns">
    <div class="column is-half has-text-centered has-text-weight-semibold">
      <span class="title is-2">{$t('white')}</span>
    </div>
    <div class="column is-half has-text-centered has-text-weight-semibold">
      <span class="title is-2">{$t('black')}</span>
    </div>
  </div>
  <div class="columns">
    {#if $endResult.winnerColor === 'black'}
      <div class="column is-half is-size-1 heading">{$t('winner')}</div>
    {/if}
    <div class="column is-half">
      <PlayerResult player={$endResult.winner} />
    </div>
    <div class="column is-half is-size-1 heading">{$t('winner')}</div>
  </div>
  <hr />
  <div class="columns">
    {#if $endResult.winnerColor === 'white'}
      <div class="column is-half is-size-1 heading">{$t('loser')}</div>
    {/if}
    <div class="column is-half">
      <PlayerResult player={$endResult.loser} />
    </div>
    <div class="column is-half is-size-1 heading">{$t('loser')}</div>
  </div>
  <Navigate to="/" styles="button is-primary is-fullwidth"
    >{$t('game.gohome')}</Navigate
  >
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
                ? $t('game.nocurrent')
                : $t('game.isrunning')}</span
            >
          </div>
          {#if $gameStatus === GameStatus.notStarted}
            <Navigate to="/" styles="button is-primary"
              >{$t('game.gohome')}</Navigate
            >
          {:else}
            <Navigate to="/game" styles="button is-primary"
              >{$t('home.resume')}</Navigate
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .heading {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
