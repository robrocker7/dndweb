class ImageAsset {
  constructor(layer_uuid, asset) {
    console.log(asset);
    this.uuid = asset.uuid;
    this.name = asset.name;
    this.canvas_obj = null;
    this.layer_uuid = asset.layer_uuid;
    this.media_url = asset.asset_file;
    this.asset_meta = asset.asset_meta;
    this.mask = 0; // indicates imageasset    
    this.active = false; // used for ui in layer details
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

  setup_events() {
    var self = this;
    this.canvas_obj.on('mouseup', function (event) {
      window.world_controller.update_asset_meta(
        self.uuid,
        self.layer_uuid,
        self.clean_json(self.canvas_obj.toJSON()));
    });

  }

  accordian_header_html() {
    return `
      <h2 class="accordion-header">
        <button class="accordion-button collapsed p-0" type="button" data-bs-toggle="collapse" data-bs-target="#ah${this.uuid}" aria-expanded="true" aria-controls="ah${this.uuid}">
          <p class="p-2">${this.name}</p>
        </button>
      </h2>
    `;
  }

  accordian_body_html() {
    return `
      <div id="ah${this.uuid}" class="accordion-collapse collapse" aria-labelledby="heading{this.uuid}" data-bs-parent="#layerDetailAssets">
        <div class="accordion-body">
          asdfasdf
        </div>
      </div>
    `;
  }
}