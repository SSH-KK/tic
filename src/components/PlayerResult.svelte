<script lang="ts">
  import { t } from 'svelte-i18n'

  import type { User } from '../types/user'

  export let player: {
    user: User
    finalScore: number
    hintScore: number
    rpScore: number
  }
</script>

<div class="card">
  <div class="card-content">
    <span class="subtitle is-1">{player.user.nickname}</span>
    <ul>
      <li>{$t('game.score.final')}: {player.finalScore}</li>
      <li>{$t('game.score.hint')}: {player.hintScore}</li>
      <li>{$t('game.score.rp')}: {player.rpScore}</li>
    </ul>
  </div>
</div>
