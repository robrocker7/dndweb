var componentDetailModels = {
    active_component: 'none',
    model: null,
    is_detail_component: false,
    set_active_object(object) {
        // objects sent to the function must have a 
        // detail_component attribute
        this.active_component = object.detail_component;
        this.model = object;
        this.flag_detail_component();
    },
    flag_detail_component() {
        
        if(this.active_component == 'layer_details') {
            this.is_detail_component = true;
        } else {
          this.is_detail_component = false;  
        }
    }
}
