<script>
  import { authStore } from "../../stores/authStore";
  import { langStore } from "../../stores/langStore";
  import { logOut } from "../../scripts/auth/logOut";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { link, push } from "svelte-spa-router";
  import { clickOutside } from "../../scripts/clickOutside";

  let navBurger;

  const toggleNavBurger = () => {
    const target = navBurger.dataset.target;
    const dataTarget = document.getElementById(target);
    navBurger.classList.toggle("is-active");
    dataTarget.classList.toggle('is-active');
  }

  const handleOutsideClick = () => {
    const target = navBurger.dataset.target;
    const dataTarget = document.getElementById(target);
    navBurger.classList.remove("is-active");
    dataTarget.classList.remove('is-active');
  }

</script>

<nav class="navbar is-fixed-top" aria-label="main navigation">
  <script src="https://kit.fontawesome.com/04e2300274.js" crossorigin="anonymous"></script>
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/images/movie-camera.png" width="30px" height="30px" alt="Website Logo"/>
    </a>

    <!-- svelte-ignore a11y-missing-attribute -->
    <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" 
      data-target="navbarMenu" tabindex="0"
      use:clickOutside
      bind:this={navBurger} 
      on:click={() => toggleNavBurger()}
      on:keypress={() => toggleNavBurger()}
      on:click_outside={() => handleOutsideClick()}
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navbarMenu" class="navbar-menu">
    <div class="navbar-start">
      <a href="/" class="navbar-item" use:link>
        Home
      </a>
      <div class="navbar-item has-dropdown is-hoverable">
        <a href="/explore" use:link class="navbar-link has-icons-left">
          Explore
        </a>
      <div class="navbar-dropdown">
        <a href="/explore/video/films" use:link class="navbar-item" on:click={() => push("/explore/video/films")}>
          Films
        </a>
        <a href="/explore/video/tv" use:link class="navbar-item">
          Television
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
          <!-- If logged in, display the username; else, display "Account" -->
          {#if $authStore.isLoggedIn && $authStore.username}
            <a href="#" class="navbar-link has-icons-left">
              {$authStore.username}
            </a>
          {:else}
            <a href="#" class="navbar-link has-icons-left">
              Account
            </a>
          {/if}
        <div class="navbar-dropdown is-right">
          <a href="/watchlist" class="navbar-item" use:link>
            Watchlist
          </a>
          <a href="/preferences" class="navbar-item" use:link>
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
    background-color: #a39dc1;
    color: #000000;
    box-shadow: 0px 0px 3px 1px #000000;
  }

  a {
    font-weight: 550;
    color: #262626;
  }
</style>