class ImageAsset {
  constructor(layer_uuid, asset) {
    this.uuid = asset.uuid;
    this.name = asset.name;
    this.canvas_obj = null;
    this.layer_uuid = asset.layer_uuid;
    this.media_url = asset.asset_file;
    this.asset_meta = asset.asset_meta;
    this.asset_type = asset.asset_type;
    this.mask = 0; // indicates imageasset    
    this.active = false; // used for ui in layer details

    this.asset_main_id = 'asset' + this.uuid;
    this.asset_accordian_body_id = 'ab' + this.uuid;
    this.asset_accordian_target_id = '#' + this.asset_accordian_body_id
    this.asset_button_id = 'bu' + this.uuid;
  }

  clean_json(json_dict) {
    console.log(json_dict)
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
      'scaleX',
      'scaleY',
      'shadow',
      'skewX',
      'skewY',
      'stroke',
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

  start_download(left, top) {
    var self = this;
    fabric.Image.fromURL(this.media_url, function(oImg) {
      self.canvas_obj = oImg;
      self.canvas_obj.asset_uuid = self.uuid;
      self.canvas_obj.layer_uuid = self.layer_uuid;
      self.canvas_obj.set({'top': top, 'left': left, 'originX': 'left', 'originY': 'bottom', 'stroke': 'white', 'stokeWidth': 2});
      self.setup_events();
      let asset_added_event = new CustomEvent('asset:add_to_canvas', {
        'detail': {
          'asset_uuid': self.uuid,
          'layer_uuid': self.layer_uuid
        }
      });
      window.world_controller.canvas_elem.dispatchEvent(asset_added_event);
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
      self.update_asset();
    });
  }

  name_change(event, model) {
    model.asset.name = this.textContent;
    model.asset.update_asset();
    this.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[0].setAttribute('contenteditable', false);
  }

  set_edit_name(event, model) {
    this.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[0].setAttribute('contenteditable', true);
    select_contenteditable_text(
      this.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[0]);
  }

  remove(event, model) {
    var confirmation = confirm('Are you sure you to remove this asset?');
    if(confirmation) {
      window.world_controller.delete_asset(model.asset.uuid, model.asset.layer_uuid);
    }
    
  }

  set_display_cb_options() {
    if(this.hovering && this.active) {
      this.display_cb_options = true;
    } else {
      this.display_cb_options = false;
    }
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