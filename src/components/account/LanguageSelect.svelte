<script>
  import { authStore } from "../../stores/authStore";
  import { langStore } from "../../stores/langStore";
  import checkAuth from "../../scripts/auth/checkAuth";

  checkAuth();

  const languages = [
    {
      id: 1,
      language: "French",
      flag: "🇫🇷",
      imgURI: "https://firebasestorage.googleapis.com/v0/b/spongebath-fyp.appspot.com/o/images%2Fflags%2Ffrance.png?alt=media&token=56d3769d-e011-4449-9e49-e561a26b7ffa"
    },
    {
      id: 2,
      language: "Spanish",
      flag: "🇪🇸",
      imgURI: "https://firebasestorage.googleapis.com/v0/b/spongebath-fyp.appspot.com/o/images%2Fflags%2Fspain.png?alt=media&token=56c73e47-8906-42b8-b372-fddea9069454"
    },
    {
      id: 3,
      language: "Italian",
      flag: "🇮🇹",
      imgURI: "https://firebasestorage.googleapis.com/v0/b/spongebath-fyp.appspot.com/o/images%2Fflags%2Fitaly.png?alt=media&token=1297acdb-e4c5-4aab-b542-bf60239eea8b"
    }
  ];

</script>

<div class="container">
  <p class="title has-text-weight-bold">Language Select</p>
  <div class="columns">
    {#each languages as lang}
      <div class="column">
        <div class="card is-clickable" 
        on:click={() => langStore.set({language: lang.language, flag: lang.flag})} 
        on:keypress={() => langStore.set({language: lang.language, flag: lang.flag})} >
          <div class="card-image">
            <img src={lang.imgURI} alt={lang.language + " flag"}>
          </div>
          <div class="card-footer mt-3">
            <p class="title">{lang.language}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .card:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.7),0 0 0 1px rgba(10,10,10,.02);
  }

  .card-footer {
    justify-content: center;
  }
</style>