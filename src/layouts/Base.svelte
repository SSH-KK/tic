<script lang="ts">
  import { Route, Navigate, routeIsActive } from 'svelte-router-spa'
  import Notifications from '../components/Notifications.svelte'

  import { logout } from '../store/auth'
  import { self } from '../store/self'

  export let currentRoute: any
</script>

<Notifications />
<div>
  {#if !routeIsActive('/game')}
    <nav class="navbar" role="navigation" aria-label="main navigation">
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
  <div class="container mt-3">
    <Route {currentRoute} params={{}} />
  </div>
</div>
