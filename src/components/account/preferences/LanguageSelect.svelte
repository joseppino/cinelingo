<script>
  import { authStore } from "../../../stores/authStore";
  import { langStore } from "../../../stores/langStore";
  import checkAuth from "../../../scripts/auth/checkAuth";
  import { updateDoc } from "firebase/firestore";
  import getUserRef from "../../../scripts/auth/getUserRef";
  import getLanguages from "../../../scripts/getLanguages";
  import { fly } from "svelte/transition";
  import toast from "svelte-french-toast";
  import capitaliseFirstLetter from "../../../scripts/capitaliseFirstLetter";

  checkAuth();
  
  let cardClicked = false;

  const languages = getLangs();

  async function getLangs () {
    const langs = await getLanguages();
    return langs;
  }

  function handleCardClick(e) {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
      // @ts-ignore
      card.style.border = "";
    });
    let styleTarget = e.target;
    console.log(styleTarget);
    styleTarget.style.border = "2px solid #a39dc1";
  }

  async function updateLanguagePreference(data) {
    try {
      // get user's db entry
      let userRef = await getUserRef($authStore.email);
      // update firestore DB with new preferred language
      await updateDoc(userRef, {
        languagePreference: data.languageName
      });
    } catch (e) {
      console.log(e);
    }
  }
  
  langStore.subscribe((data) => { // on language change...
    updateLanguagePreference(data);
    if(cardClicked) {
      toast.success(
        `Content language changed to ${capitaliseFirstLetter(data.languageName)}`,
        {
          duration: 3000
        }
      );
      cardClicked = false;
    }
  });

</script>

<div class="container">
  <p class="title has-text-weight-bold">Select a language to learn</p>
  <div class="columns">
    {#await languages}
      <p>Please wait...</p>
    {:then languages}
      {#each languages as lang}   
        <div class="column col">
          <div class="card is-clickable" in:fly="{{ y: 200, duration: 2000 }}"
            on:click={(e) => {
                if (lang[0] !== $langStore.languageName) { // check not already set to that language
                  handleCardClick(e);
                  cardClicked = true;
                  langStore.set({languageName: lang[0], locale: lang[1].reference, flag: lang[1].flag});
                } else {
                  // notify the user
                  toast.error(`Content language already set to ${capitaliseFirstLetter(lang[0])}`);
                }
              }
            }
            on:keypress={() => {
              cardClicked = true;
              langStore.set({languageName: lang[0], locale: lang[1].reference, flag: lang[1].flag})}
             }>
            <div class="card-image">
              <img src={lang[1].imgURI} alt={lang[1].name + " flag"}>
            </div>
            <div class="card-footer pt-1 cf">
              <p class="subtitle sbt">
                <span>{lang[1].name}</span>
                <span><em>{capitaliseFirstLetter(lang[1].nativeScript)}</em></span>
              </p>
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
    background-color: #f7f7f7;
    padding: 10px;
  }

  .card:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.7),0 0 0 1px rgba(10,10,10,.02);
  }

  .card-image {
    pointer-events: none;
    padding: 3px;
  }

  .card-footer {
    justify-content: center;
  }

  .subtitle {
    display: flex;
    flex-direction: column;
  }

  .col, .cf, .sbt {
    pointer-events: none;
  }

</style>