<script>
  import { authStore } from "../../stores/authStore";
  import { langStore } from "../../stores/langStore";
  import { logOut } from "../../scripts/auth/logOut";
  import capitaliseFirstLetter from "../../scripts/capitaliseFirstLetter";
  import { link, push } from "svelte-spa-router";
  import { clickOutside } from "../../scripts/clickOutside";

  let navBurger;

</script>

<nav class="navbar is-fixed-top" aria-label="main navigation">
  <script src="https://kit.fontawesome.com/04e2300274.js" crossorigin="anonymous"></script>
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/images/movie-camera.png" width="30px" height="30px" alt="Website Logo"/>
    </a>

    <!-- svelte-ignore a11y-missing-attribute -->
    <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" 
    data-target="navbarMenu"
    use:clickOutside
    bind:this={navBurger} 
    on:click={() => {
        const target = navBurger.dataset.target;
        const $target = document.getElementById(target);
        navBurger.classList.toggle("is-active");
        $target.classList.toggle('is-active');
      }
    }
    on:keyup={() => navBurger.classList.toggle("is-active")}
    on:click_outside={() => {
        const target = navBurger.dataset.target;
        const $target = document.getElementById(target);
        navBurger.classList.remove("is-active");
        $target.classList.remove('is-active');
      }
    }>
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
          <a href="#" class="navbar-item">
            Profile
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
    /* background-color: #5AA9E6; */
    background-color: #a39dc1;
    color: #000000;
    box-shadow: 0px 0px 6px 1px #000000;
  }

  a {
    font-weight: 550;
    color: #262626;
  }
</style>