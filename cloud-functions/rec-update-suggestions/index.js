const functions = require('@google-cloud/functions-framework');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const FIRESTORE_SERVICE_ACCOUNT = process.env.FIRESTORE_SERVICE_ACCOUNT;

functions.http('entry', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    const params = req.body;
    try {
      if(["media_type", "user_id", "locale"].every(key => Object.keys(params).includes(key))) {
        updateSuggestions(params.media_type, params.user_id, params.locale)
          .then(res.sendStatus(200));
      } else {
        res.sendStatus(400);
      }
    } catch (e) {
      res.sendStatus(500);
    }
  }
  
});

initializeApp({
  credential: cert(JSON.parse(FIRESTORE_SERVICE_ACCOUNT))
});

const db = getFirestore();

// inital function: takes user id and triggers retrieval of suggestions for a given user, content type, and locale
async function updateSuggestions(contentType, userId, locale) {
  const docRef = db.doc(`suggestedContent/${userId}`);
  const doc = await docRef.get();
  // if the user has no existing suggestions, generate some basic ones
  if(!doc.exists) {
    const hasMoviePreferences = (await db.doc(`users/${userId}/videoPreferences/films`).get()).exists;
    if(hasMoviePreferences) {
      await generateBasicSuggestions("movie", userId, locale);
    }
    const hasTvPreferences = (await db.doc(`users/${userId}/videoPreferences/tv`).get()).exists;
    if(hasTvPreferences) {
      await generateBasicSuggestions("tv", userId, locale);
    }
  } else {
    await generateNormalSuggestions(contentType, userId, locale);
  }
}

// if user has not made any site interactions, generate some basic suggestions...
// ...using their allocated preferences
async function generateBasicSuggestions(contentType, userId, locale) {
  let dbRef = "";
  // set database contentType reference variable
  contentType === "movie" ? dbRef = "films" : dbRef = "tv"; 
  const docRef = db.doc(`users/${userId}/videoPreferences/${dbRef}`);
  const snapshot = await docRef.get();
  const sampleTitles = snapshot.data().sampleTitles;
  let suggestedTitles = [];
  for(const tmdbId of sampleTitles) {
    const suggestions = await retrieveSuggestions(tmdbId, contentType, locale);
    for (const _tmdbId of suggestions) {
      const title = await fetchTitleDetails(_tmdbId, contentType);
      suggestedTitles.push(title);
    }
  }
  if(suggestedTitles) {
    let titlesStringified = [];
    for(const title of suggestedTitles) {
      stringifiedTitle = JSON.stringify(title);
      if(!titlesStringified.includes(stringifiedTitle)) {
        await db.collection("suggestedContent")
          .doc(userId)
          .collection(dbRef)
          .add(title);
        titlesStringified.push(stringifiedTitle);
      }
    }
  }
  return(true);
}

