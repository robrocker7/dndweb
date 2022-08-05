import json

from django.shortcuts import render
from django.views.generic import TemplateView
from django.views.generic.edit import FormView
from django.views.generic.detail import DetailView
from django.contrib.auth.mixins import LoginRequiredMixin

from maps.models import WorldMap
from maps.forms import NewMapForm, LayerDetailsComponentForm
from maps.serializers import MapAssetSerializer


class NewMapView(LoginRequiredMixin, FormView):
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


class MapHomeView(LoginRequiredMixin, DetailView):
    template_name = "maps/world_home.html"
    model = WorldMap
    slug_field = 'uuid'

    component_forms = {
        'layer_details': LayerDetailsComponentForm
    }

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['component_forms'] = self.component_forms
        asset_objs = MapAssetSerializer.prefetch_related_querset(
            self.object.worldmapassetthrough_set.all())
        context['assets'] = json.dumps(MapAssetSerializer(asset_objs, many=True).data)
        return context