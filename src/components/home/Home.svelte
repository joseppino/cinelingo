<script>
  import ContentSet from "./ContentSet.svelte";
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import checkAuth from "../../scripts/auth/checkAuth";
  import getUserRef from "../../scripts/auth/getUserRef";
  import { authStore } from "../../stores/authStore";
  import { collection, doc, getDoc } from "firebase/firestore";
  import { db } from "../../scripts/fb/firestore";
  
  checkAuth();

  async function checkUserHasRecommendations() {
    const userRef = await getUserRef($authStore.email);
    const userDocSnap = await getDoc(userRef);
    const userId = userDocSnap.id;
    const docRef = doc(db, `suggestedContent/${userId}`);
    const userSuggestions = await getDoc(docRef);
    if(userSuggestions.exists) {
      return true; 
    }
    return false;
  }

  const hasRecommendations = checkUserHasRecommendations();
</script>

<div class="container">
  {#if !$langStore.languageName}
    <p>Loading...</p>
  {:else}
    <section class="section">
      <h1 class="title">
        <span class="icon is-medium">
          <i class="fa-solid fa-fire-flame-curved"></i>
        </span>
        <span>Today's Popular {capitaliseFirstLetter($langStore.languageName)} Content</span> 
      </h1>
      <div class="block box cset">
        <h2 class="subtitle">
          <span class="icon is-medium">
            <i class="fa-solid fa-film"></i>
          </span>
          <span>Films</span>
        </h2>
        <ContentSet setType="popular" mediaType="films" setSize={5}/>
      </div>

      <div class="block box cset">
        <h2 class="subtitle">
          <span class="icon is-medium">
            <i class="fa-solid fa-tv"></i>
          </span>
          <span>Television Shows</span>
        </h2>
        <ContentSet setType="popular" mediaType="tv" setSize={5}/>
      </div>
    </section>
    {#await hasRecommendations}
      <p>Loading Recommendations...</p>
    {:then hasRecommendations}
      {#if hasRecommendations}
        <section class="section">
          <h1 class="title">
            <span class="icon is-medium">
              <i class="fa-regular fa-lightbulb"></i>
            </span>
            <span>Today's Recommended Entertainment</span>
          </h1>
          <div class="block box cset">
            <h2 class="subtitle">
              <span class="icon is-medium">
                <i class="fa-solid fa-film"></i>
              </span>
              <span>Films</span>
            </h2>
            <ContentSet setType="recommended" mediaType="films" setSize={5}/>
          </div>

          <div class="block box cset">
            <h2 class="subtitle">
              <span class="icon is-medium">
                <i class="fa-solid fa-tv"></i>
              </span>
              <span>Television Shows</span>
            </h2>
            <ContentSet setType="recommended" mediaType="tv" setSize={5}/>
          </div>
        </section>
      {/if}
    {/await}
  {/if}
</div>

<style>
  .section {
    background-color: hsla(0, 15%, 5%, 0.02)  }

  .title {
    margin-bottom: 30px !important;
  }

  .subtitle {
    margin-bottom: 3px !important;
  }

  .cset {
    max-width: 100vw;
  }
</style>