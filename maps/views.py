from django.shortcuts import render
from django.views.generic import TemplateView
from django.views.generic.edit import FormView
from django.views.generic.detail import DetailView

from maps.models import Map
from maps.forms import NewMapForm, LayerDetailsComponentForm


class NewMapView(FormView):
    template_name = "maps/new_world.html"
    form_class = NewMapForm

    def get_success_url(self):
        return '/maps/{0}/'.format(self.object.uuid)

    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        self.object = form.save(commit=False)
        self.object.created_by = self.request.user
        self.object.save()
        return super().form_valid(form)


class MapHomeView(DetailView):
    template_name = "maps/world_home.html"
    model = Map
    slug_field = 'uuid'

    component_forms = {
        'layer_details': LayerDetailsComponentForm
    }

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['component_forms'] = self.component_forms
        return context