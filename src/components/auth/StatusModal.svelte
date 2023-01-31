<script>
  export let registrationStatus; // true or false reg success value prop
  export let message; // details of failure/success
  export let showRegStatus;

  const togglePopup = () => {
    showRegStatus = !showRegStatus;
    console.log(showRegStatus);
  }

</script>


<div class="modal is-active">
  <div class="modal-background" on:click={togglePopup} />
  <div class="modal-content">
    <div class="box">
      {#if registrationStatus === "success"}
        <div class="icon-text">
          <span class="icon has-text-success">
            <i class="fas fa-check-square"></i>
          </span>
          <span>Registration Successful</span>
        </div>
      
        <p class="block">
          Registration Complete
        </p>
      {:else}
        <div class="icon-text">
          <span class="icon has-text-danger">
            <i class="fas fa-ban"></i>
          </span>
          <span>Registration Failed</span>
        </div>
        
        <p class="block">
          Could not complete registration. 
        </p>
        <code>{message}</code>
        <p class="block">
          Please try again.
        </p>

        <button class="button" on:click={togglePopup}>Close</button>
      {/if}
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close"></button>
</div>

<style></style>