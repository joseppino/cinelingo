<script>
  import Navbar from "./components/nav/Navbar.svelte";
  import Router from "svelte-spa-router";
  import Home from "./components/home/Home.svelte";
  import Login from "./components/auth/Login.svelte";
  import Register from "./components/auth/Register.svelte";
  import Logout from "./components/auth/Logout.svelte";
  import LanguageSelect from "./components/account/LanguageSelect.svelte";

  import { authStore } from "./stores/authStore";
  import firebaseConfig from "./credentials/firebaseConfig";
 
  import { initializeApp } from 'firebase/app';
  import { getAuth, onAuthStateChanged } from "firebase/auth";

  const app = initializeApp(firebaseConfig);

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authStore.set({
        isLoggedIn: true,
        username: user.displayName
      });
    } else {
      authStore.set({
        isLoggedIn: false,
        username: null
      });
    }
  });

</script>

<main class="has-navbar-fixed-top">
  <Navbar />
</main>

<!-- Define routes for application to give structure -->
<Router routes={{
  "/": Home,
  "/login": Login,
  "/register": Register,
  "/logout": Logout,
  "/preferences/language-select": LanguageSelect
}} />

<style></style>