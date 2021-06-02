<script lang="ts">
  import { Route, Navigate } from 'svelte-router-spa'
  import { locale, t } from 'svelte-i18n'
  import Notifications from '../components/Notifications.svelte'

  import { logout } from '../store/auth'
  import { self } from '../store/self'

  export let currentRoute: any

  function switchLocale() {
    if ($locale === 'ru') locale.set('en')
    else locale.set('ru')
  }
</script>

<Notifications />

<div class="content-wrapper">
  {#if currentRoute.path !== '/game'}
    <nav class="navbar mb-3" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <div class="navbar-item">
          <Navigate to="/" styles="button is-primary is-light">TIC</Navigate>
        </div>
      </div>
      {#if $self}
        <div class="navbar-end ">
          <div class="navbar-item">
            <div class="buttons">
              <button class="button is-primary is-light" on:click={switchLocale}
                >{$self.nickname}</button
              >
              <button class="button is-light" on:click={() => logout()}>
                {$t('logout')}
              </button>
            </div>
          </div>
        </div>
      {/if}
    </nav>
  {/if}
  <div class="content-wrapper px-3">
    <Route {currentRoute} params={{}} />
  </div>
</div>

<style>
  .content-wrapper {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
</style>
