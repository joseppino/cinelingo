<script>
  import { push } from "svelte-spa-router";
  import checkAuth from "../../scripts/auth/checkAuth";

  checkAuth();
</script>

<div class="container media-opts">
  <h1 class="title">Explore</h1>
  <button class="button is-large is-rounded is-light" on:click={() => push("/explore/video/films")}>
    <span class="icon is-medium">
      <i class="fa-solid fa-film"></i>
    </span>
    <span>Films</span>
  </button>
  <button class="button is-large is-rounded is-light" on:click={() => push("/explore/video/tv")}>
    <span class="icon is-medium">
      <i class="fa-solid fa-tv"></i>
    </span>
    <span>TV</span>
  </button>
  <!-- <button class="button is-large is-rounded is-light">
    <span class="icon is-medium">
      <i class="fa-solid fa-music"></i>
    </span>
    <span>Music</span>
  </button> -->
</div>

<style>
  .media-opts {
    display: flex;
    flex-direction: column;
  }

  .media-opts h1 {
    margin-bottom: 20px;
  }

  .media-opts button {
    width: 300px;
    margin-bottom: 5px;
  }

  
</style>