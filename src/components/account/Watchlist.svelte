<script>
  import { collection, getDoc, getDocs } from "firebase/firestore";
  import getUserRef from "../../scripts/auth/getUserRef";
  import { db } from "../../scripts/fb/firestore";
  import { authStore } from "../../stores/authStore";
  import WatchlistItem from "./WatchlistItem.svelte";
  import { Modals, openModal, closeModal } from 'svelte-modals';
  import tmdbApikey from "../../credentials/tmdbApikey";

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

      const ukStreamingProviders = await getStreamingProviders(apiMediaRef, content.id);
      
      console.log(details);
      modalDetails = details;
      modalDetails.mediaType = content.mediaType; // assign media type
      if(imdbId) { // check id is not null
        modalDetails.imdbId = imdbId; // add imdb id property
      }
      
      if (ukStreamingProviders) {
        modalDetails.ukStreamingProviders = ukStreamingProviders; // if any, add streaming providers to details
      } else {
        modalDetails.ukStreamingProviders = [];
      }

      console.log(modalDetails);
      openModal(() => import("../explore/CardModal.svelte"), {
        info: modalDetails,
        showWatchlistBtn: false
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
    on:keyup={closeModal}
  />
</Modals>

<div class="container">
  {#await watchlist}
    <p>Fetching watchlist...</p>
  {:then watchlist}
    <h4 class="title">My Watchlist</h4>
    <ul>
      {#each watchlist as watchlistItem}
        <li on:click={() => handleItemClick(watchlistItem)} on:keyup={() => handleItemClick(watchlistItem)}>
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