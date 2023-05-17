<script>
  import { db } from "../../scripts/fb/firestore";
  import { collection, getDoc, getDocs } from "firebase/firestore";
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import ContentCard from "./ContentCard.svelte";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import { push } from "svelte-spa-router";
  import checkAuth from "../../scripts/auth/checkAuth";
  import { Modals, openModal, closeModal } from 'svelte-modals';
  import FilterControls from "./FilterControls.svelte";
  import getUserRef from "../../scripts/auth/getUserRef";
  import { authStore } from "../../stores/authStore";
  import { fetchGenres, fetchStreamingProviders, fetchTrailerKey } from "../../scripts/tmdbScripts";

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

  // fetches media from firestoreDB based on the locale and genre.
  async function loadMedia() {
    let colRef;
    if(category === "recommended") {
      // fetch user's record from DB
      const userRef = await getUserRef($authStore.email);
      const userDocSnap = await getDoc(userRef);
      const userId = userDocSnap.id;
      colRef = collection(db, `suggestedContent/${userId}/${mediaType}`);
    } else {
      colRef = collection(db, `${dbMediaRef}/${category}/${$langStore.locale}`) 
    }
    const querySnapshot = await getDocs(colRef);
    const genres = await fetchGenres(apiMediaRef);
    let media = [];
    querySnapshot.forEach(doc => { // iterate through firestore movie collection
      const content = {...doc.data()}
      content.genreObjs = [];
      if(category === "recommended") {
        for(const genre of content.genres) {
          content.genreObjs.push({id: genre.id, name: genre.name});
        }
      } else {
          for (const id of content.genre_ids) {
            for (const genre of genres) {
              if (genre.id === id) { // check for matching genre ids
                content.genreObjs.push({id: genre.id, name: genre.name});
              }
            }
        }
      }

      media.push(content);

      });

    return media;
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

      const ukStreamingProviders = await fetchStreamingProviders(apiMediaRef, content.id);
      
      console.log(details);
      modalDetails = details;
      modalDetails.mediaType = mediaType; // assign media type
      if(imdbId) { // check id is not null
        modalDetails.imdbId = imdbId; // add imdb id property
        if(modalDetails.overview.length < 1) {
          const req = `https://fetch-imdb-description1-ic5gbb3a2q-nw.a.run.app?imdbId=${imdbId}`;
          const imdbDescription = await (await fetch(req)).text();
          modalDetails.overview = imdbDescription;
        }
      }
      
      if (ukStreamingProviders) {
        modalDetails.ukStreamingProviders = ukStreamingProviders; // if any, add streaming providers to details
      } else {
        modalDetails.ukStreamingProviders = [];
      }

      const trailerKey = await fetchTrailerKey(apiMediaRef, content.id);
      if(trailerKey) {
        modalDetails.trailerKey = trailerKey;
      } else {
        modalDetails.trailerKey = null;
      }

      console.log(modalDetails);
      // @ts-ignore
      openModal(() => import("./CardModal.svelte"), {
        info: modalDetails
      });
    } catch (e) {
      console.error(e);
    } 
  }

  // checks one array is a subset of another, such that filtering rules can be applied correctly.
  function checkArrayIsSubset(bigArray, smallArray) {
    if(bigArray.length < smallArray.length) return false;
    bigArray.sort();
    smallArray.sort();
    for(let i=0; i<smallArray.length; i++) {
      if(!bigArray.includes(smallArray[i])) return false;
    }
    return true;
  }

  function sortContentAlphabetically(unsorted) {
    if(mediaName === "Television") {
      return unsorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return unsorted.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  const sortContentByRating = (unsorted) => unsorted.sort((a, b) => a.vote_average < b.vote_average);

  const sortContentByPopularity = (unsorted) => unsorted.sort((a, b) => a.popularity < b.popularity);

  async function sortContent(mList, sortBy) {
    let media = await mList;
    switch (sortBy) {
      case "popularity":
        media = sortContentByPopularity(media);
        break;
      case "rating":
        media = sortContentByRating(media);
        break;
      case "alphabetical":
        media = sortContentAlphabetically(media);
        break;
      default:
        break;
    }
    return media;
  }
  
  $: mediaList = sortContent(loadMedia(), sortBy);
  let modalDetails = {};
  let selectedGenres = [];
  $: genreFilter = selectedGenres.map((item) => item = JSON.parse(item));
  let sortBy;
</script>

<Modals>
  <div
    slot="backdrop"
    class="backdrop"
    on:click={closeModal}
    on:keypress={closeModal}
  />
</Modals>

<div class="wrapper">
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
      <!-- Remove controls if on recommended page due to broken functionality -->
      {#if category !== "recommended" }
        <div class="controls">
          <FilterControls props={{mediaType: mediaType}} bind:selectedGenres={selectedGenres} bind:sortBy={sortBy}/>
        </div>
      {/if}
    </div>
    <div class="wrap">
      <ul>
        {#each mediaList as content}
          <!-- if user has added any genres to filter -->
          {#if genreFilter.length}
            <!-- Show only content that matches all filters -->
            {#if checkArrayIsSubset(content.genre_ids, genreFilter)}
              <li on:click={() => handleCardClick(content)} 
                  on:keypress={() => handleCardClick(content)}
                >
                <ContentCard props={{
                  content: content,
                  mediaType: mediaType,
                  showDetails: true
                }} />
              </li>
            {/if}
          {:else}
            <li on:click={() => handleCardClick(content)} 
                on:keypress={() => handleCardClick(content)}>
              <ContentCard props={{
                content: content,
                mediaType: mediaType,
                showDetails: true
              }} />
            </li>
          {/if}
        {:else}
          <p>No content found!</p>
        {/each}
      </ul>
    </div>
  {:catch error}
    <p>Something went wrong: {error.message}</p>
  {/await}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: flex-start;
  }

  .controls {
    margin-bottom: 10px;
  }

  .wrap ul{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 80vw;
  }

  li {
    margin-bottom: 1rem;
    margin: 20px;
  }
</style>