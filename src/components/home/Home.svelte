<script>
  import ContentSet from "./ContentSet.svelte";
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import checkAuth from "../../scripts/auth/checkAuth";
  
  checkAuth();
</script>

<div class="container">
  {#if !$langStore.languageName}
    <p>Loading...</p>
  {:else}
    <section class="section">
      <h1 class="title">
        <span class="icon is-medium">
          <i class="fa-regular fa-lightbulb"></i>
        </span>
        <span>Today's Recommended {capitaliseFirstLetter($langStore.languageName)} Content</span>
      </h1>
      <div class="block box cset">
        <h2 class="subtitle">
          <span class="icon is-medium">
            <i class="fa-solid fa-film"></i>
          </span>
          <span>Films</span>
        </h2>
        <ContentSet setType="recommended" mediaType="films" setSize={5}/>
      </div>

      <div class="block box cset">
        <h2 class="subtitle">
          <span class="icon is-medium">
            <i class="fa-solid fa-tv"></i>
          </span>
          <span>Television Shows</span>
        </h2>
        <ContentSet setType="recommended" mediaType="tv" setSize={5}/>
      </div>
    </section>
    <section class="section">
      <h1 class="title">
        <span class="icon is-medium">
          <i class="fa-solid fa-fire-flame-curved"></i>
        </span>
        <span>Today's Popular {capitaliseFirstLetter($langStore.languageName)} Content</span> 
      </h1>
      <div class="block box cset">
        <h2 class="subtitle">
          <span class="icon is-medium">
            <i class="fa-solid fa-film"></i>
          </span>
          <span>Films</span>
        </h2>
        <ContentSet setType="popular" mediaType="films" setSize={5}/>
      </div>

      <div class="block box cset">
        <h2 class="subtitle">
          <span class="icon is-medium">
            <i class="fa-solid fa-tv"></i>
          </span>
          <span>Television Shows</span>
        </h2>
        <ContentSet setType="popular" mediaType="tv" setSize={5}/>
      </div>
    </section>
  {/if}
</div>

<style>
  .section {
    background-color: hsla(0, 15%, 5%, 0.02)  }

  .title {
    margin-bottom: 30px !important;
  }

  .subtitle {
    margin-bottom: 3px !important;
  }

  .cset {
    max-width: 100vw;
  }
</style>