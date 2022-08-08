class RenderContext {
  // render context is meant to be a shared class used to render elements
  constructor(tile_width) {
    this.tile_width = tile_width;
    this.tile_height = tile_width;
    this.border_width = 2;
    this.border_color = "#000";
    this.default_color = "#FFF";
  }

  get_x_coord(x) {
    return x*this.tile_width
  }

  get_y_coord(y) {
    return y*this.tile_height
  }

  build_rectangle(tile) {
    return new fabric.Rect({
      originX: 'left',
      originY: 'bottom',
      fill: this.default_color,
      left: this.get_x_coord(tile.x),
      top: this.get_y_coord(tile.y),
      width: this.tile_width,
      height: this.tile_height,
      stroke: this.border_color,
      strokeWidth: this.border_width,
      selectable: true
    });
  }
}

class WorldTile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.mask = 0;
    this.canvas_obj = null;
  }

  set_layer(layer, index_in_layer) {
    this.layer_placement = [layer, index_in_layer];
  }

  set_canvas_obj(canvas_obj) {
    var self = this;
    this.canvas_obj = canvas_obj;
    canvas_obj.on('mousedown', function() {
      if(window.world_controller.toolbar.current_terrain_mask != null) {
        self.set_terrain_mask(window.world_controller.toolbar.current_terrain_mask);
        self.layer_placement[0].obj_mask_array[(self.layer_placement[0].obj_mask_array.length-1) - self.layer_placement[1]] = window.world_controller.toolbar.current_terrain_mask;
        window.world_controller.canvas.renderAll();
      }
    });

    canvas_obj.on('mouseover', function() {
      if(window.world_controller.toolbar.current_terrain_mask != null && window.world_controller.toolbar.is_left_mouse_down) {
        self.set_terrain_mask(window.world_controller.toolbar.current_terrain_mask);
        self.layer_placement[0].obj_mask_array[(self.layer_placement[0].obj_mask_array.length-1) - self.layer_placement[1]] = window.world_controller.toolbar.current_terrain_mask;
        window.world_controller.canvas.renderAll();
      }
    });
  }

  update_canvas_obj(updates) {
    this.canvas_obj.set(updates);
  }

  get_terrain_mask_color(mask) {
    if(mask == 1) {
      return 'white';
    } else if (mask == 2) {
      return 'green';
    } else if (mask == 3) {
      return 'blue';
    }  else {
      // will also catch mask == 0
      return 'black';
    }
  }

  set_terrain_mask(mask) {
    this.mask = mask;
    this.update_canvas_obj({'fill': this.get_terrain_mask_color(mask)});
  }

  set_tile_size(size) {
    this.size = size;
    const scale = this.canvas_obj.getObjectScaling();
    this.canvas_obj.set('width', parseInt(size) / scale.scaleX).set('height', parseInt(size) / scale.scaleY);
    // this.update_canvas_obj({'width': size, 'height': size});
    this.canvas_obj.setCoords();

  }
}

class Toolbar {
  constructor() {
    this.current_terrain_mask = null;
    this.current_zoom_level = null;
    this.is_left_mouse_down = false;
    this.is_middle_mouse_down = false;
    this.setup_events();
  }

  reset_group_state(element) {
    for (let i = 0; i < element.parentElement.children.length; i++) {
      element.parentElement.children[i].classList.remove("active");
    }
  }

  set_layer_mask(layer, mask) {
    if(layer == 'terrain') {
      this.current_terrain_mask = mask;
    } else if(layer == 'zoom') {
      this.current_zoom_level = mask;
    }
  }

  setup_events() {
    const tooltip_buttons = document.querySelectorAll('.tooltipBtn');

    tooltip_buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();  
        e.preventDefault();
        var el = event.currentTarget ;
        if(el.classList.contains("active")) {
          el.classList.remove("active");
          this.set_layer_mask(el.dataset.layer, null);
        } else {
          this.reset_group_state(el);
          el.classList.add("active");
          this.set_layer_mask(el.dataset.layer, parseInt(el.dataset.mask));
        }
        
      });
    });
  }
}

