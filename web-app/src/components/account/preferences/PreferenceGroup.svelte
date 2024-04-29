<script>
  export let groupId;
  export let groupName;
  export let contentList = [];
  export let allocatedPoints = [];

  let showOverlay = false;
  let numVotes = 0;
  $: if(numVotes > 0) {
    showOverlay = true;
  } else {
    showOverlay = false
  }

  function addVote() {
    if(allocatedPoints.length < 3) {
      numVotes += 1;
      allocatedPoints.push(groupId);
      allocatedPoints = allocatedPoints;
    }
  }

  function removeVote() {
    if(numVotes > 0) {
      numVotes -= 1;
      for(let point of allocatedPoints) {
        if(point === groupId) {
          allocatedPoints.splice(allocatedPoints.indexOf(point), 1);
          allocatedPoints = allocatedPoints;
          break;
        }
      }
    }
  }
</script>

<div class="pref-group">
  <label for="pref-group-box">{groupName}</label>
  <div id="pref-group-box" class="pref-group-box"
  on:click={addVote}
  on:keypress={addVote}
  >
    {#if showOverlay}
      <div class="remove-vote" role="button" tabindex="0"
      on:click|stopPropagation={removeVote}
      on:keypress|stopPropagation={removeVote}
      >
        <span class="icon">
          <i class="fa-solid fa-xmark"></i>
        </span>
      </div>
      <div class="overlay">
        <div class="box">
          <p class="vote-count is-size-4">{numVotes}</p>
        </div>
      </div>
    {/if}
    {#each contentList as content}
      <img src={`https://image.tmdb.org/t/p/w300/${content.poster_path}`} alt={`Poster for: ${content.title}`}>
    {/each}
  </div>
</div>

<style>
  .pref-group {
    margin: 10px 10px;
    /* max-width: 100vw; */
  }

  .pref-group-box {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    border: 1px solid #dbdbdb;
    padding: 5px;
    border-radius: 5px;
    max-width: 400px;
  }

  .pref-group-box img {
    height: 150px;
    width: auto;
    object-fit: contain;
  }

  .pref-group-box:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,0.6),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }

  .overlay {
    margin-top: 50px;
    z-index: 400;
    position: absolute;
    text-align: center;
  }

  .box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
  }

  .vote-count {
    font-variant-numeric: tabular-nums;
  }

  .remove-vote {
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* float: left; */
    border-radius: 5px;
    background-color: rgba(233, 89, 89, 0.95);
  }

  .remove-vote:hover {
    background-color: rgb(233, 89, 89);
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,0.6),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }

  .remove-vote i {
    color: black;
  }
</style>