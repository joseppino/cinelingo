<script>
  import { get_current_component } from "svelte/internal";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import checkAuth from "../../scripts/auth/checkAuth";

  export let params; // declare params prop

  checkAuth();

  const mediaType = params.mediaType;

  let genreSelectDropdown;
  let sortByDropDown;

  let apiMediaRef; // declare correct term for api call (movie/tv)
  if (mediaType === "films") {
    apiMediaRef = "movie";
  } else {
    apiMediaRef = "tv";
  }

  let mediaName;
  let dbMediaRef;
  if (mediaType === "tv") {
    mediaName = "Television";
    dbMediaRef = "tv";
  } else if (mediaType === "films") {
    mediaName = "Films";
    dbMediaRef = "movies";
  }

  let genreList = getGenres();

  async function getGenres() { // get list of genres from tmdb api for given media type
    try {
      const req = `https://api.themoviedb.org/3/genre/${apiMediaRef}/list?api_key=${tmdbApikey}&language=en-US`;
      const res = await fetch(req); 
      const obj = await res.json();
      return obj.genres;
    } catch (e) {
      console.log("Error fetching genre list");
    }
  }

  let selectedGenres = [];
</script>

<div class="wrapper">
  {#await genreList}
    <p>Fetching Genre List...</p>
  {:then genreList}
    <div class="dropdown is-hoverable" bind:this={genreSelectDropdown} 
      on:click={() => genreSelectDropdown.classList.toggle("is-active")} 
      on:keypress={() => genreSelectDropdown.classList.toggle("is-active")} 
      on:focusout={() => genreSelectDropdown.classList.remove("is-active")}>
      <div class="dropdown-trigger">
        <button class="button is-rounded is-size-5" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>Select Genres</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content genre-select">
          {#each genreList as genre}
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- <a class="dropdown-item" on:click={() => console.log(genre.name)}>
              {genre.name}
            </a> -->
            <label class="checkbox is-size-5">
              <input type="checkbox" bind:group={selectedGenres} value={JSON.stringify({genre_id: genre.id, genre_name: genre.name})}>
              <span>{genre.name}</span>
            </label>
          {/each}
        </div>
      </div>
    </div>
    <div class="dropdown is-hoverable" bind:this={sortByDropDown} 
      on:click={() => sortByDropDown.classList.toggle("is-active")} 
      on:keypress={() => sortByDropDown.classList.toggle("is-active")} 
      on:focusout={() => sortByDropDown.classList.remove("is-active")}>
      <div class="dropdown-trigger">
        <button class="button is-rounded is-size-5" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>Sort By</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu2" role="menu">
        <div class="dropdown-content">
          <a class="dropdown-item">Popularity</a>
          <a class="dropdown-item">Rating</a>
          <a class="dropdown-item">Name (A-Z)</a>
        </div>
      </div>
    </div>
  {/await}
</div>

<style>
  .wrapper {
    align-self: flex-start;
    position: fixed;
  }
  .genre-select {
    max-height: 250px;
    width: 250px;
    overflow-y: scroll;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>