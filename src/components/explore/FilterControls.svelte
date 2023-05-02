<script>
  import { onDestroy, onMount } from "svelte";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { fetchGenres } from "../../scripts/tmdbScripts";

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

  let genreList = fetchGenres(apiMediaRef);

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
            <label class="checkbox is-size-6">
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
          on:keypress={() => sortBy = "popularity"}
          >Popularity </a>
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="dropdown-item"
          on:click={() => sortBy = "rating"}
          on:keypress={() => sortBy = "rating"}
          >Rating </a>
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="dropdown-item"
          on:click={() => sortBy = "alphabetical"}
          on:keypress={() => sortBy = "alphabetical"}
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