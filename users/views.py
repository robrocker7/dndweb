from django.shortcuts import render
from django.views.generic.edit import FormView

from worlds.models import World
from worlds.forms import NewWorldForm


class NewWorldView(FormView):
    template_name = "worlds/new_world.html"
    form_class = NewWorldForm

    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        self.object = form.save(created_by=request.user)
        return super().form_valid(form)