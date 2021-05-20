<script lang="ts">
  import { Navigate, navigateTo } from 'svelte-router-spa'
  import { Envelope } from 'svelte-bootstrap-icons/lib/Envelope'
  import { Key } from 'svelte-bootstrap-icons/lib/Key'
  import { createStore } from 'effector'

  import { login, loginFx } from '../store/auth'

  let email: string = ''
  let password: string = ''

  const disabled = loginFx.pending
  const errorStore = createStore<string>('', { name: 'errorStore' }).on(
    loginFx.failData,
    (_, err) => err.message,
  )

  function submit() {
    email = email.trim()
    password = password.trim()
    if (!email || !password) {
      return
    }
    login({ email, password })
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
      <label for="password" class="label">Password</label>
      <div class="control has-icons-left">
        <input
          type="password"
          class="input"
          id="password"
          placeholder="password"
          required
          bind:value={password}
        />
        <span class="icon is-small is-left">
          <Key />
        </span>
      </div>
    </div>

    <div class="field is-grouped is-grouped-right">
      <div class="control">
        <Navigate to="/register" styles="button is-link is-light"
          >Register</Navigate
        >
      </div>
      <div class="control">
        <button class="button is-link" type="submit">Submit</button>
      </div>
    </div>
  </fieldset>
</form>
