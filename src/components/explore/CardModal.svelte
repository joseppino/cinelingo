<script>
  import { closeModal } from "svelte-modals";
  import GenreTag from "./GenreTag.svelte";

  export let isOpen;
  export let info;

  const getRuntimeInHours = (runtime) => {
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    let hrString;
    hours > 1 ? hrString = "hours" : hrString = "hour";
    let minString;
    mins > 1 ? minString = "minutes" : minString = "minutes";
    let newRuntime;
    // check which parts to show (mins/hrs)
    if (hours > 0 && mins > 0) { 
      newRuntime = `${hours} ${hrString}, ${mins} ${minString}`;
    } else if (hours > 0 && mins < 1){
      newRuntime = `${hours} ${hrString}`;
    } else {
      newRuntime = `${mins} ${minString}`;
    }
    return newRuntime;
  }

</script>

{#if isOpen}
  <div role="dialog" class="modal is-active">
    <div class="modal-background" on:click={closeModal}></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{info.title ? info.title : info.name}</p>
        <button class="delete" aria-label="close" on:click={closeModal}></button>
      </header>
      <section class="modal-card-body">
        <section class="overview block">
          <figure class="image modal-poster">
            <img src={`https://image.tmdb.org/t/p/w400/${info.poster_path}`} alt="Poster">
          </figure>
          <div class="block">
            {#if info.overview}
            <h3 class="subtitle card-subtitle"><strong>Overview</strong></h3>
            <p>{info.overview}</p>
            {/if}
            {#if info.tagline}
              <br>
              <p><i>"{info.tagline}"</i></p>
            {/if}
          </div>
        </section>
        <section class="info block">
          <div class="info-top">
            <div class="block">
              <p class="subtitle mb-1">Details</p>
              {#if info.original_title && info.title.toLowerCase() !== info.original_title.toLowerCase()}
                <p>Original Title: {info.original_title}</p>
              {/if}
              {#if info.original_name && info.name !== info.original_name}
                <p>Original Name: {info.original_name}</p>
              {/if}
              {#if info.number_of_seasons}
                <p>{info.number_of_seasons} {info.number_of_seasons > 1 ? "seasons" : "season"}</p>
              {/if}
              {#if info.number_of_episodes}
                <p>{info.number_of_episodes} {info.number_of_episodes > 1 ? "episodes" : "episode"}</p>
              {/if}
              {#if info.homepage}
                <p><a href={info.homepage}>Homepage</a></p>
              {/if}
              {#if info.imdbId}
                <p>See more on <a href={`https://www.imdb.com/title/${info.imdbId}`}>IMDb</a></p>
              {/if}
              {#if info.runtime}
                <p>Runtime: {getRuntimeInHours(info.runtime)}</p>
              {/if}
            </div>
            {#if info.ukStreamingProviders.length}
              <div class="block">
                <p class="subtitle">Streaming On</p>
                <div class="provider-list">
                  {#each info.ukStreamingProviders as provider}
                      <img on:click={() => open(`https://duckduckgo.com/?q=${provider.provider_name}%20streaming&kp=-1&kl=us-en`)}
                      on:keyup={() => open(`https://duckduckgo.com/?q=${provider.provider_name}%20streaming&kp=-1&kl=us-en`)}
                      class="provider-logo" 
                      width="50px" height="50px" 
                      src={`https://image.tmdb.org/t/p/w200/${provider.logo_path}`} 
                      alt={`${provider.provider_name} logo`}>
                  {/each}
                </div>
              </div>
            {/if}
        </div>
        <div class="info-bottom">
          {#if info.genres}
            {#each info.genres as genre}
              <GenreTag {genre} />
            {/each}
          {/if}
        </div>
        </section>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success">Save to a list</button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-background {
    background-color: rgba(10,10,10,0.8);
  }

  .modal-poster {
    width: 30%;
    flex-shrink: 0;
    margin-right: 10px;
  }

  .card-subtitle {
    margin-bottom: 1rem !important;
  }

  .overview {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .info-top {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .info-bottom {
    margin-top: 5px;
  }

  .provider-list {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .provider-list img {
    margin-left: 5px;
    margin-right: 5px;
  }

  .provider-list img:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,0.6),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }

  .provider-logo {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.2),0 0 0 1px rgba(10,10,10,.02);
  }
  
</style>