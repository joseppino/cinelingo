<script>
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { link } from "svelte-spa-router";

  export let params;

  let mediaName;
  let mediaRef;
  if (params.mediaType === "films") {
    mediaName = "Films";
    mediaRef = "films";
  } else if (params.mediaType === "tv") {
    mediaName = "Television";
    mediaRef = "tv";
  }
</script>

<div>
  <h2 class="title">Explore {capitaliseFirstLetter($langStore.languageName)} {mediaName}</h2>
  <div class="block">
    <a href={`/explore/video/${mediaRef}/popular`} use:link>Popular |</a>
    <a href={`/browse/video/${mediaRef}/classic`} use:link>Classics |</a>
    <a href={`/browse/video/${mediaRef}/genres`} use:link>Genres |</a>
    <a href={`/browse/video/${mediaRef}/recommended`} use:link>Recommended</a>
  </div>
</div>

<style>
</style>

