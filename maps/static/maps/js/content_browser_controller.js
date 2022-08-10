class ContentBrowserController {
  constructor(world_uuid) {
    this.world_uuid = world_uuid;
    this.bread_crumbs = [];
    this.cb_path_map = {};
    this.asset_uuid_map = {};
    this.assets = [];
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
      let asset_added_event = new CustomEvent('asset:added', {
        'detail': api_response[i]
      });
      window.world_controller.canvas_elem.dispatchEvent(asset_added_event);
    }
    // loop over all the layers that had items added and update them layers
    // Object.keys(this.layer_assets).forEach(function(uuid) {
    //   console.log('updating layer')
    //   layerModels.map[uuid].canvas_obj.addWithUpdate();
    //   layerModels.map[uuid].canvas_obj.setCoords();
    // });

  }

  drag_start_event(event, model) {
    console.log(event);
    console.log(model);
    bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasBottom')).hide();
    window.world_controller.drag_and_drop_component.block_events = true;
    this.style.opacity = '0.4';
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', model.asset.uuid);
  }

  drag_over_event(event, model) {
    event.preventDefault();
  }
  drag_leave_event(event, model) {
    console.log('item dragging; close browser')
  }

  add_asset(asset) {
    if(!(asset.uuid in this.asset_uuid_map) ) {
        this.asset_uuid_map[asset.uuid] = asset;
        this.assets.push(asset);
      }

      let cb_name = asset.cb_path;
      if(cb_name == '') {
        cb_name = 'root';
      }
      // populate path mapping
      if(!(cb_name in this.cb_path_map) ) {
        this.cb_path_map[cb_name] = [];
      }
      this.cb_path_map[cb_name].push(asset);
      if(asset.layer_uuid != '') {
        // populate layer_assets
        if(!(asset.layer_uuid in this.layer_assets) ) {
          this.layer_assets[asset.layer_uuid] = [];
        }
        this.layer_assets[asset.layer_uuid].push(asset.uuid);
      }
  }

  set_active_asset(asset_uuid) {
    for(let i = 0; i < this.assets.length; i++) {
      if(this.assets[i].uuid == asset_uuid) {
        this.assets[i].active = true;
        this.assets[i].set_display_cb_options();
      } else if(this.assets[i].active){
        this.assets[i].active = false;
        this.assets[i].set_display_cb_options();
      }
    }
  }

  set_hover_asset(asset_uuid) {
    for(let i = 0; i < this.assets.length; i++) {
      if(this.assets[i].uuid == asset_uuid) {
        this.assets[i].hovering = true;
        this.assets[i].set_display_cb_options();
      } else if(this.assets[i].hovering){
        this.assets[i].hovering = false;
        this.assets[i].set_display_cb_options();
      }
    }
  }

  remove_asset(asset) {
    this.assets.splice(this.assets.indexOf(asset), 1);
    delete this.asset_uuid_map[asset.uuid];
    if(asset.layer_uuid) {
      this.layer_assets[asset.layer_uuid].splice(this.layer_assets[asset.layer_uuid].indexOf(asset.uuid), 1);
    }
  }

  asset_hover(event, model) {
    model.$parent.set_hover_asset(model.asset.uuid);
  }

  asset_mouseout(event, model) {
    model.asset.hovering = false;
    model.asset.set_display_cb_options();
  }

  asset_on_click_action(event, model) {
    let asset_active_event = new CustomEvent('asset:active', {
      'detail': {
        'asset_uuid': model.asset.uuid,
        'layer_uuid': model.asset.layer_uuid
      }
    });
    window.world_controller.canvas_elem.dispatchEvent(asset_active_event);
  }
}
