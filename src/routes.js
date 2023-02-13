import Home from "./components/home/Home.svelte";
import Login from "./components/auth/Login.svelte";
import Register from "./components/auth/Register.svelte";
import Logout from "./components/auth/Logout.svelte";
import LanguageSelect from "./components/account/LanguageSelect.svelte";
import BrowseFilms from "./components/explore/BrowseFilms.svelte";
import BrowseFilmCategory from "./components/explore/BrowseFilmCategory.svelte";
import Explore from "./components/explore/Explore.svelte";
import ExploreVideo from "./components/explore/ExploreVideo.svelte";
import ExploreVideoCategory from "./components/explore/ExploreVideoCategory.svelte";
import NotFound from "./components/NotFound.svelte";

export default {
  "/": Home,
  "/login": Login,
  "/register": Register,
  "/logout": Logout,
  "/preferences/language-select": LanguageSelect,
  "/explore": Explore,
  "/explore/video/:mediaType": ExploreVideo,
  "/explore/video/:mediaType/:category": ExploreVideoCategory,
  "*": NotFound // catch-all for undefined routes
}