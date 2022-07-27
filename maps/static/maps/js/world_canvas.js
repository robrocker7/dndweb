function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function select_contenteditable_text(node) {

    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

class RenderContext {
  // render context is meant to be a shared class used to render elements
  constructor(ctx) {
    this.ctx = ctx;
    this.tile_width = 16;
    this.tile_height = 16;
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
      originX: tile.x,
      originY: tile.y,
      fill: this.default_color,
      width: this.tile_width,
      height: this.tile_height,
      stroke: this.border_color,
      strokeWidth: this.border_width,
      selectable: true
    });
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
      if(window.world_canvas.toolbar.current_terrain_mask != null) {
        self.set_terrain_mask(window.world_canvas.toolbar.current_terrain_mask);
        console.log(self.layer_placement[0])
        console.log(self.layer_placement[1])
        self.layer_placement[0].obj_mask_array[self.layer_placement[1]] = window.world_canvas.toolbar.current_terrain_mask;
        window.world_canvas.canvas.renderAll();
      }
    });

    canvas_obj.on('mouseover', function() {
      if(window.world_canvas.toolbar.current_terrain_mask != null && window.world_canvas.toolbar.is_left_mouse_down) {
        self.set_terrain_mask(window.world_canvas.toolbar.current_terrain_mask);
        self.layer_placement[0].obj_mask_array[self.layer_placement[1]] = window.world_canvas.toolbar.current_terrain_mask;
        window.world_canvas.canvas.renderAll();
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
}

class WorldLayer {
  constructor(name, order) {
    this.uuid = uuidv4();
    this.name = name;
    this.visibility = 0;
    this.order = order;
    this.canvas_obj = new fabric.Group([], {
      selectable: false,
      subTargetCheck: true
    });
    this.obj_count = 0;  // used by the UI to show how many items are in the array
    this.obj_array = [];  // used to store which items are in the layer
    this.obj_mask_array = [];  // used for quick serialization
    this.is_tile_layer = false; // used for layer identification in layer submenu 
    this.detail_component = 'layer_details'; // used for the detail component
    this.active = false; // used for ui to display if the layer is active
  }

  add_object(obj) {
    this.obj_count += 1;
    this.obj_array.push(obj);
    this.obj_mask_array.push(obj.mask);
    this.canvas_obj.add(obj.canvas_obj);
  }

  add_object_and_update(obj) {
    this.obj_count += 1;
    this.canvas_obj.addWithUpdate(obj);
  }

  set_name(name) {
    this.name = name;
  }

  get_payload() {
    return {
      'uuid': this.uuid,
      'name': this.name,
      'order': this.order,
      'masks': this.obj_mask_array
    }
  }

}

class WorldCanvas {
  constructor(element_id, x_cols, y_rows, object_uuid, canvas_layers) {
    var canvas_width = document.getElementById("world-canvas").clientWidth;
    var canvas_height = document.getElementById("world-canvas").clientHeight;

    this.x_cols = x_cols;
    this.y_rows = y_rows;
    this.object_uuid = object_uuid;
    this.world_render_context = new RenderContext();
    this.toolbar = new Toolbar();
    this.tiles = [];
    this.canvas = new fabric.Canvas(element_id, {
      //isDrawingMode: true,
      selection: false,
      fireRightClick: true,
      fireMiddleClick: true, 
      stopContextMenu: true 
    });
    this.canvas.setHeight(canvas_height);
    this.canvas.setWidth(canvas_width);
    this.canvas.selectionFullyContained = true;

    // by default create a layer for the tiles

    this.canvas_layers = canvas_layers;
    this.tile_layer = new WorldLayer('Tiles', 1);
    this.tile_layer.is_tile_layer = true;
    this.canvas_layers.push(this.tile_layer);
    this.canvas.add(this.tile_layer.canvas_obj);

    this.populate_tiles(this.tile_layer);
    this.setup_events();
  }

  reset_canvas(){
    this.canvas.clear();
  }

  center_group(canvas_layer) {
    this.canvas.centerObject(canvas_layer);
  }

  fill_terrain_mask(cached_mask) {
    for(let i = 0; i < this.tile_layer.obj_array.length; i++) {
      this.tile_layer.obj_array[i].set_terrain_mask(cached_mask[i]);
      this.tile_layer.obj_mask_array[i] = cached_mask[i];
    }
    this.canvas.renderAll();
  }

  populate_tiles(canvas_layer) {
    var self = this;
    var _canvas_objs = []
    for (let x = 0; x < this.x_cols; x++) {
      for (let y = 0; y < this.y_rows; y++) {
      
        var tile = new WorldTile(x, y);
        let canvas_obj = this.world_render_context.build_rectangle(tile);
        tile.set_layer(canvas_layer, canvas_layer.obj_count);
        tile.set_canvas_obj(canvas_obj);
        //_canvas_objs.push(canvas_obj)
        canvas_layer.add_object(tile);
      }
    }
    canvas_layer.canvas_obj.addWithUpdate(); // After adding all the items to the group
                                             // this is ran to force an update
    this.center_group(canvas_layer.canvas_obj);
    this.canvas.renderAll();
    
  }

  generate_terrain_mask_array() {
    var terrain_mask_array = [];
    for(let i = 0; i < this.tile_layer.obj_array.length; i++) {
      terrain_mask_array.push(this.tile_layer.obj_array[i].mask);
    }
    return terrain_mask_array;
  }

  generate_world_layer_payload() {
    var layers = [];
    for(let x = 0; x < this.canvas_layers.get_length(); x++) {
      var layer = this.canvas_layers.get_by_index(x);
      console.log(layer);
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
    for(let i = 0; i < this.tile_layer.obj_array.length; i++) {
      terrain_mask_array.push(0);
    }
    return terrain_mask_array;
  }

  populate_layers_from_json(json_array) {
    // i starts at 1 because index 0 is tile layer
    for(let i = 1; i < json_array.length; i++) {
      let layer_attrs = json_array[i];
      var layer = new WorldLayer(layer_attrs.name, layer_attrs.order);
      layer.uuid = layer_attrs['uuid'];
      layer.masks = layer_attrs.masks;
      this.canvas_layers.push(layer);
    }
  }

  setup_events() {
    var self = this;
    this.check_for_tiles = false;
    this.is_left_mouse_down = false;

    this.canvas.on('mouse:down', function(e) {
      console.log(e)
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
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    this.canvas.on('mouse:move', function (e) {
        if (self.toolbar.is_middle_mouse_down && e && e.e) {
            var units = 10;
            var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            self.canvas.relativePan(delta);
        }
    });


    document.getElementById('saveMapButton').addEventListener('click', (e) => {
      e.preventDefault();
      var payload = {
        'world_layers': self.generate_world_layer_payload().reverse()
      }
      console.log(payload)
      fetch("/api/maps/"+self.object_uuid+"/",
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
      fetch("/api/maps/"+self.object_uuid+"/",
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
      var new_layer = new WorldLayer('New Layer', self.canvas_layers.get_length()+1);
      self.canvas_layers.push(new_layer);

    });
  }
  
}
