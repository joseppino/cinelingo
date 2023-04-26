<script>
  export let trailerKey;
  export let showTrailer;
</script>

<div id="trailer-overlay" class="trailer-overlay" 
  on:click={() => showTrailer = false}
  on:keyup={() => showTrailer = false}>
  <div id="video-container" class="video-container">
    <iframe src={`https://www.youtube-nocookie.com/embed/${trailerKey}`} title="Trailer Video" frameborder="0" allowfullscreen></iframe>
    <div id="close-button" class="close-button" 
    on:click={() => showTrailer = false}
    on:keyup={() => showTrailer = false}>
      <span class="icon">
        <i class="fa-solid fa-xmark"></i>
      </span>
    </div>
  </div>
</div>

<style>
  .trailer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(10, 10, 10, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .video-container {
    max-width: 800px;
    max-height: 600px;
    width: 90%;
    height: 90%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-container iframe {
    width: 400px;
    height: 300px;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    color: #fff;
    font-size: 24px;
    z-index: 99999;
  }
</style>