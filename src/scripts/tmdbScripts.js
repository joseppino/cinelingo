import tmdbApikey from "../credentials/tmdbApikey";

export async function fetchTrailerKey(contentType, contentId) {
  try {
    const req = `https://api.themoviedb.org/3/${contentType}/${contentId}/videos?api_key=${tmdbApikey}&language=en-US`;
    const res = await fetch(req);
    const data = await res.json();
    for(const result of data.results) {
      if(result.type === "Trailer") {
        return result.key;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

// fetches list of services currently streaming the requested content
export async function fetchStreamingProviders(contentType, contentId) {
  try {
    const req = `https://api.themoviedb.org/3/${contentType}/${contentId}}/watch/providers?api_key=${tmdbApikey}`;
    const res = await fetch(req);
    const data = await res.json();
    let ukStreamingProviders;
    if(data.results.GB) { // check content has providers for the GB region
      data.results.GB.flatrate ? ukStreamingProviders = data.results.GB.flatrate : ukStreamingProviders = []; // flatrate refers to streaming providers as opposed to renting/purchasing providers.
    }
    if(ukStreamingProviders) { // check emptiness
      const providerBlacklist = [175, 1796, 596];
      ukStreamingProviders = ukStreamingProviders.filter(provider => !providerBlacklist.includes(provider.provider_id)); // filter out unwanted providers
      if (ukStreamingProviders.length > 3) {
        ukStreamingProviders.length = 3; // truncate list of providers if too long
      }
    }
    return ukStreamingProviders;
  } catch (e) {
    console.log(e);
  }
}

// fetches list of genres from TMDB API for the given media type.
export async function fetchGenres(apiMediaRef) {
  try {
    const req = `https://api.themoviedb.org/3/genre/${apiMediaRef}/list?api_key=${tmdbApikey}&language=en-US`;
    const res = await fetch(req);
    const obj = await res.json();
    return obj.genres;
  } catch (e) {
    console.log("Error fetching genre list");
  }
}