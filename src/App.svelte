<script>
  import Navbar from "./components/nav/Navbar.svelte";
  import { authStore } from "./stores/authStore";
  import firebaseConfig from "./credentials/firebaseConfig";
  import { initializeApp } from 'firebase/app';
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { db, setDB } from "./scripts/fb/firestore";
  import { langStore } from "./stores/langStore";
  import getUserRef from "./scripts/auth/getUserRef";
  import { doc, getDoc } from "firebase/firestore";
  import Router from "svelte-spa-router";
  import routes from "./routes";

  const app = initializeApp(firebaseConfig); //initialise Firebase backend
  setDB(app);

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authStore.set({
        isLoggedIn: true,
        username: user.displayName,
        email: user.email
      });
    } else {
      authStore.set({
        isLoggedIn: false,
        username: null,
        email: null
      });
    }
  });

  async function updateLanguageStore() { // update language store with preference stored in db
    try {
      const userRef = await getUserRef($authStore.email);
      const userDocSnap = await getDoc(userRef);
      if (userDocSnap.exists()) {
        const languagePref = userDocSnap.data().languagePreference;
        const langDocRef = doc(db, "languages", languagePref);
        const langDocSnap = await getDoc(langDocRef);
        if(langDocSnap.exists()) {
          langStore.set({
            languageName: langDocSnap.id,
            locale: langDocSnap.data().reference,
            flag: langDocSnap.data().flag
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  authStore.subscribe(() => { // listen for auth state change
    if ($authStore.isLoggedIn) {
      updateLanguageStore();
    }
  });

</script>

<main class="has-navbar-fixed-top">
  <!-- Navbar gives navigation options -->
  <Navbar />
  <!-- Define routes for application to give structure -->
  <Router {routes} />
</main>



<style></style>