// generates suggestions via the standard method of combining:
// user liked content, disliked content, watchlist, and preferences...
// to produce a set of recommendations that are pushed to the database.
async function generateNormalSuggestions(contentType, userId, locale) {
  let dbRef = "";
  // set database contentType reference variable
  contentType === "movie" ? dbRef = "films" : dbRef = "tv";

  // working with the user's interaction records to retrieve, score, and rerank the suggestions.
  const timestamp = parseInt(Date.now());
  const monthInMs = 2419200000; // approximating a month as 4 weeks in milliseconds
  const userLiked = await db.collection(`users/${userId}/liked`).where("timestamp", ">", (timestamp - (monthInMs * 2))).limit(10).get(); // retrieve records less than 2 months old
  const userDisliked = await db.collection(`users/${userId}/disliked`).where("timestamp", ">", (timestamp - (monthInMs * 2))).limit(10).get(); // limit records to speed up computation
  const userWatchlist = await db.collection(`users/${userId}/watchlist`).get(); // retrieve all watchlist items
  const sampleTitles = (await db.doc(`users/${userId}/videoPreferences/${dbRef}`).get()).data().sampleTitles;

  let candidateIds = [];
  let userInteractionIds = [];
  // fetch suggestions for liked items
  for(const likedItem of userLiked.docs) {
    const tmdbId = likedItem.data().id;
    userInteractionIds.push(tmdbId);
    const suggestions = await retrieveSuggestions(tmdbId, contentType, locale);
    candidateIds = [...candidateIds, ...suggestions];
  }

  // fetch suggestions for watchlisted items
  for(const watchlistedItem of userWatchlist.docs) {
    const tmdbId = watchlistedItem.data().id;
    userInteractionIds.push(tmdbId);
    const suggestions = await retrieveSuggestions(tmdbId, contentType, locale);
    candidateIds = [...candidateIds, ...suggestions]; // spread additional suggestions into candidateIds list
  }

  // sample titles are English-speaking titles, so no need to exclude from filter
  for(const sampleTitle of sampleTitles) {
    const tmdbId = sampleTitle;
    const suggestions = await retrieveSuggestions(tmdbId, contentType, locale);
    candidateIds = [...candidateIds, ...suggestions];
  }

  // filter out titles user has already liked or wishlisted as recommendations
  candidateIds.filter(id => !userInteractionIds.includes(id));

  // fetch 'anti-suggestions' for content similar to that which the user has disliked
  let antiSuggestions = [];
  for(const dislikedItem of userDisliked.docs) {
    const tmdbId = dislikedItem.data().id;
    const similarToDisliked = await retrieveSuggestions(tmdbId, contentType, locale);
    antiSuggestions = [...antiSuggestions, ...similarToDisliked, tmdbId]; // update anti-suggestions with disliked item and similar items to that
  }

  const recommendations = rerank(candidateIds, antiSuggestions);

  let candidates = [];
  // fetch details for each candidate and push into list
  for(const id of recommendations) {
    const candidate = await fetchTitleDetails(id, contentType);
    candidates.push(candidate);
  }
  
  if(!candidates) {
    return;
  }

  

  if(recommendations) {
    // delete existing recommendations
    await deleteCollection(db, `suggestedContent/${userId}/${dbRef}`, 20);

    // add new recommendations to collection
    for(const rec of recommendations) {
      await db.collection("suggestedContent")
        .doc(userId)
        .collection(dbRef)
        .add(rec);
    }
  }
}

async function retrieveSuggestions(tmdbId, contentType, locale) {
  let suggestions = [];
  try {
    // request to cloud function endpoint to retrieve suggestions
    const req = `https://rec-retrieve-suggestions-ic5gbb3a2q-nw.a.run.app?tmdb_id=${tmdbId}&content_type=${contentType}&locale=${locale.toLowerCase()}`;
    const res = await axios.get(req);
    const resJson = JSON.parse(res);
    const tmdbIds = resJson.data.results;
    tmdbIds.forEach(id => suggestions.push(id)); // append retrieved suggestions to candidate list
    return suggestions;
  } catch (e) {
    throw new Error(e);
  }
}

async function fetchTitleDetails(tmdbId, contentType) {
  try {
    const req = `https://api.themoviedb.org/3/${contentType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;
    const res = await axios.get(req);
    return res.data;
  } catch (e) {
    throw new Error(e);
  }
}

function rerank(candidateIds, antiSuggestions) {
  // remove any duplicate candidates by converting list to a set and back
  let candidates = [...(new Set(candidateIds))];

  // remove any intersecting items between candidates and anti-suggestions
  candidates = candidates.filter(item => !antiSuggestions.includes(item));

  // to add add some unpredictability, shuffle the remaining list of candidates
  // shuffleArray(candidates);

  return candidates;
}

// Randomize array in-place using Durstenfeld shuffle algorithm 
// Credit: https://stackoverflow.com/a/12646864
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}