<script>
  import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged} from "firebase/auth";
  import { authStore } from "../../stores/authStore";
  import { onDestroy } from "svelte";
  import { push } from "svelte-spa-router";

  let loginForm = {
    "email": "",
    "password": ""
  };

  const auth = getAuth();

  function handleLogin(){
    signInWithEmailAndPassword(auth, loginForm.email, loginForm.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user);
        console.log("Logged in!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      validateLogin();
    } catch(e) {
      console.log(e);
    }
  }

  function validateLogin() {
    if(auth.currentUser !== null) {
      authStore.set({
        isLoggedIn: true,
        username: auth.currentUser.displayName
      });
      return true;
    }
    return false;
  }

  function registerRedirect() {
    push("/register");
  }

  const sub = authStore.subscribe(async (info) => {
    if (info.isLoggedIn) {
      push("/");
    }
  });

  onDestroy(() => {
    sub();
  });

</script>


<div class="container">
  <div class="box px-6">
    <div class="field">
      <label class="label">Email</label>
      <div class="control">
        <input class="input is-rounded" type="email" placeholder="john@example.com" bind:value={loginForm.email} />
      </div>
    </div>

    <div class="field">
      <label class="label">Password</label>
      <div class="control">
        <input class="input is-rounded" type="password" placeholder="**********" bind:value={loginForm.password} />
      </div>
    </div>

    <button class="button is-warning is-rounded" on:click={handleLogin}>Log In</button>

    <div class="block mt-3">
      <a href="#">Forgotten Password?</a>
    </div>
    <hr>
    <div class="block">
      <button class="button is-rounded" on:click={loginWithGoogle}>
        <span>Log In with Google</span>
        <span class="icon is-small">
          <i class="fa-brands fa-google"></i>
        </span>
      </button>
    </div>
    
    <div class="block">
      <button class="button is-info is-rounded" on:click={registerRedirect}>Create a New Account</button>
    </div>
  </div>
</div>

<style></style>