class WorldController {
  constructor(canvas_id, world_uuid, x, y, tile_size, layer_controller, detail_controller, content_browser_controller, map_details_component, drag_and_drop_component) {;
    this.canvas_id = canvas_id;
    this.layer_controller = layer_controller;
    this.layer_binding = tinybind.bind(document.getElementById("layer_sidebar"), layer_controller);

    this.detail_controller = detail_controller;
    this.detail_binding = tinybind.bind(document.getElementById("detail_sidebar"), detail_controller);

    this.content_browser_controller = content_browser_controller;
    this.content_browser_binding = tinybind.bind(document.getElementById("cb_main_container"), content_browser_controller);

    this.map_details_component = map_details_component;
    this.map_details_binding = tinybind.bind(document.getElementById("map_details"), map_details_component);

    this.drag_and_drop_component = drag_and_drop_component;
    this.drag_and_drop_binding = tinybind.bind(document.getElementById('drop_file_container'), drag_and_drop_component);

    this.canvas_elem = document.getElementById(this.canvas_id);
    var canvas_width = this.canvas_elem.clientWidth;
    var canvas_height = this.canvas_elem.clientHeight;

    this.world_uuid = world_uuid;
    this.world_render_context = new RenderContext(tile_size);
    this.x = x;
    this.y = y;
    this.toolbar = new Toolbar();
    this.canvas = new fabric.Canvas(this.canvas_id, {
      //isDrawingMode: true,
      selection: false,
      fireRightClick: true,
      fireMiddleClick: true, 
      stopContextMenu: true 
    });
    this.canvas.setHeight(canvas_height);
    this.canvas.setWidth(canvas_width);
    this.canvas.selectionFullyContained = true;

    this.tile_group = null;
    this.tile_layer = new WorldLayer('Tiles', 1, this.layer_controller.get_next_zspace());
    this.tile_layer.is_tile_layer = true;

    this.populate_tiles(this.tile_layer);
    // tell the layer controller we created a layer
    this.layer_controller.add_layer(this.tile_layer);
    this.savedCanvasPos = localStorage.getItem('_canvasPos');
    if(this.savedCanvasPos == null) {
      this.savedCanvasPos = localStorage.setItem('_canvasPos', JSON.stringify({'t': [], 'z': 0}));
    } else {
      this.savedCanvasPos = JSON.parse(this.savedCanvasPos);
      this.canvas.setZoom(this.savedCanvasPos.z);
      this.canvas.viewportTransform = this.savedCanvasPos.t;
      // "touch" the canvas to force a refresh that corrects display selection events 
      let p = new fabric.Point(0, 0);
      this.canvas.relativePan(p);
    }
    this.setup_events();
  }

  update_canvas_pos_cache() {
    console.log(window.world_controller.canvas);
    localStorage.setItem('_canvasPos',
      JSON.stringify({'t': window.world_controller.canvas.viewportTransform, 'z': window.world_controller.canvas.getZoom()}));
  }

  center_group(canvas_layer) {
    this.canvas.centerObject(canvas_layer);
  }

  fill_terrain_mask(cached_mask) {
    for(let i = 0; i < this.tile_layer.objs.length; i++) {
      this.tile_layer.objs[i].set_terrain_mask(cached_mask[i]);
      this.tile_layer.obj_mask_array[i] = cached_mask[i];
    }
    this.canvas.renderAll();
  }

  update_tile_size(size) {
    this.world_render_context.tile_width = size;
    this.world_render_context.tile_height = size;

    for(let i = 0; i < this.tile_layer.objs.length; i++) {
      this.tile_layer.objs[i].set_tile_size(size);
    }
    this.tile_group.addWithUpdate();
    this.tile_group.setCoords();
    this.center_group(this.tile_group);
    this.canvas.renderAll();
    

  }

