<script>
  import { db } from "../../scripts/fb/firestore";
  import { collection, getDocs } from "firebase/firestore";
  import { langStore } from "../../stores/langStore";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import ContentCard from "./ContentCard.svelte";
  import tmdbApikey from "../../credentials/tmdbApikey";

  export let params;

  const category = params.category;

  async function getGenres() {
    const req = `https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbApikey}&language=en-US`;
    const res = await fetch(req);
    const obj = await res.json();
    return obj.genres;
  }
  async function loadMovies() {
    const querySnapshot = await getDocs(collection(db, `movies/${category}/${$langStore.locale}`));
    const genres = await getGenres();
    let movies = [];
    querySnapshot.forEach(doc => { // iterate through firestore movie collection
      const movie = {...doc.data()}
      movie.genreNames = [];
      for (const id of movie.genre_ids) {
        for (const genre of genres) {
          if (genre.id === id) { // check for matching genre ids
            movie.genreNames.push(genre.name);
          }
        }
      }
      movies.push(movie);
    });
    return movies;
  }

  const filmList = loadMovies();

</script>

<div>
  {#await filmList}
    <p>Loading films...</p>
  {:then filmList}
    <h1 class="title">Browsing Popular {capitaliseFirstLetter($langStore.languageName)} Films</h1>
    <div class="wrap">
    <ul>
    {#each filmList as film}
      <li>
        <ContentCard props={film}/>
      </li>
    
    {/each}
    </ul>
  </div>
  {:catch error}
    <p>Something went wrong: {error.message}</p>
  {/await}
</div>

<style>
  .wrap {
    column-count: 3;
    column-gap: 2rem;
  }
  li {
    margin-bottom: 1rem;
    page-break-inside: avoid;
  }
</style>