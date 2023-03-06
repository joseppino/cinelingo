<script>
  import { db } from "../../scripts/fb/firestore";
  import { collection, getDocs } from "firebase/firestore";
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import ContentCard from "./ContentCard.svelte";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import { push } from "svelte-spa-router";
  import checkAuth from "../../scripts/auth/checkAuth";
  import { Modals, openModal, closeModal } from 'svelte-modals'
  import FilterControls from "./FilterControls.svelte";

  export let params;

  checkAuth(); // verify user is authenticated

  const mediaType = params.mediaType;
  const category = params.category;

  if (mediaType !== "tv" && mediaType !== "films") {
    push("/NotFound"); // redirect to not found
  }
  if (category !== "top_rated" && category !== "popular" && category !== "recommended") {
    push("/NotFound"); // redirect to not found
  }

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

  let categoryTitle;
  switch (category) {
    case "popular":
      categoryTitle = "Popular";
      break;
    case "top_rated":
      categoryTitle = "Top-Rated";
    break;
    case "recommended":
      categoryTitle = "Recommended";
      break;
    default:
      break;
  }

  // fetches list of genres from TMDB API for the given media type.
  async function getGenres() {
    try {
      const req = `https://api.themoviedb.org/3/genre/${apiMediaRef}/list?api_key=${tmdbApikey}&language=en-US`;
      const res = await fetch(req);
      const obj = await res.json();
      return obj.genres;
    } catch (e) {
      console.log("Error fetching genre list");
    }
  }

  // fetches media from firestoreDB based on the locale and genre.
  async function loadMedia() {
    const querySnapshot = await getDocs(collection(db, `${dbMediaRef}/${category}/${$langStore.locale}`));
    const genres = await getGenres();
    let media = [];
    querySnapshot.forEach(doc => { // iterate through firestore movie collection
      const content = {...doc.data()}
      content.genres = [];
      for (const id of content.genre_ids) {
        for (const genre of genres) {
          if (genre.id === id) { // check for matching genre ids
            content.genres.push({id: genre.id, name: genre.name});
          }
        }
      }
      media.push(content);
    });
    return media;
  }

  // fetches list of services currently streaming the requested content
  async function getStreamingProviders(contentType, contentId) {
    try {
      const req = `https://api.themoviedb.org/3/${contentType}/${contentId}}/watch/providers?api_key=${tmdbApikey}`;
      const res = await fetch(req);
      const data = await res.json();
      let ukStreamingProviders;
      if(data.results.GB) { // check content has providers for the GB region
        data.results.GB.flatrate ? ukStreamingProviders = data.results.GB.flatrate : ukStreamingProviders = []; // flatrate refers to streaming providers as opposed to renting/purchasing providers.
      }
      if(ukStreamingProviders) { // check emptiness
        const providerBlacklist = [175, 1796, 596];
        ukStreamingProviders = ukStreamingProviders.filter(provider => !providerBlacklist.includes(provider.provider_id)); // filter out Netflix basic & Netflix kids
        if (ukStreamingProviders.length > 3) {
          ukStreamingProviders.length = 3; // truncate list of providers if too long
        }
      }
      return ukStreamingProviders;
    } catch (e) {
      console.log(e);
    }
  }

  // fetches additional data about selected content when its card is clicked, triggers modal popup to display information.
  async function handleCardClick(content) {
    try {
      const detailsReq = `https://api.themoviedb.org/3/${apiMediaRef}/${content.id}?api_key=${tmdbApikey}&language=en-US`;
      const imdbIdReq = `https://api.themoviedb.org/3/${apiMediaRef}/${content.id}/external_ids?api_key=${tmdbApikey}&language=en-US`;
      
      const detailsRes = await fetch(detailsReq);
      const details = await detailsRes.json();

      const imdbIdRes = await (await fetch(imdbIdReq)).json();
      const imdbId = imdbIdRes.imdb_id;

      const ukStreamingProviders = await getStreamingProviders(apiMediaRef, content.id);
      
      console.log(details);
      modalDetails = details;
      modalDetails.mediaType = mediaType; // assign media type
      if(imdbId) { // check id is not null
        modalDetails.imdbId = imdbId; // add imdb id property
      }
      
      if (ukStreamingProviders) {
        modalDetails.ukStreamingProviders = ukStreamingProviders; // if any, add streaming providers to details
      } else {
        modalDetails.ukStreamingProviders = [];
      }

      console.log(modalDetails);
      openModal(() => import("./CardModal.svelte"), {
        info: modalDetails
      });
    } catch (e) {
      console.log(e);
    } 
  }

  function checkArrayIsSubset(bigArray, smallArray) {
    if(bigArray.length < smallArray.length) return false;
    bigArray.sort();
    smallArray.sort();
    for(let i=0; i<smallArray.length; i++) {
      if(!bigArray.includes(smallArray[i])) return false;
    }
    return true;
  }

  const mediaList = loadMedia();

  let showModal = false;
  let modalDetails = {};

  let selectedGenres = [];
  $: genreFilter = selectedGenres.map((item) => item = JSON.parse(item));
  $: console.log(genreFilter);
</script>

<Modals>
  <div
    slot="backdrop"
    class="backdrop"
    on:click={closeModal}
    on:keyup={closeModal}
  />
</Modals>

<div class="container">
  {#await mediaList}
    <p>Loading content...</p>
  {:then mediaList}
    <div class="title_controls-wrapper">
      <h1 class="title is-size-4">
        {#if $langStore.languageName}
          Browsing {categoryTitle} {capitaliseFirstLetter($langStore.languageName)} {mediaName}
        {:else}
          Browsing {categoryTitle} {mediaName}
        {/if}
      </h1>
      <div class="controls">
        <FilterControls props={{mediaType: mediaType}} bind:selectedGenres={selectedGenres}/>
      </div>
    </div>
    <div class="wrap">
      <ul>
        {#each mediaList as content}
          <!-- if user has added any genres to filter -->
          {#if genreFilter.length}
            <!-- Show only content that matches all filters -->
            {#if checkArrayIsSubset(content.genre_ids, genreFilter)}
              <li on:click={() => handleCardClick(content)} on:keyup={() => handleCardClick(content)}>
                <ContentCard props={{
                  content: content,
                  mediaType: mediaType
                }} />
              </li>
            {/if}
          {:else}
            <li on:click={() => handleCardClick(content)} on:keyup={() => handleCardClick(content)}>
              <ContentCard props={{
                content: content,
                mediaType: mediaType
              }} />
            </li> 
          {/if}
                       
        {/each}
      </ul>
    </div>
  {:catch error}
    <p>Something went wrong: {error.message}</p>
  {/await}
</div>

<style>
  .title_controls-wrapper {
    align-self: flex-start;
  }

  .controls {
    margin-bottom: 10px;
  }

  .wrap ul{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }

  li {
    margin-bottom: 1rem;
  }
</style>