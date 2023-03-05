import { readable } from "svelte/store";

// create read-only svelte store
export const streamingProviderStore = readable({
  269: {
    name: "Funimation Now",
    url: "https://www.funimation.com/"
  },
  8: {
    name: "Netflix",
    url: "https://www.netflix.com/"
  },
  283: {
    name: "Crunchyroll",
    url: "https://www.crunchyroll.com/"
  }
});