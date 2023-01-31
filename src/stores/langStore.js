import { writable } from "svelte/store";

export const langStore = writable({
  language: null,
  flag: null
});