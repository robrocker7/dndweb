from rest_framework import routers
from django.urls import path
from worlds import api as world_views

app_name = 'api'


router = routers.SimpleRouter()
router.register(r'worlds', world_views.WorldViewSet)

urlpatterns = router.urls
