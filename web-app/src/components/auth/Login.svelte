<script>
  import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
  import { collection, query, where, addDoc, getDocs } from "firebase/firestore";
  import { authStore } from "../../stores/authStore";
  import { onDestroy } from "svelte";
  import { push } from "svelte-spa-router";
  import { db } from "../../scripts/fb/firestore";
  import toast from "svelte-french-toast";

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
        validateLogin();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);
        emailInput.classList.add("is-danger");
        emailInput.classList.remove("is-success");
        passwordInput.classList.add("is-danger");
        passwordInput.classList.remove("is-success");
      });
    loginForm.password = "";
  }

  async function loginWithGoogle() {
    try {
      // using the Firebase Google Auth library
      const provider = new GoogleAuthProvider();
      // open the Google sign-in popup
      const result = await signInWithPopup(auth, provider);
      // check if user has signed in before
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", result.user.email));
      const querySnapshot = await getDocs(q);
      if(querySnapshot.empty) { // if the gmail address is not registered
        try {
          // add the new entry into Firestore DB
          const docRef = await addDoc(collection(db, "users"), {
            email: result.user.email,
            username: result.user.displayName,
            languagePreference: null,
            watchlist: null,
            liked: null,
            disliked: null,
            suggestedContent: null
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          // console.error("Error adding document: ", e);
          toast.error(
            "Google Sign-In Failed",
            {
              duration: 3000
            }
          );
        }
      }
      validateLogin();
    } catch(e) {
      console.log(e);
    }
  }

  function validateLogin() {
    if(auth.currentUser !== null) {
      authStore.set({
        isLoggedIn: true,
        username: auth.currentUser.displayName,
        email: auth.currentUser.email
      });
      return true;
    }
    return false;
  }

  const registerRedirect = () => push("/register");

  let emailInput;
  const checkEmail = () => {
    let regex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g); // define email validity regex
    if (regex.test(loginForm.email)) { // if email meets regex critera
      emailInput.classList.add("is-success");
      emailInput.classList.remove("is-danger");
    }
    else {
      emailInput.classList.add("is-danger");
      emailInput.classList.remove("is-success");
    }
  }

  let passwordInput;
  const checkPassword = () => {
    if (loginForm.password.length > 5) { // if email does not meet regex critera
      passwordInput.classList.add("is-success");
      passwordInput.classList.remove("is-danger");
    }
    else {
      passwordInput.classList.add("is-danger");
      passwordInput.classList.remove("is-success");
    }
  }

  let toasted = false;
  const sub = authStore.subscribe(async (info) => {
    if (info.isLoggedIn) {
      emailInput.readOnly = true;
      passwordInput.readOnly = true;
      if (!toasted){ // check if toast has already been invoked to prevent duplicate
        toast.success("Login Successful");
        toasted = true;
      }
      setTimeout(() => {
        push("/");
      }, 1000);
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
      <div class="control has-icons-left">
        <input class="input is-rounded" type="email" placeholder="john@example.com" bind:this={emailInput} on:change={checkEmail} bind:value={loginForm.email} />
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"></i>
        </span>
      </div>
    </div>

    <div class="field">
      <label class="label">Password</label>
      <div class="control has-icons-left">
        <input class="input is-rounded" type="password" placeholder="**********" bind:this={passwordInput} on:change={checkPassword} bind:value={loginForm.password} />
        <span class="icon is-small is-left">
          <i class="fas fa-lock"></i>
        </span>
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

<style>
</style>