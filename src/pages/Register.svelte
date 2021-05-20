<script lang="ts">
  import { Navigate, navigateTo } from 'svelte-router-spa'
  import { Envelope } from 'svelte-bootstrap-icons/lib/Envelope'
  import { Person } from 'svelte-bootstrap-icons/lib/Person'
  import { createStore } from 'effector'

  import { register, registerFx } from '../store/auth'

  let email: string = ''
  let nickname: string = ''

  const disabled = registerFx.pending
  const errorStore = createStore<string>('', { name: 'errorStore' }).on(
    registerFx.failData,
    (_, err) => err.message,
  )

  function submit() {
    email = email.trim()
    nickname = nickname.trim()
    if (!email || !nickname) {
      return
    }
    register({ email, nickname })
  }
</script>

<form on:submit|preventDefault={submit}>
  {#if $errorStore}
    <span class="is-size-3 has-text-danger">{$errorStore}</span>
  {/if}
  <fieldset disabled={$disabled}>
    <div class="field">
      <label for="email" class="label">Email</label>
      <div class="control has-icons-left">
        <input
          type="email"
          class="input"
          id="email"
          placeholder="mail@example.com"
          required
          bind:value={email}
        />
        <span class="icon is-small is-left">
          <Envelope />
        </span>
      </div>
    </div>

    <div class="field">
      <label for="nickname" class="label">Nickname</label>
      <div class="control has-icons-left">
        <input
          type="text"
          class="input"
          id="nickname"
          placeholder="nickname"
          required
          bind:value={nickname}
        />
        <span class="icon is-small is-left">
          <Person />
        </span>
      </div>
    </div>

    <div class="field is-grouped is-grouped-right">
      <div class="control">
        <Navigate to="/login" styles="button is-link is-light">Login</Navigate>
      </div>
      <div class="control">
        <button class="button is-link" type="submit">Submit</button>
      </div>
    </div>
  </fieldset>
</form>
