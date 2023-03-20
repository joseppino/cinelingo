<script>
  import { createEventDispatcher } from "svelte";

  export let details; // details prop

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

	const handle_keydown = e => {
		if (e.key === 'Escape') {
			close();
			return;
		}
  }

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

<svelte:window on:keydown={handle_keydown}/>


<div class="modal is-active">
  <div class="modal-background" on:click={close}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">{details.title ? details.title : details.name}</p>
      <button class="delete" aria-label="close" on:click={close}></button>
    </header>
    <section class="modal-card-body">
      <section class="overview block">
        <figure class="image modal-poster">
          <img src={`https://image.tmdb.org/t/p/w400/${details.poster_path}`} alt="Poster">
        </figure>
        <div class="block">
          {#if details.overview}
          <h3 class="subtitle card-subtitle"><strong>Overview</strong></h3>
          <p>{details.overview}</p>
          {/if}
          {#if details.tagline}
            <br>
            <p><i>"{details.tagline}"</i></p>
          {/if}
        </div>
      </section>
      <section class="details block">
        <div class="block">
          <p class="subtitle mb-1">Details</p>
          {#if details.original_title && details.title !== details.original_title}
            <p>Original Title: {details.original_title}</p>
          {/if}
          {#if details.original_name && details.name !== details.original_name}
            <p>Original Name: {details.original_name}</p>
          {/if}
          {#if details.number_of_seasons}
            <p>{details.number_of_seasons} {details.number_of_seasons > 1 ? "seasons" : "season"}</p>
          {/if}
          {#if details.number_of_episodes}
            <p>{details.number_of_episodes} {details.number_of_episodes > 1 ? "episodes" : "episode"}</p>
          {/if}
          {#if details.homepage}
            <p><a href={details.homepage}>Homepage</a></p>
          {/if}
          {#if details.imdbId}
          <!-- SHOULD OPEN IN A NEW TAB - FIX NEEDED -->
            <!-- <p>See more on </p><a href={`https://www.imdb.com/title/${details.imdbId}`} target="_blank" rel="noreferrer">IMDb</a> -->
            <p>See more on </p><a on:click={() => {
                  let redirectWindow =window.open(`https://www.imdb.com/title/${details.imdbId}`, "_blank");
                  redirectWindow.location;
                }
              }>IMDb</a>
          {/if}
          {#if details.runtime}
            <p>Runtime: {getRuntimeInHours(details.runtime)}</p>
          {/if}
          {#if details.genres}
            <p>Genres:
            {#each details.genres as genre}
              <a href="#">{`${genre.name}  `}</a>
            {/each}
            </p>
          {/if}
        </div>
        {#if details.ukStreamingProviders.length}
          <div class="block">
            <p class="subtitle">Streaming On</p>
            <div class="provider-list">
              {#each details.ukStreamingProviders as provider}
                  <img class="provider-logo" width="50px" height="50px" src={`https://image.tmdb.org/t/p/w200/${provider.logo_path}`} alt={`${provider.provider_name} logo`}>
              {/each}
            </div>
          </div>
        {/if}
        
      </section>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-success">Save to a list</button>
    </footer>
  </div>
</div>

<style>
  .modal-background {
    background-color: rgba(10,10,10,.1);
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
  }

  .details {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
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

  .provider-logo {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.2),0 0 0 1px rgba(10,10,10,.02);
  }
  
</style>