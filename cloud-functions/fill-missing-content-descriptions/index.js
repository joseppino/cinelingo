const functions = require('@google-cloud/functions-framework');
const admin = require("firebase-admin");
const axios = require("axios");

TMDB_API_KEY = process.env.TMDB_API_KEY;

functions.http('entry', async (req, res) => {
  try {
    const result = await fillMissingDescriptions();
    if(result === 500) {
      res.send("Process failed - see logs");
    } else {
      res.send("Database updated with new descriptions successfully.");
    }
  } catch (e) {
    throw new Error(e);
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

async function fillEmptyDescriptions(collectionPath, contentType) {
  try {
    const snapshot = await firestore.collection(collectionPath).get();
    for(const doc of snapshot.docs) {
      const fields = await doc.data();
      if(fields.overview.length < 1) {
        console.log(`ID: ${fields.id} missing overview`);
        const req1 = `https://api.themoviedb.org/3/${contentType}/${fields.id}/external_ids?api_key=${TMDB_API_KEY}`;
        axios.get(req1).then(async (res) => {
          if("imdb_id" in res.data) {
            if(res.data.imdb_id) { // check truthiness
              console.log(`IMDb ID: ${res.data.imdb_id} found.`);
              // call cloud function to fetch IMDb description
              const req2 = `https://fetch-imdb-description1-ic5gbb3a2q-nw.a.run.app?imdbId=${res.data.imdb_id}`;
              axios.get(req2).then(res => {
                const description = res.data;
                // set overview to description scraped from IMDb
                doc.ref.update({ overview: description }).then(res => console.log(res));
              });
            }
          }
        });        
      }
    }
  } catch (e) {
    throw new Error (e);
  }
  return 200;
}

const fillMissingDescriptions = async () => {
  try {
    const locales = await getSupportedLanguages();
    const refs = locales.map(locale =>  locale.reference);
    // content collections are divided by language; run function for each division
    let response;
    for(const ref of refs) {
      response = await fillEmptyDescriptions(`/movies/popular/${ref}`, "movie");
      response = await fillEmptyDescriptions(`/movies/top_rated/${ref}`, "movie");
      response = await fillEmptyDescriptions(`/tv/popular/${ref}`, "tv");
      response = await fillEmptyDescriptions(`/tv/top_rated/${ref}`, "tv");
    }
    return 200;
  } catch (e) {
    console.log(e);
    return 500;
  }
}