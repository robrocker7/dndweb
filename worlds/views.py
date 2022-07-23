from django.shortcuts import render
from django.views.generic import TemplateView
from django.views.generic.edit import FormView
from django.views.generic.detail import DetailView

from worlds.models import World
from worlds.forms import NewWorldForm


class NewWorldView(FormView):
    template_name = "worlds/new_world.html"
    form_class = NewWorldForm

    def get_success_url(self):
        return '/worlds/{0}/'.format(self.object.uuid)

    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        self.object = form.save(commit=False)
        self.object.created_by = self.request.user
        self.object.save()
        return super().form_valid(form)


class WorldHomeView(DetailView):
    template_name = "worlds/world_home.html"
    model = World
    slug_field = 'uuid'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        return context