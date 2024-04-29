<script>
  import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  import { collection, addDoc } from "firebase/firestore";
  import { link, push } from "svelte-spa-router";
  import { db } from "../../scripts/fb/firestore";
  import validateForm from "../../scripts/auth/validateRegForm";
  import toast from "svelte-french-toast";

  const auth = getAuth();

  let regForm = {
    "username": "",
    "email": "",
    "password": "",
    "passwordConf": ""
  };

  let message = "";

  async function handleRegistration() {
    // validate the form before submission
    const validation = validateForm(regForm);
    if (validation.valid) {
      try {
        // Create Firebase Auth user record
        const userCredential = await createUserWithEmailAndPassword(auth, regForm.email, regForm.password)
        const user = userCredential.user;
        // add the user's chosen username
        await updateProfile(user, {
          displayName: (regForm.username)
        });
        // communicate success to user
        toast.success("Registration Successful");
        try {
          const docRef = await addDoc(collection(db, "users"), {
            email: regForm.email,
            username: regForm.username,
            languagePreference: null,
            watchlist: null,
            liked: null,
            disliked: null,
            suggestedContent: null
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      } catch(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
        message = errorMessage;
        toast.error(
          `Registration Failed \n\n ${translateFirebaseErrorCode(errorCode)}.`,
          {
            duration: 3000
          }
        );
      }
    }
    else {
      console.log("Failed:", validation.message);
      message = validation.message;
      toast.error(
        `Registration Failed \n\n ${message}.`,
        {
          duration: 3000
        }
      );
    }
    setTimeout(() => { // redirect to language select after 2 seconds
      push("/preferences/language-select");
    }, 2000);
  }

  // translates a firebase error code to a user-legible error message
  function translateFirebaseErrorCode(errorCode) {
    if(errorCode === "auth/email-already-in-use") {
      return "Email already in use";
    }
  }

</script>

<div class="container">
  <script src="https://kit.fontawesome.com/04e2300274.js" crossorigin="anonymous"></script>

  <div class="box">
    <div class="icon-text">
      <span class="icon has-text-info is-clickable" on:click={() => push("/login")} on:keypress={() => push("/login")}>
        <i class="fas fa-arrow-left"></i>
      </span>
      <a href="/login" use:link>Return to Login</a>
    </div>
  </div>

  <div class="box px-6">
    <div class="field">
      <label class="label">Username</label>
      <div class="control has-icons-left">
        <input id="username_input" class="input is-rounded" type="text" placeholder="Be Creative" minlength="7" maxlength="21" bind:value={regForm.username} required/>
        <span class="icon is-small is-left">
          <i class="fas fa-user"></i>
        </span>
      </div>
    </div>
    
    <div class="field">
      <label class="label">Email</label>
      <div class="control has-icons-left">
        <input id="email_input" class="input is-rounded" type="email" placeholder="john@example.com" bind:value={regForm.email} required/>
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"></i>
        </span>
      </div>
    </div>

    <div class="field">
      <label class="label">Password</label>
      <div class="control has-icons-left">
        <input id="password_input" class="input is-rounded" type="password" placeholder="**********" bind:value={regForm.password} required/>
        <span class="icon is-small is-left">
          <i class="fas fa-lock"></i>
        </span>
      </div>
    </div>

    <div class="field">
      <label class="label">Confirm Password</label>
      <div class="control has-icons-left">
        <input id="conf_password_input" class="input is-rounded" type="password" placeholder="**********" bind:value={regForm.passwordConf} required/>
        <span class="icon is-small is-left">
          <i class="fas fa-lock"></i>
        </span>
      </div>
    </div>

    <button class="button is-info is-rounded" on:click={handleRegistration}>Register</button>
    
  </div>
</div>

<style>
  .message {
    background-color: #FFFFFF;
  }
</style>