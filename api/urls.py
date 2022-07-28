from rest_framework import routers
from django.urls import path
from maps import api as map_views
from campaigns import api as campaign_views

app_name = 'api'


router = routers.SimpleRouter()
router.register(r'maps', map_views.MapViewSet)
router.register(r'campaigns', campaign_views.CampaignViewSet)

urlpatterns = router.urls
