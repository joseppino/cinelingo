<script>
  import StatusModal from "./StatusModal.svelte";

  import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  import { collection, addDoc } from "firebase/firestore";
  import { link, push } from "svelte-spa-router";
  import { db } from "../../scripts/fb/firestore";
  import validateForm from "../../scripts/auth/validateRegForm";

  const auth = getAuth();

  let regForm = {
    "username": "",
    "email": "",
    "password": "",
    "passwordConf": ""
  };

  let registrationStatus = "";
  let message = "";
  let showRegStatus = false;

  async function handleRegistration() {
    const validation = validateForm(regForm);
    if (validation.valid) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, regForm.email, regForm.password)
        // Signed in
        const user = userCredential.user;
        // add the user's chosen username
        updateProfile(user, {
          displayName: (regForm.username)
        });
        console.log(user.displayName);
        registrationStatus = "success";
        try {
          const docRef = await addDoc(collection(db, "users"), {
            email: regForm.email,
            username: regForm.username,
            languagePreference: null
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.log("Error adding document: ", e);
        }
      } catch(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        registrationStatus = "failure";
        message = errorMessage;
      }
    }
    else {
      console.log("Failed:", validation.message);
      registrationStatus = "failed";
      message = validation.message;
    }
    showRegStatus = true;
    setTimeout(() => { // redirect to language select after 2 seconds
      push("/preferences/language-select");
    }, 2000);
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

  {#if showRegStatus}
    <StatusModal bind:registrationStatus={registrationStatus} bind:message={message} bind:showRegStatus={showRegStatus}/>
  {/if}
</div>

<style></style>