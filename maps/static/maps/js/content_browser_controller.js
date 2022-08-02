class ContentBrowserController {
  constructor(world_uuid) {
    this.world_uuid = world_uuid;
    this.bread_crumbs = [];
    this.cb_path_map = {};
    this.asset_uuid_map = {};
    this.layer_assets = {};
    this.load_assets()
  }

  load_assets() {
    var self = this;
    fetch('/api/maps/' + this.world_uuid + '/assets/', {
      method: 'GET',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        'Content-Type': 'application/json'
      }
    })
    .then((res) => { return res.json() }).then((jsonResponse)=>{
      self.populate_browser(jsonResponse);
      // update the canvas
    })
    .catch(() => { })
  }

  populate_browser(api_response) {
    for(let i = 0; i < api_response.length; i++) {

      // populate asset map
      if(!(api_response[i].uuid in this.asset_uuid_map) ) {
        this.asset_uuid_map[api_response[i].uuid] = api_response[i];
      }

      let cb_name = api_response[i].cb_path;
      if(cb_name == '') {
        cb_name = 'root';
      }
      // populate path mapping
      if(!(cb_name in this.cb_path_map) ) {
        this.cb_path_map[cb_name] = [];
      }
      this.cb_path_map[cb_name].push(api_response[i]);
      if(api_response[i].layer_uuid != '') {
        // populate layer_assets
        if(!(api_response[i].layer_uuid in this.layer_assets) ) {
          this.layer_assets[api_response[i].layer_uuid] = [];
        }
        this.layer_assets[api_response[i].layer_uuid].push(api_response[i].uuid);
        let layer = window.world_controller.layer_controller.get_by_uuid(api_response[i].layer_uuid);
        layer.add_asset(api_response[i]);
      }
    }
    // loop over all the layers that had items added and update them layers
    // Object.keys(this.layer_assets).forEach(function(uuid) {
    //   console.log('updating layer')
    //   layerModels.map[uuid].canvas_obj.addWithUpdate();
    //   layerModels.map[uuid].canvas_obj.setCoords();
    // });
    // window.world_canvas.canvas.renderAll();
  }
}
