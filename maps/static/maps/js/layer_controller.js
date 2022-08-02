class LayerController {
  constructor() {
    this.items_per_layer = 100;
    this.layers = [];
    this.map = {};
    this.dragSrcIndex = null;
  }

  add_layer(layer) {  // expects a WorldLayer object
  
    this.map[layer.uuid] = this.layers.length;
    this.layers.splice(0, 0, layer);
    this.obj_count += 1;
    let ni = 1;
    for (var i = this.layers.length - 1; i >= 0; i--) {
      this.layers[i].order = ni;
      ni += 1;
    }

  }

  get_by_uuid(uuid) {
    return this.layers[this.map[uuid]];
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
}


// purely a way to group assets; the canvas will need to allow objects to be freely added agnostic of layer
class WorldLayer {
  constructor(name, order, zspace) {
    this.uuid = uuidv4();
    this.name = name;
    this.visibility = 0;
    this.order = order;
    this.zspace = zspace;

    this.obj_count = 0;  // used by the UI to show how many items are in the array
    this.obj_array = [];  // used to store which items are in the layer
    this.obj_mask_array = [];  // used for quick serialization
    this.is_tile_layer = false; // used for layer identification in layer submenu 
    this.detail_component = 'layer_details'; // used for the detail component
    this.active = false; // used for ui to display if the layer is active

  }

  object_change(asset) {
    console.log(asset);
  }

  add_asset(asset) { 
    // the asset object is a dict; we need to understand what file type and
    // create a new javascript object for each file type
    if(asset.asset_type == 'image/jpeg') {
      var asset = new ImageAsset(asset.uuid, asset.asset_file, this.uuid);
      asset.start_download();
    }
  }

  add_object(obj) {
    this.obj_count += 1;
    this.obj_array.push(obj);
    this.obj_mask_array.push(obj.mask);
  }

  add_to_canvas(obj) {
    window.world_controller.canvas.add(obj.canvas_obj);
    
    window.world_controller.canvas.renderAll();
    window.world_controller.canvas.moveTo(obj.canvas_obj,
      this.obj_array.indexOf(obj)+this.zspace);
  }

  set_obj_zindex(obj) {
    // window.world_controller.canvas.moveTo(obj,
    //   this.obj_array.indexOf(obj)+this.zspace);
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