<script>
  import { collection, getDoc, getDocs } from "firebase/firestore";
  import getUserRef from "../../scripts/auth/getUserRef";
  import { db } from "../../scripts/fb/firestore";
  import { authStore } from "../../stores/authStore";
  import WatchlistItem from "./WatchlistItem.svelte";
  import { Modals, openModal, closeModal } from 'svelte-modals';
  import tmdbApikey from "../../credentials/tmdbApikey";
  import checkAuth from "../../scripts/auth/checkAuth";
  import { fetchStreamingProviders, fetchTrailerKey } from "../../scripts/tmdbScripts";

  checkAuth();

  let watchlist = getWatchlist();
  let modalDetails = {};

  async function getWatchlist() {
    try {
      // get user's db entry
      const userRef = await getUserRef($authStore.email);
      const userId = (await getDoc(userRef)).id;
      const watchlistSnapshot = await getDocs(collection(db, `users/${userId}/watchlist`));
      let wl = [];
      watchlistSnapshot.forEach(doc => { // iterate through firestore watchlist collection
        const item = {...doc.data()}
        wl.push(item);
      });
      console.log(wl);
      return wl;
    } catch (e) {
      console.log(e);
    }
  }

  // fetches additional data about selected content when its card is clicked, triggers modal popup to display information.
  async function handleItemClick(content) {
    console.log("clicked!");
    try {
      let apiMediaRef; // declare correct term for api call (movie/tv)
      if (content.mediaType === "films") {
        apiMediaRef = "movie";
      } else {
        apiMediaRef = "tv";
      }
      
      const detailsReq = `https://api.themoviedb.org/3/${apiMediaRef}/${content.id}?api_key=${tmdbApikey}&language=en-US`;
      const imdbIdReq = `https://api.themoviedb.org/3/${apiMediaRef}/${content.id}/external_ids?api_key=${tmdbApikey}&language=en-US`;
      
      const detailsRes = await fetch(detailsReq);
      const details = await detailsRes.json();

      const imdbIdRes = await (await fetch(imdbIdReq)).json();
      const imdbId = imdbIdRes.imdb_id;

      const ukStreamingProviders = await fetchStreamingProviders(apiMediaRef, content.id);
      
      console.log(details);
      modalDetails = details;
      modalDetails.mediaType = content.mediaType; // assign media type
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
        info: modalDetails,
        showWatchlistBtn: false
      });
    } catch (e) {
      console.error(e);
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

<div class="container">
  {#await watchlist}
    <p>Fetching watchlist...</p>
  {:then watchlist}
    <h4 class="title">My Watchlist</h4>
    <ul>
      {#each watchlist as watchlistItem}
        <li on:click={() => handleItemClick(watchlistItem)} 
          on:keypress={() => handleItemClick(watchlistItem)}
        >
          <WatchlistItem info={{...watchlistItem}} />
        </li>
      {:else}
        <p>Nothing to see here...</p>
      {/each}
    </ul>
  {/await}
</div>

<style>
  li {
    margin-bottom: 20px;
  }
</style>