<script lang="ts">
  import { Shuffle } from 'svelte-bootstrap-icons/lib/Shuffle'
  import { DoorOpen } from 'svelte-bootstrap-icons/lib/DoorOpen'
  import { Cpu } from 'svelte-bootstrap-icons/lib/Cpu'
  import { DoorClosed } from 'svelte-bootstrap-icons/lib/DoorClosed'
  import { Play } from 'svelte-bootstrap-icons/lib/Play'
  import { t } from 'svelte-i18n'

  import {
    createGameWithBot,
    joinCurrentGame,
    updateCurrentGameFx,
    currentGame,
    joinClosedGame,
    createClosedGame,
    createGameWithRandom,
  } from '../store/game'

  const waitCurrentGame = updateCurrentGameFx.pending
  let joinClosedModal: HTMLElement
  let joinCode: string = ''

  function joinSubmit() {
    joinClosedModal.classList.remove('is-acitve')
    joinClosedGame(joinCode)
    joinCode = ''
  }
</script>

<div class="columns is-centered">
  <div class="column is-half">
    <button
      disabled={$waitCurrentGame || !$currentGame}
      class="button is-fullwidth mb-3 is-large is-primary"
      on:click={() => joinCurrentGame()}
    >
      <span class="icon"><Play /></span>
      <span>{$t('home.resume')}</span>
    </button>
    <fieldset disabled={$waitCurrentGame || $currentGame}>
      <button
        class="button is-fullwidth mb-3 is-large is-primary"
        on:click={() => createGameWithRandom()}
      >
        <span class="icon"><Shuffle /></span>
        <span>{$t('home.random')}</span>
      </button>
      <button
        class="button is-fullwidth mb-3 is-large is-primary"
        on:click={() => createGameWithBot()}
      >
        <span class="icon">
          <Cpu />
        </span>
        <span>{$t('home.bot')}</span></button
      >
      <button
        class="button is-fullwidth mb-3 is-large is-primary"
        on:click={() => createClosedGame()}
      >
        <span class="icon">
          <DoorClosed />
        </span>
        <span>{$t('home.create-closed')}</span></button
      >
      <button
        class="button is-fullwidth mb-3 is-large is-primary"
        on:click={() => joinClosedModal.classList.toggle('is-active')}
      >
        <span class="icon">
          <DoorOpen />
        </span>
        <span>{$t('home.connect-closed')}</span></button
      >
    </fieldset>
  </div>
</div>

<div class="modal" bind:this={joinClosedModal}>
  <div class="modal-background" />
  <div class="modal-content notification">
    <form on:submit|preventDefault={joinSubmit} autocomplete="off">
      <div class="field">
        <label class="label" for="code-input">Label</label>
        <div class="control">
          <input
            autocomplete="off"
            id="code-input"
            class="input has-text-centered"
            type="text"
            placeholder="XXXX"
            required
            pattern="[A-Z]{'{4}'}"
            bind:value={joinCode}
          />
        </div>
        <p class="help">Code was sended to game creator</p>
      </div>
      <div class="field is-grouped is-grouped-right">
        <div class="control">
          <button type="submit" class="button is-primary">Join</button>
        </div>
      </div>
    </form>
  </div>
  <button
    class="modal-close is-large"
    aria-label="close"
    on:click={() => joinClosedModal.classList.remove('is-active')}
  />
</div>
