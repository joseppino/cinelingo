<script>
  import { authStore } from "../../stores/authStore";
  import { onDestroy } from "svelte";

  let username = "";

  const sub = authStore.subscribe(async (info) => {
    if (info.isLoggedIn) {
      username = info.username;
    }
  });

  onDestroy(() => {
    sub();
  });
</script>

<p>Welcome to Spongebath...</p>
<p>My not terrible FYP</p>