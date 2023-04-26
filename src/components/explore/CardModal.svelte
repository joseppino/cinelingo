<script>
  import { deleteDoc, collection, getDoc, getDocs, setDoc, doc } from "firebase/firestore";
  import { onMount } from "svelte";
  import { Modals, closeModal, openModal } from "svelte-modals";
  import getUserRef from "../../scripts/auth/getUserRef";
  import { db } from "../../scripts/fb/firestore";
  import { authStore } from "../../stores/authStore";
  import GenreTag from "./GenreTag.svelte";
  import TrailerPopup from "./TrailerPopup.svelte";

  // declare props
  export let isOpen;
  export let info;
  export let showWatchlistBtn = true;

  const contentDbRef = `${info.mediaType.charAt(0)}${info.id}`; // format of media type + content id for usage as the db document id

  let onWatchlist = false;
  let isLiked = false;
  let isDisliked = false;

  let showTrailer = false;

  const checkButtonStates = async() => {
    try {
      const userRef = await getUserRef($authStore.email);
      const userId = (await getDoc(userRef)).id;
      const querySnapshotWatchlist = await getDocs(collection(db, `users/${userId}/watchlist`));
      querySnapshotWatchlist.forEach(doc => {
        if(doc.id === contentDbRef) {
          onWatchlist = true;
        }
      });
      const querySnapshotLiked = await getDocs(collection(db, `users/${userId}/liked`));
      querySnapshotLiked.forEach(doc => {
        if(doc.id === contentDbRef) {
          isLiked = true;
        }
      });
      if(!isLiked) { // like/dislike are mutually exclusive, so if isLiked is true above, this can be skipped
        const querySnapshotDisliked = await getDocs(collection(db, `users/${userId}/disliked`));
        querySnapshotDisliked.forEach(doc => {
          if(doc.id === contentDbRef) {
            isDisliked = true;
          }
        });
      }
    } catch(e) {
      console.log(e);
    }
  }

  const getRuntimeInHours = (runtime) => {
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    let hrString;
    hours > 1 ? hrString = "hours" : hrString = "hour";
    let minString;
    mins > 1 ? minString = "minutes" : minString = "minutes";
    let newRuntime;
    // check which parts to show (mins/hrs)
    if (hours > 0 && mins > 0) { 
      newRuntime = `${hours} ${hrString}, ${mins} ${minString}`;
    } else if (hours > 0 && mins < 1){
      newRuntime = `${hours} ${hrString}`;
    } else {
      newRuntime = `${mins} ${minString}`;
    }
    return newRuntime;
  }

  const addToWatchlist = async() => {
    try {
      onWatchlist = true; // update button state
      const userRef = await getUserRef($authStore.email);
      const userId = (await getDoc(userRef)).id;
      const docRef = await setDoc(doc(db, `users/${userId}/watchlist`, contentDbRef), {...info}); // spread content info into new firebase doc in watchlist collection
    } catch(e) {
      console.log(e);
    }
  }

  const removeFromWatchlist = async() => {
    try {
      onWatchlist = false; // update button state
      const userRef = await getUserRef($authStore.email);
      const userId = (await getDoc(userRef)).id;
      const querySnapshot = await getDocs(collection(db, `users/${userId}/watchlist`));
      querySnapshot.forEach(doc => {
        if(doc.id === contentDbRef) {
          deleteDoc(doc.ref); // delete doc from watchlist
        }
      });
    } catch(e) {
      console.log(e);
    }
  }

  const addToLikedOrDisliked = async(userId, collectionName) => {
    const timestamp = Date.now();
    // spread content info into new firebase doc in liked collection along with timestamp
    await setDoc(doc(db, `users/${userId}/${collectionName}`, contentDbRef), { ...info, timestamp });
  }

  const removeFromLikedOrDisliked = async(userId, collectionName) => {
    const querySnapshot = await getDocs(collection(db, `users/${userId}/${collectionName}`));
    querySnapshot.forEach(doc => {
      if(doc.id === contentDbRef) {
        deleteDoc(doc.ref); // remove item from "liked" collection
      }
    });
  }

  const handleLikeClick = async() => {
    try {
      const userRef = await getUserRef($authStore.email);
      const userId = (await getDoc(userRef)).id;

      if (isDisliked) { // states are mutually exclusive; if liked, remove dislike
        isDisliked = false; // update button state
        removeFromLikedOrDisliked(userId, "disliked");
      }

      if (isLiked) { // check if content is already liked
        isLiked = false; // update button state
        removeFromLikedOrDisliked(userId, "liked");
      } else {
        isLiked = true; // update button state
        addToLikedOrDisliked(userId, "liked");
      }
    } catch(e) {
      console.error(e);
    }
  }

  const handleDislikeClick = async() => {
    try {
      const userRef = await getUserRef($authStore.email);
      const userId = (await getDoc(userRef)).id;

      if (isLiked) { // states are mutually exclusive; if disliked, remove like
         isLiked = false; // update button state
         removeFromLikedOrDisliked(userId, "liked");
      }

      if (isDisliked) { // check if content is already disliked (toggle action)
        isDisliked = false; // update button state
        removeFromLikedOrDisliked(userId, "disliked");
      } else {
        isDisliked = true; // update button state
        addToLikedOrDisliked(userId, "disliked");
      }
    } catch(e) {
      console.error(e);
    }
  }

  onMount(checkButtonStates); // update button states when component is mounted to DOM

</script>

