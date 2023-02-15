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
      <section class="overview">
        <figure class="image modal-poster">
          <img src={`https://image.tmdb.org/t/p/w400/${details.poster_path}`} alt="Poster">
        </figure>
        <div class="block">
          <h3 class="subtitle"><strong>Overview</strong></h3>
          <p>{details.overview}</p>
          {#if details.tagline}
            <br>
            <p><i>"{details.tagline}"</i></p>
          {/if}
        </div>
      </section>
      <section>
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
          <p>See more on <a href={`https://www.imdb.com/title/${details.imdbId}`}>IMDb</a></p>
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

  .overview {
    display: flex;
    flex-direction: row;
  }

  .modal-poster {
    width: 30%;
    flex-shrink: 0;
    margin-right: 10px;
  }
</style>