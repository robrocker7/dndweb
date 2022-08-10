from django.views.generic.base import RedirectView

from django.urls import reverse


class LandingRedirectView(RedirectView):

    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        if self.request.user.is_authenticated:
            return reverse('campaigns:campaign_list')
        return reverse('login')
