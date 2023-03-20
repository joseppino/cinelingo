<script>
  import { collection, deleteDoc, getDoc, getDocs } from "firebase/firestore";
  import { fly, fade } from "svelte/transition";
  import getUserRef from "../../scripts/auth/getUserRef";
  import { db } from "../../scripts/fb/firestore";
  import { authStore } from "../../stores/authStore";

  export let info; // get content info as prop

  const contentDbRef = `${info.mediaType.charAt(0)}${info.id}`; // format of media type + content id for usage as the db document id

  let title;
  info.mediaType === "tv" ? title = info.name : title = info.title; // determine title semantics based on media type

  let visible = true;

  async function removeItem() {
    visible = false;
    try {
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

</script>

{#if visible}
<div class="watchlist-item box" in:fly="{{ y: 200, duration: 2000 }}" out:fade >
  <img src={`https://image.tmdb.org/t/p/w200/${info.poster_path}`} alt="Poster">
  <p class="subtitle">{title}</p>
  <div class="remove-item" on:click|stopPropagation={removeItem} on:keyup={removeItem}>
    <span class="icon">
      <i class="fa-regular fa-trash-can"></i>
    </span>
  </div>
</div>
{/if}

<style>
  .watchlist-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    max-height: 150px;
    height: 150px;
    min-width: 325px;
    margin-right: 0;
    margin-left: 0;
    padding: 0;
    padding-left: 10px;
  }

  .watchlist-item:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,0.3),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }

  img {
    max-height: 120px;
  }

  p {
    max-width: 50%;
    margin-bottom: 0 !important;
  }

  .remove-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    float: right;
    height: 100%;
    border-left: 1px solid rgba(128, 128, 128, 0.461);
    border-top-right-radius: inherit;
    border-bottom-right-radius: inherit;
  }

  .remove-item:hover {
    background-color: rgb(235, 103, 103);
    cursor: pointer;
  }
</style>