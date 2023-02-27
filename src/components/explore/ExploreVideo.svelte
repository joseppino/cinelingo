<script>
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { link, location } from "svelte-spa-router";
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
  <div class="block">
    <a href={`/explore/video/${mediaRef}/popular`} use:link>Popular |</a>
    <a href={`/explore/video/${mediaRef}/top_rated`} use:link>Top Rated |</a>
    <a href={`/explore/video/genres/${mediaRef}`} use:link>Genres |</a>
    <a href={`/explore/video/${mediaRef}/recommended`} use:link>Recommended</a>
  </div>
</div>

<style>
</style>

