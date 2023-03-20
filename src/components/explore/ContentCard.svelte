<script>
  import shortenDescription from "../../scripts/shortenDescription";
  import GenreTag from "./GenreTag.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  export let props;

  const content = props.content;
  const mediaType = props.mediaType;

</script>

<div class="card" in:fly="{{ y: 200, duration: 2000 }}">
  <div class="card-image">
    <figure class="image">
      <img src={`https://image.tmdb.org/t/p/w400/${content.poster_path}`} alt="Poster">
    </figure>
  </div>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <p class="title is-4">{mediaType === "films" ? content.title : content.name}</p>
        <p class="subtitle is-6">{mediaType === "films" ? content.release_date.split("-")[0] : content.first_air_date.split("-")[0]}</p>
      </div>
    </div>

    <div class="content">
      {shortenDescription(content.overview)}
      <div class="genres block mt-2">
        {#each content.genres as genre}
          <GenreTag {genre} />
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .card {
    min-width: 340px;
    max-width: 380px;
    padding: 1em;
  }

  .card:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,0.6),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }

  .image {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .image img {
    width: 60%;
  }

  .genres {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
  }
</style>