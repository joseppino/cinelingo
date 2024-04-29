const functions = require('@google-cloud/functions-framework');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require("axios");

const FIRESTORE_SERVICE_ACCOUNT = process.env.FIRESTORE_SERVICE_ACCOUNT;

initializeApp({
  credential: cert(JSON.parse(FIRESTORE_SERVICE_ACCOUNT))
});

const db = getFirestore();

functions.http("entry", async (req, res) => {
  const usersCollection = db.collection("users");
  const users = (await usersCollection.get()).docs;
  const langCollection = db.collection("languages");
  const langs = (await langCollection.get()).docs;
  for(const user of users) {
    const userId = user.id;
    const langPref = user.data().languagePreference;
    let locale = "";
    for(const lang of langs) {
      if(langPref === lang.id.toLowerCase()) {
        locale = lang.data().reference.toLowerCase();
      }
    }
    // Send a POST request to cloud functions endpoint to trigger suggestions update
    ["movie", "tv"].forEach(mType => {
      axios({
        method: 'post',
        url: 'https://rec-update-suggestions-ic5gbb3a2q-nw.a.run.app',
        data: {
          media_type: mType,
          user_id: userId,
          locale: locale
        }
      });
    });
  }
});