import { signOut, getAuth } from "firebase/auth";
import { push } from "svelte-spa-router";
import { langStore } from "../../stores/langStore";

export const logOut = async () => {
  const auth = getAuth();
  await signOut(auth);
  langStore.set({
    languageName: null,
    locale: null,
    flag: null
  });
  push("/logout");
}