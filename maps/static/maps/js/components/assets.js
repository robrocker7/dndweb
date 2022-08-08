// tinybind.binders.asset_toggle = {
//   publishes: true,
//   bind: function(el) {
//     var self = this;
//     self.isActive = this.model.active;
//     this.callback = function() {
//       console.log(self.isActive);
//       console.log(this.model.active);
//       if(self.isActive != this.model.active) {
//         self.publish();
//       }
      
//     }

//     el.addEventListener('click', this.callback);
//   },

//   unbind: function(el) {
//     el.removeEventListener('click');
//   },

//   routine: function(el, value) {
//     this.model.active = !self.isActive;
//     // if the element is visible
//     console.log('active change');
//     if(el.parentElement.children[1] != undefined) {
//       new bootstrap.Collapse(el.parentElement.children[1], {
//       toggle: this.model.active
//     });
//     }
    
//   }
// }


class ImageAsset {
  constructor(layer_uuid, asset) {
    this.uuid = asset.uuid;
    this.name = asset.name;
    this.canvas_obj = null;
    this.layer_uuid = asset.layer_uuid;
    this.media_url = asset.asset_file;
    this.asset_meta = asset.asset_meta;
    this.mask = 0; // indicates imageasset    
    this.active = false; // used for ui in layer details

    this.asset_main_id = 'asset' + this.uuid;
    this.asset_accordian_body_id = 'ab' + this.uuid;
    this.asset_accordian_target_id = '#' + this.asset_accordian_body_id
    this.asset_button_id = 'bu' + this.uuid;
  }

  clean_json(json_dict) {
    var keys_to_set = [
      'angle',
      'backgroundColor',
      'cropX',
      'cropY',
      'fill',
      'fillRule',
      'flipX',
      'flipY',
      'height',
      'left',
      'opacity',
      'originX',
      'originY',
      'paintFirst',
      'scaleX',
      'scaleY',
      'shadow',
      'skewX',
      'skewY',
      'stroke',
      'strokeDashArray',
      'strokeDashOffset',
      'strokeLineCap',
      'strokeLineJoin',
      'strokeMiterLimit',
      'strokeUniform',
      'strokeWidth',
      'top',
      'visible',
      'width',
    ];
    Object.keys(json_dict).forEach(function(key) {
      if(keys_to_set.indexOf(key) == -1) {
          delete json_dict[key];
        }
    });
    return json_dict
  }

  start_download() {
    var self = this;
    fabric.Image.fromURL(this.media_url, function(oImg) {
      self.canvas_obj = oImg;
      self.canvas_obj.asset_uuid = self.uuid;
      self.canvas_obj.layer_uuid = self.layer_uuid;
      self.canvas_obj.set({'top': 200, 'left': 200});
      self.setup_events();
      let layer = window.world_controller.layer_controller.get_by_uuid(self.layer_uuid);
      layer.add_object(self);
      layer.add_to_canvas(self);
    });
  }

  update_asset() {
    window.world_controller.update_asset_meta(
        this.uuid,
        this.layer_uuid,
        this.name,
        this.clean_json(this.canvas_obj.toJSON()));
  }

  setup_events() {
    var self = this;
    this.canvas_obj.on('mouseup', function (event) {
      console.log(self.canvas_obj.toJSON());
      self.update_asset();
    });
  }

  name_change(event, model) {
    model.asset.name = this.textContent;
    model.asset.update_asset();
  }

  set_edit_name(event, model) {
    this.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[0].setAttribute('contenteditable', true);
    select_contenteditable_text(this.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[0]);
  }

  remove(event, model) {
    var confirmation = confirm('Are you sure you to remove this asset?');
    if(confirmation) {
      let layer = window.world_controller.layer_controller.get_by_uuid(model.asset.layer_uuid);
      layer.remove_from_canvas(model.asset);
      layer.remove_object(model.asset);

    }
    window.world_controller.delete_asset(model.asset.uuid);
  } 

  on_change(event, model) {
    // we lock x/y
    model.asset.asset_meta.scaleY = model.asset.asset_meta.scaleX
    model.asset.canvas_obj.set({
      'opacity': model.asset.asset_meta.opacity,
      'angle': model.asset.asset_meta.angle,
      'flipX': model.asset.asset_meta.flipX,
      'flipY': model.asset.asset_meta.flipY,
      'scaleX': model.asset.asset_meta.scaleX,
      'scaleY': model.asset.asset_meta.scaleY
    });
    model.asset.update_asset();
    window.world_controller.canvas.renderAll();
  }


}