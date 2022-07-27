var dragSrcIndex = null;
var layerModels = {
  items: [],
  map: {},
  drag_start(event, model) {
    if(model.$index == model.$parent.items.length-1) {
      event.preventDefault();
      return false;
    }
    this.style.opacity = '0.4';
    dragSrcIndex = model.$index;
  },
  set_details(event, model) {
    for(var i = 0; i < model.$parent.items.length; i++) {

      model.$parent.items[i].active = false;
    }
    model.item.active = true;
    componentDetailModels.set_active_object(model.item);
  },
  drag_end(event, model) {
    this.style.opacity = '1';

    var children = document.getElementById('layer_list_group').children;
    for(var i=0; i<children.length; i++){
        var child = children[i];
        child.classList.remove('over');
    }
  },
  drag_enter(event, model) {
    event.preventDefault();
    this.classList.add('over');
  },
  drag_leave(event, model) {
    event.preventDefault();
    this.classList.remove('over');
  },
  drag_over(event, model) {
    event.preventDefault();
    this.classList.remove('over');
  },
  drag_drop(event, model) {
    // event.stopPropagation();
    let finalSrcIndex = dragSrcIndex;
    let finalDestIndex = model.$index;
    if (dragSrcIndex !== model.$index) {
        if(model.$index == 0) {
          finalSrcIndex = dragSrcIndex;
          finalDestIndex = 0;
        }
      _dragged_item = model.$parent.items.splice(finalSrcIndex, 1);
      model.$parent.items.splice(finalDestIndex, 0, _dragged_item[0]);
      
    }

    // update order
    for(var i = 0; i < model.$parent.items.length; i++) {
      model.$parent.items[i].order = i;
    }

    return false;
  },
  edit_name(event, model) {
    model.item.set_name(this.textContent);
  },
  select_text(event, modal) {
    select_contenteditable_text(this);
  },
  push(layer) {
    //this.items[layer.uuid] = layer;
    this.items.splice(0, 0, layer);
    //this.items.push(layer);
    this.map[layer.uuid] = layer;
  },
  remove_layer(event, model) {
    model.$parent.items.splice(model.$index, 1);
    // update order
    for(var i = 0; i < model.$parent.items; i++) {
      model.$parent.items[i].order = i;
    }
  },
  reset() {
    this.items = {};
  },
  get_length() {
    return Object.keys(this.map).length;
  },
  get_by_index(i) {
    console.log(i);
    return this.items[i];
  },
  sort() {
    this.items.sort(function (a, b) {
      return (a.value || 0) - (b.value || 0)
    })
  }
}