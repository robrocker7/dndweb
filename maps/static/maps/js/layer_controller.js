class LayerController {
  constructor() {
    this.items_per_layer = 100;
    this.layers = [];
    this.map = {};
    this.dragSrcIndex = null;
  }

  add_layer(layer) {  // expects a WorldLayer object
  
    this.map[layer.uuid] = layer;
    this.layers.splice(0, 0, layer);
    this.obj_count += 1;
    let ni = 1;
    for (var i = this.layers.length - 1; i >= 0; i--) {
      this.layers[i].order = ni;
      ni += 1;
    }

  }

  get_by_uuid(uuid) {
    return this.map[uuid];
  }

  get_next_zspace() {
    return this.layers.length * this.items_per_layer;
  }

  drag_start(event, model) {
    if(model.$index == model.$parent.layers.length-1) {
      event.preventDefault();
      return false;
    }
    model.$parent.is_dragging = true;
    this.style.opacity = '0.4';
    model.$parent.dragSrcIndex = model.$index;
  }

  drag_end(event, model) {
    this.style.opacity = '1';

    var children = document.getElementById('layer_list_group').children;
    for(var i=0; i<children.length; i++){
        var child = children[i];
        child.classList.remove('over');
    }
    this.is_dragging = false;
  }

  drag_enter(event, model) {
    event.preventDefault();
    this.classList.add('over');
  }

  drag_leave(event, model) {
    event.preventDefault();
    this.classList.remove('over');
  }

  drag_over(event, model) {
    event.preventDefault();
    this.classList.remove('over');
  }

  drag_drop(event, model) {
    // event.stopPropagation();
    let finalSrcIndex = model.$parent.dragSrcIndex;
    let finalDestIndex = model.$index;
    if (model.$parent.dragSrcIndex !== model.$index) {
        if(model.$index == 0) {
          finalSrcIndex = model.$parent.dragSrcIndex;
          finalDestIndex = 0;
        }
      let _dragged_item = model.$parent.layers.splice(finalSrcIndex, 1);
      model.$parent.layers.splice(finalDestIndex, 0, _dragged_item[0]);
      
    }

    // update order
    for(var i = 0; i < model.$parent.layers.length; i++) {
      model.$parent.layers[i].order = i;
    }
    model.$parent.is_dragging = false;

    return false;
  }

  edit_name(event, model) {
    model.item.set_name(this.textContent);
  }

  get_length() {
    return Object.keys(this.map).length;
  }

  get_by_index(i) {
    return this.layers[i];
  }

  set_details(event, model) {
    if(model.item.active) {
      model.item.active = false;
      window.world_controller.detail_controller.clear();
    }   else {
      for(var i = 0; i < model.$parent.layers.length; i++) {
        model.$parent.layers[i].active = false;
      }
      model.item.active = true;
      window.world_controller.detail_controller.set_active_object(model.item);
    }
  }

  has_active_layer() {
    var has_layers = false;
    for(var i = 0; i < this.layers.length; i++) {
      if(this.layers[i].active == true) {
        has_layers = true;
        break;
      }
    }
    return has_layers;
  }

  set_active_layer(layer) {
    for(var i = 0; i < this.layers.length; i++) {
      this.layers[i].active = false;
    }
    layer.active = true;
  }

}


// purely a way to group assets; the canvas will need to allow objects to be freely added agnostic of layer
class WorldLayer {
  constructor(name, order, zspace, uuid) {
    this.uuid = uuid;
    if(this.uuid == undefined) {
      this.uuid = uuidv4();
    }
    this.name = name;
    this.visibility = 0;
    this.order = order;
    this.zspace = zspace;

    this.obj_count = 0;  // used by the UI to show how many items are in the array
    this.objs = [];  // used to store which items are in the layer
    this.map = {};
    this.obj_mask_array = [];  // used for quick serialization
    this.is_tile_layer = false; // used for layer identification in layer submenu 
    this.detail_component = 'layer_details'; // used for the detail component
    this.active = false; // used for ui to display if the layer is active
    this.selected_obj = null;
  }

  add_asset(asset) { 
    // start downloading the file to add to the layer
    asset.start_download();
  }

  add_object(obj) {
    this.obj_count += 1;
    this.objs.splice(0, 0, obj);
    if(obj.uuid != undefined) {
      this.map[obj.uuid] = obj;
    }
    this.obj_mask_array.push(obj.mask);
  }

  remove_object(obj) {
    this.obj_count -= 1;
    this.objs.splice(this.objs.indexOf(obj), 1);
    delete this.map[obj.uuid];
    this.obj_mask_array.splice(this.objs.indexOf(obj), 1);
  }

  add_to_canvas(obj) {
    window.world_controller.canvas.add(obj.canvas_obj);
    if(obj.asset_meta) {
      obj.canvas_obj.set(obj.asset_meta);
    }
    obj.canvas_obj.setCoords();
    window.world_controller.canvas.moveTo(obj.canvas_obj,
      this.objs.indexOf(obj)+this.zspace);
    window.world_controller.canvas.renderAll();
  }

  remove_from_canvas(obj) {
    window.world_controller.canvas.remove(obj.canvas_obj);
    window.world_controller.canvas.discardActiveObject().renderAll();
  }

  set_name(name) {
    this.name = name;
  }

  set_active_object_event(event, model) {
    if(model.asset.active) {
      let asset_event = new CustomEvent('asset:deactivate', {
        'detail': {
          'asset_uuid': model.asset.uuid,
          'layer_uuid': model.asset.layer_uuid
        }
      });
      window.world_controller.canvas_elem.dispatchEvent(asset_event);

    } else {
      let asset_event = new CustomEvent('asset:active', {
        'detail': {
          'asset_uuid': model.asset.uuid,
          'layer_uuid': model.asset.layer_uuid
        }
      });
      window.world_controller.canvas_elem.dispatchEvent(asset_event);
    }
  }

  set_active_object(asset) {
    for(var i = 0; i < this.objs.length; i++) {
      this.objs[i].active = false;
    }
    asset.active = true;
  }

  change_group_opacity(event, model) {
    if(model.model.is_tile_layer) {
      model.model.group.set({'opacity': this.value});
      window.world_controller.canvas.renderAll();
    }
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