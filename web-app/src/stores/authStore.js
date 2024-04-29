import { writable } from "svelte/store";

export const authStore = writable({
  isLoggedIn: false,
  username: null,
  email: null
});
