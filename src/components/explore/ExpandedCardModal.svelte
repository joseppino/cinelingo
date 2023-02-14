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
        </div>
      </section>
      <section>
        {#if details.seasons}
          <p>{details.seasons.length} seasons</p>
        {/if}
        <p><a href={details.homepage}>Homepage</a></p>
        <p>See more on <a href={`https://www.imdb.com/title/${details.imdbId}`}>IMDB</a></p>
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