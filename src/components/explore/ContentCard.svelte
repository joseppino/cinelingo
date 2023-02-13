<script>
  export let props;

  const content = props.content;
  const mediaType = props.mediaType;


  
</script>

<div class="card">
  <div class="card-image">
    <figure class="image">
      <img src={`https://image.tmdb.org/t/p/w400/${content.poster_path}`} alt="Poster">
    </figure>
  </div>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <p class="title is-4">{mediaType === "films" ? content.title : content.name}</p>
        <p class="subtitle is-6">{mediaType === "films" ? content.release_date.split("-")[0] : content.first_air_date.split("-")[0]}</p>
      </div>
    </div>

    <div class="content">
      {content.overview}
      <div class="genres block is-flex is-flex-direction-column mt-2">
        {#each content.genreNames as genreName}
          <a>{genreName}</a>
        {/each}
      </div>
      <a href="#">#css</a> <a href="#">#responsive</a>
      <br>
      <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
    </div>
  </div>
</div>

<style>
  .card {
    max-width: 400px;
  }

  .card:hover {
    box-shadow: 0 .5em 1em -.125em rgba(10,10,10,0.6),0 0 0 1px rgba(10,10,10,.02);
    cursor: pointer;
  }
</style>