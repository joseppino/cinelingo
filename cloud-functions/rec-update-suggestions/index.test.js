const axios = require("axios");

async function retrieveSuggestions(tmdbId, contentType, locale) {
  let suggestions = [];
  try {
    // request to cloud function endpoint to retrieve suggestions
    // const req = `https://cinelingo.nw.r.appspot.com/tmdb_id=${tmdbId}&content_type=${contentType}&locale=${locale.toLowerCase()}`;
    const req = `https://cinelingo.nw.r.appspot.com/retrieve-suggestions/${contentType}/${locale.toLowerCase()}/${tmdbId}`;
    const res = await axios.get(req);
    
    // const resJson = JSON.parse(res);
    console.log(typeof(res));
    const tmdbIds = JSON.parse(res.data).results;
    // console.log(typeof(res.data));
    tmdbIds.forEach(id => suggestions.push(id)); // append retrieved suggestions to candidate list
    return suggestions;
  } catch (e) {
    throw new Error(e);
  }
}

retrieveSuggestions(111, "movie", "fr")
  .then(res => console.log(res));