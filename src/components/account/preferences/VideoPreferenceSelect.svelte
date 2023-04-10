<script>
  import PreferenceGroup from "./PreferenceGroup.svelte";
  import { videoGroupStore } from "../../../stores/videoGroupStore";

  export let mediaType;

  let contentList = [];

  // determine which preferences are being modified based on mediaType prop - films or TV
  if(mediaType === "films") {
    contentList = $videoGroupStore.films;
  } else {
    contentList = $videoGroupStore.tv;
  }
  let confButton;
  let allocatedPoints = [];
  $: console.log(allocatedPoints);
  $: pointsToAllocate = 3 - allocatedPoints.length;
  $: if(allocatedPoints.length === 3) { // enable button when all points have benen allocated
    try {
      confButton.disabled = false;
    } catch (e) { console.log(e); }
  } else {
    try {
      confButton.disabled = true;
    } catch (e) { console.log(e); }
  }

  function submitPreferences() {
    // UPDATE USER ACCOUNT PREFS --- FIRESTORE
    // IF MEDIATYPE === FILM -> COLLECTION1
    // IF MEDIATYPE === TV -> COLLECTION2
  }
</script>

<p class="subtitle is-small">
  For Cinelingo to learn more about your tastes, please allocate <strong>{pointsToAllocate}</strong>
  {#if pointsToAllocate === 1}
    point
  {:else}
    points
  {/if}
  to your favourite groups below.
</p>
<div class="columns mb-2">
  <div class="column">
    {#each contentList.slice(0,Math.floor(contentList.length / 2)) as prefGroup}
      <PreferenceGroup
        groupId={prefGroup.groupId}
        groupName={prefGroup.label}
        contentList={prefGroup.examples}
        bind:allocatedPoints={allocatedPoints}
      />
    {/each}
  </div>
  <div class="column">
    {#each contentList.slice(Math.floor(contentList.length / 2), contentList.length) as prefGroup}
      <PreferenceGroup
        groupId={prefGroup.groupId}
        groupName={prefGroup.label}
        contentList={prefGroup.examples}
        bind:allocatedPoints={allocatedPoints}
      />
    {/each}
  </div>  
</div>
<button 
  class="button confirm-prefs is-primary"
  disabled
  bind:this={confButton}
  on:click={submitPreferences}
  >Confirm Preferences</button>

<style>
  .container { 
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }

  .confirm-prefs {
    width: 200px;
    margin-bottom: 10px;
  }
</style>