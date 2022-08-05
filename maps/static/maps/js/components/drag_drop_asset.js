class DragDropAssetUploaderComponent {
  constructor(element_id, world_uuid) {
    this.element_id = element_id;
    this.world_uuid = world_uuid;
    this.is_dragging = false;
    this.is_valid_state = false;
    this.layer_name = '';
    this.layer_uuid = '';

    this.setup_events();
  }

  handle_drop_file(layer_uuid, file) {
    let formData = new FormData();
    formData.append('name', file.name);
    formData.append('asset_type', file.type);
    formData.append('cb_path', '');
    formData.append('layer_uuid', layer_uuid);
    formData.append('asset', file);

    fetch('/api/maps/' + this.world_uuid + '/new_asset/', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      }
    })
    .then((res) => {
      return res.json();
    }).then((jsonResponse) => {
      console.log(jsonResponse);
      window.world_controller.content_browser_controller.populate_browser([jsonResponse]);
    })
    .catch(() => { /* Error. Inform the user */ })
  }

  setup_events() {
    var self = this;
    document.getElementById(this.element_id).addEventListener('drop', function(e) {
      e.preventDefault();
      self.is_dragging = false;
      var file = null;
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            file = e.dataTransfer.items[i].getAsFile();
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          file = e.dataTransfer.files[i];
        }
      }
      if(file == null) {
        return false;
      }

      console.log(file);
      var layer_uuid = '';
      if(window.world_controller.detail_controller.is_detail_component) {
        var layer_uuid = window.world_controller.detail_controller.model.uuid;
      }
      self.handle_drop_file(layer_uuid, file);
    });
    document.getElementById(this.element_id).addEventListener('dragenter', function(e) {
      if(window.world_controller.layer_controller.is_dragging) {
        e.preventDefault();
        return false;
      }
      self.is_dragging = true;
      if(window.world_controller.detail_controller.active_component == 'layer_details') {
        self.is_valid_state = true;
        self.layer_name = window.world_controller.detail_controller.model.name;
        self.layer_uuid = window.world_controller.detail_controller.model.uuid;
      } else {
        self.is_valid_state = false;
      }
    });
    document.getElementById(this.element_id).addEventListener('dragover', function(e) {
      e.preventDefault();
    });

  }
}