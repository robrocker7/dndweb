import json

from django.shortcuts import render
from django.views.generic import TemplateView
from django.views.generic.list import ListView
from django.views.generic.edit import FormView
from django.views.generic.detail import DetailView
from django.contrib.auth.mixins import LoginRequiredMixin

from campaigns.models import Campaign
from campaigns.forms import NewCampaignForm

from maps.forms import NewMapForm
from maps.serializers import MapNoLayersSerializer


class CampaignLandingPageView(LoginRequiredMixin, ListView):
    template_name = "campaigns/home.html"
    model = Campaign

    def get_context_data(self, *args, **kwargs):
        return super().get_context_data(*args, **kwargs)


class CampaignCreateView(LoginRequiredMixin, FormView):
    template_name = "campaigns/edit.html"
    form_class = NewCampaignForm
    success_url = ''

    def get_success_url(self):
        return '/campaigns/{0}/'.format(self.object.uuid)

    def form_valid(self, form):
        """If the form is valid, save the associated model."""
        self.object = form.save(commit=False)
        self.object.banner = self.request.FILES['banner']
        self.object.dungeon_master = self.request.user
        self.object.created_by = self.request.user
        self.object.save()
        return super().form_valid(form)


class CampaignHomeView(LoginRequiredMixin, DetailView):
    template_name = "campaigns/campaign_home.html"
    model = Campaign
    slug_field = 'uuid'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['maps'] = json.dumps(MapNoLayersSerializer(self.object.worldmap_set.order_by('order'), many=True).data)
        context['map_form'] = NewMapForm()
        return context