  update_asset_meta(uuid, layer_uuid, layer_name, asset_json) {
    var self = this;
    var payload = {
      'layer_uuid': layer_uuid,
      'name': layer_name,
      'asset_meta': asset_json
    }
    fetch("/api/maps/"+self.world_uuid+"/asset/"+uuid+"/",
      {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
          }
      }
    ).then(function(res){ return res.json(); })
     .then(function(jsonResponse){console.log(jsonResponse);});
  }

  delete_asset(uuid) {
    var self = this;
    fetch("/api/maps/"+self.world_uuid+"/asset/"+uuid+"/",
      {
          method: "DELETE",
          headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
          }
      }
    ).then(function(res){ return res.json(); })
     .then(function(jsonResponse){console.log(jsonResponse);});
  }

  populate_tiles(canvas_layer) {
    var self = this;
    for (let y = 0; y < this.y; y++) {
      for (let x = 0; x < this.x; x++) {

        var tile = new WorldTile(x, y);
        let canvas_obj = this.world_render_context.build_rectangle(tile);
        tile.set_layer(canvas_layer, canvas_layer.objs.length);
        tile.set_canvas_obj(canvas_obj);
        canvas_layer.add_object(tile);
      }
    }
    // the tile layer will get a group
    let _canvas_objs = []
    for(let i = 0; i < canvas_layer.objs.length; i++) {
      _canvas_objs.push(canvas_layer.objs[i].canvas_obj);
    }
    this.tile_group = new fabric.Group(_canvas_objs, {
      selectable: false,
      subTargetCheck: true,
      dirty: true
    })
    this.tile_group.addWithUpdate();
    this.tile_layer.group = this.tile_group;
    this.canvas.add(this.tile_group);
    this.center_group(this.tile_group);
    
    this.canvas.renderAll();
    
  }

  generate_terrain_mask_array() {
    var terrain_mask_array = [];
    for(let i = 0; i < this.tile_layer.objs.length; i++) {
      terrain_mask_array.push(this.tile_layer.objs[i].mask);
    }
    return terrain_mask_array;
  }

  generate_world_layer_payload() {
    var layers = [];
    for(let x = 0; x < this.layer_controller.layers.length; x++) {
      var layer = this.layer_controller.layers[x];
      let payload = layer.get_payload();
      layers.push(payload);
    }
    return layers;
  }

  generate_empty_world_layer_payload() {
    var layers = [];
    for(let x = 0; x < this.canvas_layers.get_length(); x++) {
      var layer = this.canvas_layers.get_by_index(x);
      let payload = layer.get_payload();
      
      if(layer.is_tile_layer) {
        payload['masks'] = this.generate_empty_terrain_mask_array();
      }
      layers.push(payload);
    }
    return layers;
  }

  generate_empty_terrain_mask_array() {
    var terrain_mask_array = [];
    for(let i = 0; i < this.tile_layer.objs.length; i++) {
      terrain_mask_array.push(0);
    }
    return terrain_mask_array;
  }

  populate_layers_from_json(json_array) {
    // i starts at 1 because index 0 is tile layer
    for(let i = 1; i < json_array.length; i++) {
      let layer_attrs = json_array[i];

      let zspace_assignment = this.layer_controller.get_next_zspace()

      var layer = new WorldLayer(layer_attrs.name, layer_attrs.order, zspace_assignment, layer_attrs['uuid']);
      layer.masks = layer_attrs.masks;
      this.layer_controller.add_layer(layer);
    }
    this.canvas.renderAll();
  }

  setup_events() {
    var self = this;
    this.check_for_tiles = false;
    this.is_left_mouse_down = false;

    this.canvas_elem.addEventListener('asset:active', function (e) {
      console.log(e)
      if(e.detail.layer_uuid != undefined) {
        let layer = window.world_controller.layer_controller.get_by_uuid(e.detail.layer_uuid);
        let asset = layer.map[e.detail.asset_uuid];
        // set world sidebar active state
        window.world_controller.layer_controller.set_active_layer(layer);

        // if the layer is not selected; then select it
        if(window.world_controller.detail_controller.model != layer) {
          window.world_controller.detail_controller.set_active_object(layer);
        }

        // only do this if the layer is selected
        if(window.world_controller.detail_controller.is_detail_component) {
          // set detail sidebar active
          layer.set_active_object(asset);
          let instance = bootstrap.Collapse.getOrCreateInstance(
            document.getElementById('bu'+e.detail.asset_uuid).parentElement.parentElement.children[1]);
          if(instance) {
            instance.show();
          }
        }

        // set the content browser active flag
        window.world_controller.content_browser_controller.set_active_asset(asset.uuid);

        // set the active object on the canvas and render it
        let a_object = self.canvas.getActiveObject();
        self.canvas.setActiveObject(asset.canvas_obj);
        self.canvas.renderAll();
        
        
      }
    }, false);

    this.canvas_elem.addEventListener('asset:deactivate', function (e) {
      console.log(e)
      if(e.detail.layer_uuid != undefined) {
        let layer = window.world_controller.layer_controller.get_by_uuid(e.detail.layer_uuid);
        layer.map[e.detail.asset_uuid].active = false;
        self.canvas.discardActiveObject().renderAll();
        let instance = bootstrap.Collapse.getOrCreateInstance(
          document.getElementById('bu'+e.detail.asset_uuid).parentElement.parentElement.children[1]);
        if(instance) {
          instance.hide();
        }
      }
    }, false);

    this.canvas.on('mouse:down', function(e) {
      if (e.button === 2) {
        self.toolbar.is_middle_mouse_down = true;
      } else {
        self.toolbar.is_left_mouse_down = true;
      }
      
    });

    this.canvas.on('mouse:up', function(e) {
      if (e.button === 2) {
        self.toolbar.is_middle_mouse_down = false;
      } else {
        self.toolbar.is_left_mouse_down = false;
      }
    });

    this.canvas.on('mouse:wheel', function(opt) {
      var delta = opt.e.deltaY;
      var zoom = self.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      self.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

      self.update_canvas_pos_cache();
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    this.canvas.on('mouse:move', function (e) {
        if (self.toolbar.is_middle_mouse_down && e && e.e) {
            var units = 10;
            var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            self.canvas.relativePan(delta);
            self.update_canvas_pos_cache();
        }
    });

    this.canvas.on('selection:cleared', function(e) {
      console.log('cleared')
      if(e.deselected != undefined) {
        let layer = window.world_controller.layer_controller.get_by_uuid(e.deselected[0].layer_uuid);
        if(layer.map[e.deselected[0].asset_uuid].active) {
          let asset_active_event = new CustomEvent('asset:deactivate', {
            'detail': {
              'asset_uuid': e.deselected[0].asset_uuid,
              'layer_uuid': e.deselected[0].layer_uuid
            }
          });
          self.canvas_elem.dispatchEvent(asset_active_event);
        }
      }
    });

    this.canvas.on('selection:created', function(e) {
      // if the active object id does not equal id 
      let layer = window.world_controller.layer_controller.get_by_uuid(e.selected[0].layer_uuid);
      if(!layer.map[e.selected[0].asset_uuid].active) {
        let asset_active_event = new CustomEvent('asset:active', {
          'detail': {
            'asset_uuid': e.selected[0].asset_uuid,
            'layer_uuid': e.selected[0].layer_uuid
          }
        });
        self.canvas_elem.dispatchEvent(asset_active_event);
      }
    });

    this.canvas.on('selection:updated', function(e) {
      let a_object = self.canvas.getActiveObject();
      if(a_object != undefined && e.selected[0].asset_uuid != a_object.asset_uuid) {
        let asset_active_event = new CustomEvent('asset:active', {
          'detail': {
            'asset_uuid': e.selected[0].asset_uuid,
            'layer_uuid': e.selected[0].layer_uuid
          }
        });
        self.canvas_elem.dispatchEvent(asset_active_event);
      }
    });

    this.canvas.on('')


    document.getElementById('saveMapButton').addEventListener('click', (e) => {
      e.preventDefault();
      var payload = {
        'world_layers': self.generate_world_layer_payload().reverse()
      }
      console.log(payload)
      fetch("/api/maps/"+self.world_uuid+"/",
        {
            method: "PATCH",
            body: JSON.stringify(payload),
            headers: {
              'X-CSRFToken': getCookie('csrftoken'),
              'Content-Type': 'application/json'
            }
        }
      ).then(function(res){ return res.json(); })
       .then(function(jsonResponse){console.log(jsonResponse);});
    });

    document.getElementById('resetMapButton').addEventListener('click', (e) => {
      e.preventDefault();
      var payload = {
        'world_layers': self.generate_empty_world_layer_payload().reverse()
      }
      fetch("/api/maps/"+self.world_uuid+"/",
        {
            method: "PATCH",
            body: JSON.stringify(payload),
            headers: {
              'X-CSRFToken': getCookie('csrftoken'),
              'Content-Type': 'application/json'
            }
        }
      ).then(function(res){ return res.json(); })
       .then(function(jsonResponse){console.log(jsonResponse);});
    });

    document.getElementById('debug').addEventListener('click', (e) => {
      e.preventDefault();
      // place for me to trigger manual debugs
      console.log(self.generate_world_layer_payload());
    });

    document.getElementById('add_new_layer').addEventListener('click', (e) => {
      e.preventDefault();
      var new_layer = new WorldLayer('New Layer',
        self.layer_controller.get_length()+1,
        self.layer_controller.get_next_zspace());
      self.layer_controller.add_layer(new_layer);

    });
  }


}