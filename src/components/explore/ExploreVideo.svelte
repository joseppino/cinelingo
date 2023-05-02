<script>
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { location, push } from "svelte-spa-router";
  import checkAuth from "../../scripts/auth/checkAuth";

  export let params;

  checkAuth();

  let mediaName;
  let mediaRef;
  setMediaVariables(params.mediaType);

  function setMediaVariables(mediaType) { // sets variables into format useful for api & db lookups
    if (mediaType === "films") {
      mediaName = "Films";
      mediaRef = "films";
    } else if (mediaType === "tv") {
      mediaName = "Television";
      mediaRef = "tv";
    }
  }

  location.subscribe((url) => { // fixes issue with navigating to video from film and vice-versa via navbar
    setMediaVariables(url.split('/').at(-1));
  });
</script>

<div>
  <h2 class="title">Explore {capitaliseFirstLetter($langStore.languageName)} {mediaName}</h2>
  <div class="block btn-cont">
    <button class="button is-large is-rounded is-light cat-btn"
    on:click={() => push(`/explore/video/${mediaRef}/popular`)}>
      <span class="icon is-medium">
        <i class="fa-solid fa-fire-flame-curved"></i>
      </span>
      <span>Popular</span>
    </button>
    <button class="button is-large is-rounded is-light cat-btn"
    on:click={() => push(`/explore/video/${mediaRef}/top_rated`)}>
      <span class="icon is-medium">
        <i class="fa-regular fa-thumbs-up"></i>
      </span>
      <span>Top Rated</span>
    </button>
    <button class="button is-large is-rounded is-light cat-btn"
    on:click={() => push(`/explore/video/${mediaRef}/recommended`)}>
      <span class="icon is-medium">
        <i class="fa-regular fa-lightbulb"></i>
      </span>
      <span>Suggestions</span>
    </button>
  </div>
</div>

<style>
  .btn-cont {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cat-btn {
    width: 300px;
    margin-bottom: 5px;
  }
</style>

