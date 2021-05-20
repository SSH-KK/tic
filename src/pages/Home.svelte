<script lang="ts">
  import { Shuffle } from 'svelte-bootstrap-icons/lib/Shuffle'
  import { DoorOpen } from 'svelte-bootstrap-icons/lib/DoorOpen'
  import { Cpu } from 'svelte-bootstrap-icons/lib/Cpu'
  import { DoorClosed } from 'svelte-bootstrap-icons/lib/DoorClosed'
  import { People } from 'svelte-bootstrap-icons/lib/People'
</script>

<div class="columns is-centered">
  <div class="column is-half">
    <button class="button is-fullwidth mb-3 is-large is-primary">
      <span class="icon"><Shuffle /></span>
      <span>Play with random opponent</span>
    </button>
    <button class="button is-fullwidth mb-3 is-large is-primary">
      <span class="icon">
        <Cpu />
      </span>
      <span>Play with bot</span></button
    >
    <button class="button is-fullwidth mb-3 is-large is-primary">
      <span class="icon">
        <DoorClosed />
      </span>
      <span>Create closed game</span></button
    >
    <button class="button is-fullwidth mb-3 is-large is-primary">
      <span class="icon">
        <DoorOpen />
      </span>
      <span>Connect to closed game</span></button
    >
    <button class="button is-fullwidth mb-3 is-large is-primary">
      <span class="icon">
        <People />
      </span>
      <span>Create local game</span></button
    >
  </div>
</div>
