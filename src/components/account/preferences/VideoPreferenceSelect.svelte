<script>
  import PreferenceGroup from "./PreferenceGroup.svelte";
  import { videoGroupStore } from "../../../stores/videoGroupStore";
  import { langStore } from "../../../stores/langStore";
  import toast from "svelte-french-toast";
  import getUserRef from "../../../scripts/auth/getUserRef";
  import { authStore } from "../../../stores/authStore";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import { db } from "../../../scripts/fb/firestore";
  import { push } from "svelte-spa-router";
  import requestSuggestionsUpdate from "../../../scripts/requestSuggestionsUpdate";

  export let mediaType;

  let contentList = [];

  // determine which preferences are being modified based on mediaType prop - films or TV
  if(mediaType === "films") {
    contentList = $videoGroupStore.films;
  } else {
    contentList = $videoGroupStore.tv;
  }
  let confButton;
  let allocatedPoints = [];
  $: pointsToAllocate = 3 - allocatedPoints.length;
  $: if(allocatedPoints.length === 3) { // enable button when all points have benen allocated
    try {
      confButton.disabled = false;
    } catch (e) { console.log(e); }
  } else {
    try {
      confButton.disabled = true;
    } catch (e) { console.log(e); }
  }

  // handles user confirming their preferences by updating the database
  // also triggers generation of some content suggestions for the user
  async function submitPreferences() {
    if(!$langStore.languageName) {
      toast.error("A language preference must be selected before submitting video preferences.");
      return null;
    }

    // fetch user's record from DB
    const userRef = await getUserRef($authStore.email);
    const userDocSnap = await getDoc(userRef);
    const userId = userDocSnap.id;

    // select random item from each group for each group id as sample items
    let sampleTitles = [];
    for(let i=0; i<allocatedPoints.length; i++) {
      let videoGroupCollection;
      if(mediaType === "films") {
        videoGroupCollection = $videoGroupStore.films;
      } else {
        videoGroupCollection = $videoGroupStore.tv;
      }
      for(const videoGroup of videoGroupCollection) {
        if(videoGroup.groupId === allocatedPoints[i]) {
          let isUnique = false;
          while (!isUnique) {
            const randomTitleId = getRandomItem(videoGroup.examples).tmdb_id;
            if(!sampleTitles.includes(randomTitleId)) {
              isUnique = true;
              sampleTitles.push(randomTitleId);
            }
          }
        }
      }
    }
    
    // write sample titles to video preferences DB collection
    if(sampleTitles) {
      setDoc(doc(db, `users/${userId}/videoPreferences`, mediaType), {sampleTitles: [...sampleTitles]})
        .then(() => {
          let mRef = "";
          mediaType === "films" ? mRef = "movie" : mRef = "tv";
          requestSuggestionsUpdate(mRef, userId, $langStore.locale.toLowerCase())
            .then(() => console.log("Requested updated recommendations"));
          toast.success(
            `Preferences Updated`,
            {
              duration: 2000
            }
          );
          // redirect to homepage after toast is done.
          setTimeout(() => {
            push("/");
          }, 2000);
        });
    }
  }

  // gets a random item from an array
  function getRandomItem(arr) {
    if(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    } else {
      throw new Error("Invalid array");
    }
  }
</script>

<p class="subtitle is-small">
  For Cinelingo to learn more about your tastes, please allocate <strong>{pointsToAllocate}</strong>
  {#if pointsToAllocate === 1}
    point
  {:else}
    points
  {/if}
  to your favourite groups below.
</p>
<div class="columns mb-2">
  <div class="column">
    {#each contentList.slice(0,Math.floor(contentList.length / 2)) as prefGroup}
      <PreferenceGroup
        groupId={prefGroup.groupId}
        groupName={prefGroup.label}
        contentList={prefGroup.examples}
        bind:allocatedPoints={allocatedPoints}
      />
    {/each}
  </div>
  <div class="column">
    {#each contentList.slice(Math.floor(contentList.length / 2), contentList.length) as prefGroup}
      <PreferenceGroup
        groupId={prefGroup.groupId}
        groupName={prefGroup.label}
        contentList={prefGroup.examples}
        bind:allocatedPoints={allocatedPoints}
      />
    {/each}
  </div>  
</div>
<button 
  class="button confirm-prefs is-primary"
  disabled
  bind:this={confButton}
  on:click={submitPreferences}
  >Confirm Preferences</button>

<style>
  .confirm-prefs {
    width: 200px;
    margin-bottom: 10px;
  }
</style>