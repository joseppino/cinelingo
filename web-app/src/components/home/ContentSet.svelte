<script>
  import { Modals, closeModal, openModal } from "svelte-modals";
  import tmdbApikey from "../../credentials/tmdbApikey";
  import { query, orderBy, limit, getDoc, collection, getDocs } from "firebase/firestore";
  import { db } from "../../scripts/fb/firestore";
  import getUserRef from "../../scripts/auth/getUserRef";
  import { authStore } from "../../stores/authStore";
  import { langStore } from "../../stores/langStore";
  import { fetchGenres, fetchStreamingProviders, fetchTrailerKey } from "../../scripts/tmdbScripts";

  export let setType; // distinguish between suggestions and popular content
  export let mediaType;
  export let setSize = 5;

  let apiMediaRef; // declare correct term for api call (movie/tv)
  if (mediaType === "films") {
    apiMediaRef = "movie";
  } else {
    apiMediaRef = "tv";
  }

  let contentSet = fetchContent(setType);
  
  async function fetchContent(setType) {
    let _contentSet = [];

    let dbMediaRef;
    if (mediaType === "tv") {
      dbMediaRef = "tv";
    } else if (mediaType === "films") {
      dbMediaRef = "movies";
    }

    let collectionPath;
    if(setType === "recommended") {
      // fetch user's record from DB
      const userRef = await getUserRef($authStore.email);
      const userDocSnap = await getDoc(userRef);
      const userId = userDocSnap.id;
      collectionPath = `suggestedContent/${userId}/${mediaType}`;

    } else {
      const locale = await $langStore.locale.toUpperCase();
      collectionPath = `${dbMediaRef}/popular/${locale}`;
    }

    const colRef = collection(db, collectionPath);
    const q = query(colRef, orderBy("popularity", "desc"), limit(setSize+2)); // adding 2 allows for duplicates to be removed if necessary
    const querySnapshot = await getDocs(q);
    const genres = await fetchGenres(apiMediaRef);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const content = {...doc.data()}
      if(setType !== "recommended") {
        content.genres = [];
        for (const id of content.genre_ids) {
          for (const genre of genres) {
            if (genre.id === id) { // check for matching genre ids
              content.genres.push({id: genre.id, name: genre.name});
            }
          }
        }
      }
      _contentSet.push(content);
    });
    return [...new Map(_contentSet.map(item => [item["id"], item])).values()].slice(0,5);
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
      
      let modalDetails = details;
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
      openModal(() => import("../explore/CardModal.svelte"), {
        info: modalDetails
      });
    } catch (e) {
      console.log(e);
    } 
  }
</script>

<Modals>
  <div
    slot="backdrop"
    class="backdrop"
    on:click={closeModal}
    on:keypress={closeModal}
  />
</Modals>


<div>
  {#await contentSet}
    <p>Fetching content...</p>
  {:then contentSet}
    {#if contentSet.length}
      <ul>
        {#each contentSet as content}
          <li on:click={() => handleCardClick(content)} 
            on:keypress={() => handleCardClick(content)}>
            <div role="button" tabindex="0">
              {#if mediaType === "films"}
                <img class="poster" src={`https://image.tmdb.org/t/p/w300/${content.poster_path}`} alt={`Poster for the film, ${content.title}`}>
              {:else}
                <img class="poster" src={`https://image.tmdb.org/t/p/w300/${content.poster_path}`} alt={`Poster for the TV show, ${content.name}`}>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <h2 class="subtitle">No recommendations yet!</h2>
    {/if}
  {/await}
</div>

<style>
  .poster {
    min-width: 150px;
    width: 150px;
  }

  .poster:hover {
    box-shadow: .1em .3em .5em -.125em rgba(10,10,10,0.6),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }

  ul {
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
  }

  li {
    margin: 5px 5px;
  }

</style>