from io import BytesIO

from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.exceptions import APIException
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.authentication import SessionAuthentication

# from worlds.models import World
# from worlds.serializers import WorldSerializer


# class AssetViewSet(RetrieveModelMixin,
#                    UpdateModelMixin,
#                    GenericViewSet):
#     lookup_field = 'uuid'
#     queryset = World.objects.all()
#     serializer_class = WorldSerializer
#     renderer_classes = [JSONRenderer,]


