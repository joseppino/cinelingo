import Home from "./components/home/Home.svelte";
import Login from "./components/auth/Login.svelte";
import Register from "./components/auth/Register.svelte";
import Preferences from "./components/account/Preferences.svelte";
import LanguageSelect from "./components/account/LanguageSelect.svelte";
import Explore from "./components/explore/Explore.svelte";
import ExploreVideo from "./components/explore/ExploreVideo.svelte";
import ExploreVideoCategory from "./components/explore/ExploreVideoCategory.svelte";
import ExploreVideoGenres from "./components/explore/ExploreVideoGenres.svelte";
import NotFound from "./components/nav/NotFound.svelte";


export default {
  "/": Home,
  "/login": Login,
  "/register": Register,
  "/preferences": Preferences,
  "/preferences/:activeTab": Preferences,
  "/preferences/language-select": LanguageSelect,
  "/explore": Explore,
  "/explore/video/:mediaType": ExploreVideo,
  "/explore/video/genres/:mediaType": ExploreVideoGenres,
  "/explore/video/:mediaType/:category": ExploreVideoCategory,
  "*": NotFound // catch-all for undefined routes
}