<!-- <Modals>
  <div
    slot="backdrop"
    class="backdrop"
    on:click={closeModal}
    on:keyup={closeModal}
  />
</Modals> -->

{#if isOpen}
  <div role="dialog" class="modal is-active">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="modal-background" on:click={closeModal}></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{info.title ? info.title : info.name}</p>
        <button class="delete" aria-label="close" on:click={closeModal}></button>
      </header>
      <section class="modal-card-body">
        <section class="overview block">
          <figure class="image modal-poster">
            <img src={`https://image.tmdb.org/t/p/w400/${info.poster_path}`} alt="Poster">
            {#if info.trailerKey}
              <p class="overlay">
                <button class="button is-ghost" on:click={() => showTrailer = true}>
                  <span class="icon is-large">
                    <i class="fas fa-2x fa-solid fa-play"></i>
                  </span>
                </button>
              </p>
            {/if}
          </figure>
          <div class="block text-section">
            {#if info.overview}
            <h3 class="subtitle card-subtitle"><strong>Overview</strong></h3>
            <p>{info.overview}</p>
            {/if}
            {#if info.tagline}
              <br>
              <p><i>"{info.tagline}"</i></p>
            {/if}
          </div>
        </section>
        <section class="info block">
          <div class="info-top">
            <div class="block">
              <p class="subtitle mb-1">Details</p>
              {#if info.original_title && info.title.toLowerCase() !== info.original_title.toLowerCase()}
                <p>Original Title: {info.original_title}</p>
              {/if}
              {#if info.original_name && info.name !== info.original_name}
                <p>Original Name: {info.original_name}</p>
              {/if}
              {#if info.number_of_seasons}
                <p>{info.number_of_seasons} {info.number_of_seasons > 1 ? "seasons" : "season"}</p>
              {/if}
              {#if info.number_of_episodes}
                <p>{info.number_of_episodes} {info.number_of_episodes > 1 ? "episodes" : "episode"}</p>
              {/if}
              {#if info.homepage}
                <p><a href={info.homepage} target="_blank" rel="noreferrer">Info Page</a></p>
              {/if}
              {#if info.imdbId}
                <p>See more on <a href={`https://www.imdb.com/title/${info.imdbId}`} target="_blank" rel="noreferrer">IMDb</a></p>
              {/if}
              {#if info.runtime}
                <p>Runtime: {getRuntimeInHours(info.runtime)}</p>
              {/if}
            </div>
            {#if info.ukStreamingProviders.length}
              <div class="block">
                <p class="subtitle">Streaming On</p>
                <div class="provider-list">
                  {#each info.ukStreamingProviders as provider}
                      <img on:click={() => open(`https://duckduckgo.com/?q=${provider.provider_name}%20streaming&kp=-1&kl=us-en`)}
                      on:keyup={() => open(`https://duckduckgo.com/?q=${provider.provider_name}%20streaming&kp=-1&kl=us-en`)}
                      class="provider-logo" 
                      width="50px" height="50px" 
                      src={`https://image.tmdb.org/t/p/w200/${provider.logo_path}`} 
                      alt={`${provider.provider_name} logo`}>
                  {/each}
                </div>
              </div>
            {/if}
        </div>
        <div class="info-bottom">
          {#if info.genres}
            {#each info.genres as genre}
              <GenreTag {genre} />
            {/each}
          {/if}
        </div>
        </section>
      </section>
      <footer class="modal-card-foot">
        {#if !onWatchlist && showWatchlistBtn}
          <button class="button" on:click={addToWatchlist}>
            <span class="icon">
              <i class="fa-solid fa-plus"></i>
            </span>
            <span>Save to Watchlist</span>
          </button>
        {:else if onWatchlist && showWatchlistBtn}
          <button class="button is-success" on:click={removeFromWatchlist}>
            <span class="icon">
              <i class="fa-solid fa-check"></i>
            </span>
            <span>Saved to Watchlist!</span>
          </button>
        {/if}

        <div>
          <button class="button" on:click={handleLikeClick}>
            <span class="icon">
              {#if isLiked}
                <i class="fa-solid fa-thumbs-up"></i>
              {:else}
                  <i class="fa-regular fa-thumbs-up"></i>
              {/if}
            </span>
          </button>

          <button class="button" on:click={handleDislikeClick}>
            <span class="icon">
              {#if isDisliked}
                <i class="fa-solid fa-thumbs-down"></i>
              {:else}
                <i class="fa-regular fa-thumbs-down"></i>
              {/if}
            </span>
          </button>
        </div>
      </footer>
    </div>
  </div>
{/if}
{#if showTrailer}
  <TrailerPopup trailerKey={info.trailerKey} bind:showTrailer={showTrailer}/>
{/if}

<style>
  .modal-background {
    background-color: rgba(10, 10, 10, 0.6);
  }

  .modal-poster {
    width: 150px;
    flex-shrink: 0;
    margin-right: 10px;
  }

  .card-subtitle {
    margin-bottom: 1rem !important;
  }

  .image {
    position: relative;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width:100%;    
    height:100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .overview {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .text-section {
    max-width: 400px;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .info-top {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .info-bottom {
    margin-top: 5px;
  }

  .provider-list {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .provider-list img {
    margin-left: 5px;
    margin-right: 5px;
  }

  .provider-list img:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,0.6),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }

  .provider-logo {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.2),0 0 0 1px rgba(10,10,10,.02);
  }

  .modal-card-foot {
    justify-content: space-around;
  }
</style>