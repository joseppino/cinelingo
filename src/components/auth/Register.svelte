<script>
  import StatusModal from "./StatusModal.svelte";

  import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  import { push } from "svelte-spa-router";

  const auth = getAuth();

  let regForm = {
    "username": "",
    "email": "",
    "password": "",
    "passwordConf": ""
  };

  function validateForm() {
    if (regForm.password !== regForm.passwordConf) { // check passwords match
      return {
        valid: false,
        message: "Passwords do not match."
      }
    }
    if (regForm.password.length < 6) { // check password is long enough
      return {
        valid: false,
        message: "Password must be at least 6 characters."
      }
    }
    if (regForm.username.length < 4) { // check username is long enough
      return {
        valid: false,
        message: "Username must be at least 4 characters."
      }
    }
    let regex = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i); // define email validity regex
    if (!regex.test(regForm.email)) { // if email does not meet regex critera
      return {
        valid: false,
        message: "Invalid email address."
      }
    }
    return {
      valid: true,
      message: ""
    }
  }

  let registrationStatus = "";
  let message = "";
  let showRegStatus = false;

  const returnToLogin = () => push("/login");

  function handleRegistration() {
    const validation = validateForm();
    if (validation.valid) {
      createUserWithEmailAndPassword(auth, regForm.email, regForm.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // add the user's chosen username
        updateProfile(user, {
          displayName: (regForm.username)
        });
        console.log(user.displayName);
        registrationStatus = "success";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        registrationStatus = "failure";
        message = errorMessage;
      });
    }
    else {
      console.log("Failed:", validation.message);
      registrationStatus = "failed";
      message = validation.message;
    }
    showRegStatus = true;
  }

</script>

<div class="container">
  <script src="https://kit.fontawesome.com/04e2300274.js" crossorigin="anonymous"></script>

  <div class="box">
    <div class="icon-text">
      <span class="icon has-text-info is-clickable" on:click={returnToLogin}>
        <i class="fas fa-arrow-left"></i>
      </span>
      <a href="/#/login">Return to Login</a>
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