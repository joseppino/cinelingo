<script>
  import { db } from "../../scripts/fb/firestore";
  import { collection, getDocs } from "firebase/firestore";
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import ContentCard from "./ContentCard.svelte";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import { push } from "svelte-spa-router";
  import ExpandedCardModal from "./ExpandedCardModal.svelte";

  export let params;

  const mediaType = params.mediaType;
  const category = params.category;

  if(mediaType !== "tv" && mediaType !== "films") {
    push("*"); // redirect to not found
  }

  let apiMediaRef; // declare correct term for api call (movie/tv)
  if(mediaType === "films") {
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

  async function getGenres() {
    const req = `https://api.themoviedb.org/3/genre/${apiMediaRef}/list?api_key=${tmdbApikey}&language=en-US`;
    const res = await fetch(req);
    const obj = await res.json();
    return obj.genres;
  }

  async function loadMedia() {
    const querySnapshot = await getDocs(collection(db, `${dbMediaRef}/${category}/${$langStore.locale}`));
    const genres = await getGenres();
    let media = [];
    querySnapshot.forEach(doc => { // iterate through firestore movie collection
      const content = {...doc.data()}
      content.genreNames = [];
      for (const id of content.genre_ids) {
        for (const genre of genres) {
          if (genre.id === id) { // check for matching genre ids
            content.genreNames.push(genre.name);
          }
        }
      }
      media.push(content);
    });
    return media;
  }

  async function handleCardClick(content) {
    const detailsReq = `https://api.themoviedb.org/3/${apiMediaRef}/${content.id}?api_key=${tmdbApikey}&language=en-US`;
    const imdbIdReq = `https://api.themoviedb.org/3/${apiMediaRef}/${content.id}/external_ids?api_key=${tmdbApikey}&language=en-US`;
    
    const detailsRes = await fetch(detailsReq);
    const details = await detailsRes.json();

    const imdbIdRes = await (await fetch(imdbIdReq)).json();
    const imdbId = imdbIdRes.imdb_id;
    
    console.log(details);
    modalDetails = details;
    modalDetails.mediaType = mediaType; // assign media type
    if(imdbId) { // check id is not null
      modalDetails.imdbId = imdbId; // and imdb id property
    }
    console.log(modalDetails);
    showModal = true;
  }

  const mediaList = loadMedia();

  let showModal = false;
  let modalDetails = {};
</script>

<div>
  {#await mediaList}
    <p>Loading content...</p>
  {:then mediaList}
    {#if $langStore.languageName}
      <h1 class="title">Browsing Popular {capitaliseFirstLetter($langStore.languageName)} {mediaName}</h1>
    {:else}
    <h1 class="title">Browsing Popular {mediaName}</h1>
    {/if}
    <div class="wrap">
    <ul>
    {#each mediaList as content}
      <li on:click={() => handleCardClick(content)} on:keypress={() => showModal = true}>
        <ContentCard props={{
          content: content,
          mediaType: mediaType 
        }} />
      </li>
      {#if showModal}
        <ExpandedCardModal details={modalDetails} on:close={() => showModal = false}/>
      {/if}
    {/each}
    </ul>
    </div>
  {:catch error}
    <p>Something went wrong: {error.message}</p>
  {/await}
</div>

<style>
  .wrap {
    column-count: 4;
    column-gap: 2rem;
  }
  li {
    margin-bottom: 1rem;
    page-break-inside: avoid;
  }
</style>