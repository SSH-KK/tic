<script lang="ts">
  import { Router } from 'svelte-router-spa'
  import { get } from 'svelte/store'

  import Base from './layouts/Base.svelte'
  import Login from './pages/Login.svelte'
  import Register from './pages/Register.svelte'
  import Home from './pages/Home.svelte'
  import Game from './pages/Game.svelte'
  import GameEnd from './pages/GameEnd.svelte'

  import { auth } from './store/auth'

  const routes = [
    {
      name: '/login',
      component: Login,
      layout: Base,
    },
    {
      name: '/register',
      component: Register,
      layout: Base,
    },
    {
      name: '/end',
      onlyIf: { guard: () => get(auth) !== null, redirect: '/login' },
      component: GameEnd,
      layout: Base,
    },
    {
      name: '/game',
      onlyIf: { guard: () => get(auth) !== null, redirect: '/login' },
      component: Game,
      layout: Base,
    },
    {
      name: '/',
      onlyIf: { guard: () => get(auth) !== null, redirect: '/login' },
      component: Home,
      layout: Base,
    },
  ]
</script>

<Router {routes} />
