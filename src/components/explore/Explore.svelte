<script>
  import { link } from "svelte-spa-router";
  import checkAuth from "../../scripts/auth/checkAuth";

  checkAuth();
</script>

<div class="container">
  <a href="/explore/video/films" use:link>Films</a>
  <a href="/explore/video/tv" use:link>TV</a>
  <a href="/explore/music" use:link>Music</a>
</div>

<style></style>