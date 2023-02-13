import { writable } from "svelte/store";

export const langStore = writable({
  languageName: null,
  locale: null,
  flag: null
});