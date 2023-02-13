<script>
  import { authStore } from "../../stores/authStore";
  import { langStore } from "../../stores/langStore";
  import checkAuth from "../../scripts/auth/checkAuth";
  import { updateDoc } from "firebase/firestore";
  import getUserRef from "../../scripts/auth/getUserRef";
  import getLanguages from "../../scripts/getLanguages";
  import { onMount } from "svelte";

  checkAuth();

  const languages = getLangs();

  async function getLangs () {
    const langs = await getLanguages();
    return langs;
  }

  async function updateLanguagePreference(data) {
    try {
      // get user's db entry
      let userRef = await getUserRef($authStore.email);
      // update firestore DB with new preferred language
      await updateDoc(userRef, {
        languagePreference: data.language
      });
    } catch (e) {
      console.log(e);
    }
  }
  
  langStore.subscribe((data) => { // on language change...
    updateLanguagePreference(data);
    // openPopup
    // settimeout -> closepopup
  });

</script>

<div class="container">
  <p class="title has-text-weight-bold">Language Select</p>
  <div class="columns">
    {#await languages}
      <p>Please wait...</p>
    {:then languages}
      {#each languages as lang}
        <div class="column">
          <div class="card is-clickable" 
          on:click={() => langStore.set({languageName: lang[0], locale: lang[1].reference, flag: lang[1].flag})} 
          on:keypress={() => langStore.set({languageName: lang[0], locale: lang[1].reference, flag: lang[1].flag})} >
            <div class="card-image">
              <img src={lang[1].imgURI} alt={lang[1].name + " flag"}>
            </div>
            <div class="card-footer pt-1">
              <p class="title">{lang[1].name}</p>
            </div>
          </div>
        </div>
      {/each}
    {/await}
  </div>
</div>

<style>
  .card {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.3),0 0 0 1px rgba(10,10,10,.02);
  }

  .card:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.7),0 0 0 1px rgba(10,10,10,.02);
  }

  .card-footer {
    justify-content: center;
  }
</style>