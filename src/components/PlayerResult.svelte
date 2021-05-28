<script lang="ts">
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
      <li>Final score: {player.finalScore}</li>
      <li>Hint score: {player.hintScore}</li>
      <li>RP score: {player.rpScore}</li>
    </ul>
  </div>
</div>
