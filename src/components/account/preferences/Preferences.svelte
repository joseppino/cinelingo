<script>
  import { replace } from "svelte-spa-router";
  import LanguageSelect from "./LanguageSelect.svelte";
  import { onMount } from "svelte";
  import VideoPreferenceSelect from "./VideoPreferenceSelect.svelte";

  export let params = {};
  let activeTab = "language-select";
  if(params) {
    if (params.activeTab) {
      activeTab = params.activeTab; 
    }
  }

  let tabs;
  const handleTabClick = (e) => {
    for (let tab of tabs.children) {
      tab.classList.remove("is-active");
    }
    e.target.parentElement.classList.add("is-active");
    activeTab = e.target.parentElement.id;
    replace(`/preferences/${activeTab}`); // update url to new preference tab
  }

  // update visible active tab when component is mounted
  onMount(() => {
    for(let tab of tabs.children) {
      tab.classList.remove("is-active");
      if(tab.id === activeTab) {
        tab.classList.add("is-active");
      }
    }
  });

</script>

<div class="wrapper">
  <div class="header-section">
    <h2 class="title">Content Preferences</h2>
    <div class="tabs is-centered">
      <ul on:click={handleTabClick} on:keypress={handleTabClick} bind:this={tabs}>
        <li id="language-select" class="is-active"><a>Language</a></li>
        <li id="films"><a>Films</a></li>
        <li id="tv"><a>TV</a></li>
        <li id="music"><a>Music</a></li>
      </ul>
    </div>
  </div>
  <div class="container content">
    {#if activeTab === "language-select"}
      <LanguageSelect />
    {:else if activeTab === "films"}
      <VideoPreferenceSelect mediaType="films"/>
    {:else if activeTab === "tv"}
      <VideoPreferenceSelect mediaType="tv"/>
    {:else if activeTab === "music"}
      <!-- music-prefs here -->
    {/if}
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .content {
    margin-top: 50px;
  }
</style>