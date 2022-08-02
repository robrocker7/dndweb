class MapDetailsComponent {
    constructor(tile_scale, tile_size) {
        this.tile_scale = tile_scale;
        this.tile_size = tile_size;
    }
    on_change(event, model) {
      var size = model.tile_size;
      fetch('/api/maps/' + window.world_controller.world_uuid + '/', {
        method: 'PATCH',
        body: JSON.stringify({'tile_size': size, 'tile_scale': model.tile_scale}),
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
          'Content-Type': 'application/json'
        }
      })
      .then((res) => { return res.json() }).then((jsonResponse)=>{
        console.log(jsonResponse);
        // update the canvas
        window.world_controller.update_tile_size(size);
      })
      .catch(() => { /* Error. Inform the user */ })
    }
}