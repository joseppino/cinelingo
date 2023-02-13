<script>
  import { db } from "../../scripts/fb/firestore";
  import { collection, getDocs } from "firebase/firestore";
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import ContentCard from "./ContentCard.svelte";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import { push } from "svelte-spa-router";
  import { logOut } from "../../scripts/auth/logOut";

  export let params;

  const mediaType = params.mediaType;
  const category = params.category;

  if(mediaType !== "tv" && mediaType !== "films") {
    push("*"); // redirect to not found
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
    let apiMediaRef; // declare correct term for api call (movie/tv)
    if(mediaType === "films") {
      apiMediaRef = "movie";
    } else {
      apiMediaRef = "tv";
    }

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

  const mediaList = loadMedia();

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
      <li>
        <ContentCard props={{
          content: content,
          mediaType: mediaType 
        }}/>
      </li>
    
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