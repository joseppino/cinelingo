<script>
  import LanguageSelect from "./LanguageSelect.svelte";

  export let activeTab = "language-select";

  let tabs;
  const handleTabClick = (e) => {
    for(let tab of tabs.children) {
      tab.classList.remove("is-active");
    }
    e.target.parentElement.classList.add("is-active");
    activeTab = e.target.parentElement.id;
  }

</script>

<div class="wrapper">
  <h2 class="title">Content Preferences</h2>
  <div class="tabs is-centered">
    <ul on:click={handleTabClick} on:keypress={handleTabClick} bind:this={tabs}>
      <li id="language-select" class="is-active"><a>Language</a></li>
      <li id="video"><a>Video</a></li>
      <li id="music"><a>Music</a></li>
    </ul>
  </div>

  
</div>
{#if activeTab === "language-select"}
  <LanguageSelect />
{:else if activeTab === "video"}
  <!-- video-prefs here -->
{:else if activeTab === "music"}
  <!-- music-prefs here -->
{/if}


<style>
  .wrapper {
    align-self: flex-start;
    position: fixed;
  }
</style>