import { authStore } from "../../stores/authStore";
import { push } from "svelte-spa-router";

export default function () {
  authStore.subscribe(async (info) => {
    if (!info.isLoggedIn) {
      push("/login");
    }
  });
}