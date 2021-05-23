<script lang="ts">
  import { notificationApi, notifications } from '../store/notification'
</script>

<div class="notifications ml-3 mb-3">
  {#each $notifications as nt, i (i)}
    <div class="notification is-{nt.type}">
      <button class="delete" on:click={() => notificationApi.remove(i)} />
      <span class="is-size-5">{nt.text}</span>
    </div>
  {/each}
</div>

<style>
  .notifications {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999;
  }
</style>
