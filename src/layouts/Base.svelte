<script lang="ts">
  import { Route, Navigate } from 'svelte-router-spa'
  import Notifications from '../components/Notifications.svelte'

  import { logout } from '../store/auth'
  import { self } from '../store/self'

  export let currentRoute: any
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
              <span class="button is-primary is-light">{$self.nickname}</span>
              <button class="button is-light" on:click={() => logout()}>
                Logout
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
