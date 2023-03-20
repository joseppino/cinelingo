<script>
  import { onDestroy, onMount } from "svelte";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";

  export let props;
  export let selectedGenres = [];
  export let sortBy;

  const mediaType = props.mediaType;

  let genreSelectDropdown;
  let sortByDropdown;

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

  onDestroy(() => { 
    selectedGenres = [];
  });
  
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
        <button class="button is-rounded is-size-6" aria-haspopup="true" aria-controls="dropdown-menu">
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
            <label class="checkbox is-size-6">
              <!-- <input type="checkbox" bind:group={selectedGenres} value={JSON.stringify({genre_id: genre.id, genre_name: genre.name})}> -->
              <input type="checkbox" bind:group={selectedGenres} value={genre.id}>
              <span>{genre.name}</span>
            </label>
          {/each}
        </div>
      </div>
    </div>
    <div class="dropdown is-hoverable" bind:this={sortByDropdown} 
      on:click={() => sortByDropdown.classList.toggle("is-active")} 
      on:keypress={() => sortByDropdown.classList.toggle("is-active")} 
      on:focusout={() => sortByDropdown.classList.remove("is-active")}>
      <div class="dropdown-trigger">
        <button class="button is-rounded is-size-6" aria-haspopup="true" aria-controls="dropdown-menu">
          {#if sortBy}
          <span>Sorting By {capitaliseFirstLetter(sortBy)} <i class="fa-solid fa-arrow-trend-down"></i></span>
          {:else}
            <span>Sort By</span>
          {/if}
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu2" role="menu">
        <div class="dropdown-content">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="dropdown-item" 
          on:click={() => sortBy = "popularity"}
          on:keyup={() => sortBy = "popularity"}
          >Popularity </a>
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="dropdown-item"
          on:click={() => sortBy = "rating"}
          on:keyup={() => sortBy = "rating"}
          >Rating </a>
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="dropdown-item"
          on:click={() => sortBy = "alphabetical"}
          on:keyup={() => sortBy = "alphabetical"}
          >Alphabetical (A-Z)</a>
        </div>
      </div>
    </div>
  {/await}
</div>

<style>
  .genre-select {
    max-height: 250px;
    width: 250px;
    overflow-y: scroll;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 5px;
  }
</style>