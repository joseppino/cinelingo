<script>
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { link } from "svelte-spa-router";

</script>

<div>
  <h2 class="title">Browse {capitaliseFirstLetter($langStore.languageName)} Films</h2>
  <div class="block">
    <a href="/browse/films/popular" use:link>Popular |</a>
    <a href="/browse/films/top_rated" use:link>Top Rated |</a>
    <a href="/browse/films/genres" use:link>Genres |</a>
    <a href="/browse/films/recommended" use:link>Recommended</a>
  </div>
</div>

<style>
</style>

