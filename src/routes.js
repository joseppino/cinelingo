// @ts-nocheck

import Home from "./components/home/Home.svelte";
import Login from "./components/auth/Login.svelte";
import Register from "./components/auth/Register.svelte";
import Watchlist from "./components/account/Watchlist.svelte";
import Preferences from "./components/account/preferences/Preferences.svelte";
import Explore from "./components/explore/Explore.svelte";
import ExploreVideo from "./components/explore/ExploreVideo.svelte";
import ExploreVideoCategory from "./components/explore/ExploreVideoCategory.svelte";
import NotFound from "./components/nav/NotFound.svelte";

export default {
  "/": Home,
  "/login": Login,
  "/register": Register,
  "/watchlist": Watchlist,
  "/preferences": Preferences,
  "/preferences/:activeTab": Preferences, // :activeTab parameter acts as a component prop
  "/explore": Explore,
  "/explore/video/:mediaType": ExploreVideo,
  "/explore/video/:mediaType/:category": ExploreVideoCategory,
  "*": NotFound // catch-all for undefined routes
}