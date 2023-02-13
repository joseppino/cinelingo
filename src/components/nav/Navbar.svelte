<script>
  import { authStore } from "../../stores/authStore";
  import { langStore } from "../../stores/langStore";
  import { logOut } from "../../scripts/auth/logOut";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { link } from "svelte-spa-router";

</script>

<nav class="navbar is-fixed-top" aria-label="main navigation">
  <script src="https://kit.fontawesome.com/04e2300274.js" crossorigin="anonymous"></script>
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/images/sponge.png" width="30px" height="30px" alt="Website Logo"/>
    </a>

    <a href="#" role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navbarMenu" class="navbar-menu">
    <div class="navbar-start">
      <a href="/" class="navbar-item">
        Home
      </a>
      <div class="navbar-item has-dropdown is-hoverable">
        <a href="/explore" use:link class="navbar-link has-icons-left">
          Explore
        </a>
      <div class="navbar-dropdown">
        <a href="/explore/video/films" use:link class="navbar-item">
          Films
        </a>
        <a href="/explore/video/tv" use:link class="navbar-item">
          Television
        </a>
        <a href="/explore/music" use:link class="navbar-item">
          Music
        </a>
      </div>
    </div>
    </div>
    <div class="navbar-end">
        {#if $langStore.languageName}
          <a href="/preferences/language-select" class="navbar-item" use:link>Language: {capitaliseFirstLetter($langStore.languageName)} {$langStore.flag}</a>
        {:else if $authStore.isLoggedIn}
        <a href="/preferences/language-select" class="navbar-item" use:link>Select a language</a>
        {/if}
        <div class="navbar-item has-dropdown is-hoverable">
          {#if $authStore.isLoggedIn}
            <a href="#" class="navbar-link has-icons-left">
              {$authStore.username}
            </a>
          {:else}
            <a href="#" class="navbar-link has-icons-left">
              Account
            </a>
          {/if}
        <div class="navbar-dropdown">
          <a href="#" class="navbar-item">
            Profile
          </a>
          <a href="#" class="navbar-item">
            Preferences
          </a>
          <hr class="navbar-divider">
          {#if $authStore.isLoggedIn}
            <a href="/logout" class="navbar-item" on:click={logOut} use:link>
              Log Out
            </a>
          {:else}
            <a href="/login" class="navbar-item" use:link>
              Log In
            </a>
          {/if}
        </div>
      </div>
    </div>
  </div>

</nav>

<style>
  .navbar {
    border-bottom: none;
    background-color: #5AA9E6;
    color: #000000;
    box-shadow: 0px 0px 6px 1px #000000;
  }

  a {
    font-weight: 550;
    color: #262626;
  }
</style>