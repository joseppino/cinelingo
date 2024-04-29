const functions = require('@google-cloud/functions-framework');
const admin = require("firebase-admin");
const axios = require("axios");

const tmdbApikey = process.env.tmdb_apikey;

functions.http('entry', async (req, res) => {
  results = [];
  results.push(await refreshPopularMovies());
  results.push(await refreshPopularTvShows());
  results.push(await refreshTopRatedMovies());
  results.push(await refreshTopRatedTvShows());
  if(results.includes(500)) {
    res.send("One or more processes failed - see logs");
  } else {
    res.send("Video content database successfully updated!");
  }
});

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.firestore_serviceaccount))
});

const firestore = admin.firestore();

async function getSupportedLanguages() {
  const snapshot = await firestore.collection("/languages").get();
  let locales = snapshot.docs.map(doc => doc.data());
  return locales;
}

async function getImdbId(mediaType, id) {
  const req = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${tmdbApikey}&language=en-US`;
  const res = await axios.get(req);
  return res.data.imdb_id;
}

async function getTmdbMedia(mediaCollection, locale, numPages) {
  const locale_ = locale.toLowerCase();
  let req = "";
  let mediaType = ""
  switch (mediaCollection) {
    case "popularTv":
      req = "https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=popularity.desc&vote_count.gte=10";
      mediaType = "tv";
      break;
    case "topRatedTv":
      req = "https://api.themoviedb.org/3/discover/tv?sort_by=vote_average.desc&vote_count.gte=100";
      mediaType = "tv"
    break;
    case "popularMovies":
      req = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&include_adult=false&language=en-US&vote_count.gte=100";
      mediaType = "movie";
      break;
    case "topRatedMovies":
      req = "https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&include_adult=false&vote_count.gte=1000&language=en-US";
      mediaType = "movie";
      break;
    default:
      throw new Error("Specified media collection was not recognised.");
  }
  try {
    let media = [];
    for(let i=1; i<=numPages; i++) {
      // request pages of media collection from API sequentially, with added parameters
      req = req + `&page=${i}&with_original_language=${locale_}&api_key=${tmdbApikey}`;
      const res = await axios.get(req);
      if (res.data.results.length > 1) { // if results returned
        let resultsWithImdbIds = [];
        for(item of res.data.results) {
          let imdbId = await getImdbId(mediaType, item.id);
          if(imdbId) {
            item.imdbId = imdbId;
          }
          resultsWithImdbIds.push(item);
        }
        media.push(resultsWithImdbIds);
      }
    }
    
    if (!media) { // sometimes api call fails, retry with different parameters in this case
      for(let i=1; i<=numPages; i++) {
        req = req + "&with_watch_monetization_types=flatrate";
        const res = await axios.get(req);
        if (res.data.results.length > 1) { // if results returned
          let resultsWithImdbIds = [];
          for(item of res.data.results) {
            let imdbId = await getImdbId(mediaType, item.id);
            if(imdbId) {
              item.imdbId = imdbId;
            }
            resultsWithImdbIds.push(item);
          }
          media.push(resultsWithImdbIds);
        } else {
          throw new Error("Could not retrieve data from API");
        }
      }
    }

    return media;

  } catch (e) {
    throw e;
  }
}

async function updateFirestoreCollection(locales, mediaType, category, mediaCollection) {
  for (const locale of locales) {
    const collection = firestore.collection(`/${mediaType}/${category}/${locale}`);
    if(mediaCollection[locale].length > 0) { // check replacement items exist
      const documents = await collection.listDocuments();
      for(const document of documents) {
        firestore.doc(document.path).delete(); // delete old documents
      }
      for (const page of mediaCollection[locale]) {
        for(const item of page) {
          collection.add(item); // add new media as a document
        }
      }
    }
  }
}

const refreshPopularMovies = (async () => {
  try {
    const locales = await getSupportedLanguages();
    const refs = locales.map(locale =>  locale.reference);
    const numPages = 3;
    let popMovies = {};
    for (const localeRef of refs) {
      // get data from API
      const movies = await getTmdbMedia("popularMovies", localeRef, numPages);
      popMovies[localeRef] = movies;
    }
    if (Object.keys(popMovies).length < 1) {
      throw new Error("Failure: movies list was empty.");
    } else {
      await updateFirestoreCollection(refs, "movies", "popular", popMovies);
    }
    return 200;
  } catch (e) {
    console.log(e);
    return 500;
  }
});

const refreshPopularTvShows = (async () => {
  try {
    const locales = await getSupportedLanguages();
    const refs = locales.map(locale =>  locale.reference);
    const numPages = 3;
    let popTV = {};
    for (const localeRef of refs) {
      // get data from API
      const shows = await getTmdbMedia("popularTv", localeRef, numPages);
      popTV[localeRef] = shows;
    }
    if (Object.keys(popTV).length < 1) {
      throw new Error("Failure: tv shows list was empty.");
    } else {
      await updateFirestoreCollection(refs, "tv", "popular", popTV);
    }
    return 200;
  } catch (e) {
    console.log(e);
    return 500;
  }
});

const refreshTopRatedMovies = (async () => {
  try {
    const locales = await getSupportedLanguages();
    const refs = locales.map(locale =>  locale.reference);
    const numPages = 3;
    let topMovies = {};
    for (const localeRef of refs) {
      // get data from API
      const movies = await getTmdbMedia("topRatedMovies", localeRef, numPages);
      topMovies[localeRef] = movies;
    }
    if (Object.keys(topMovies).length < 1) {
      throw new Error("Failure: movies list was empty.");
    } else {
      await updateFirestoreCollection(refs, "movies", "top_rated", topMovies);
    }
    return 200;
  } catch (e) {
    console.log(e);
    return 500;
  }
});

const refreshTopRatedTvShows = (async () => {
  try {
    const locales = await getSupportedLanguages();
    const refs = locales.map(locale =>  locale.reference);
    const numPages = 3;
    let topTV = {};
    for (const localeRef of refs) {
      // get data from API
      const shows = await getTmdbMedia("topRatedTv", localeRef, numPages);
      topTV[localeRef] = shows;
    }
    if (Object.keys(topTV).length < 1) {
      throw new Error("Failure: tv shows list was empty.");
    } else {
      await updateFirestoreCollection(refs, "tv", "top_rated", topTV);
    }
    return 200;
  } catch (e) {
    console.log(e);
    return 500;
  }
});
