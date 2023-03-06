<script>
  import { onMount } from "svelte";


  export let genre;

  const tagColours = [
    "#ABDEE6",
    "#CBAACB",
    "#FFCCB6",
    "#C6DBDA",
    "#F6EAC2",
    "#FF968A",
    "#55CBCD",
    "#97C1A9",
    "#D4F0F0",
    "#FEE1E8"
  ]
  tagColours.sort();

  // give each genre tag a colour by hashing its id within the bounds of the colours array.
  function hashIdToTagIndex(id) {
    return id % (tagColours.length - 1);
  }

  let tag;

  onMount(() => {
    tag.style.backgroundColor = tagColours[hashIdToTagIndex(genre.id)];
  })
</script>

<div class="tag" bind:this={tag}>
  <span>{genre.name}</span>
</div>

<style>
  .tag {
    width: fit-content;
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.1),0 0 0 1px rgba(10,10,10,.02);
    margin-left: 3px;
    margin-bottom: 3px;
  }

  .tag:hover {
    box-shadow: 0 .5em .5em -.125em rgba(10,10,10,0.2),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }
</style>