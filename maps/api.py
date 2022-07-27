from io import BytesIO

from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.exceptions import APIException
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.authentication import SessionAuthentication

from maps.models import Map
from maps.serializers import MapSerializer, CreateMapSerializer


class MapViewSet(CreateModelMixin,
                 RetrieveModelMixin,
                 UpdateModelMixin,
                 GenericViewSet):
    lookup_field = 'uuid'
    queryset = Map.objects.all()
    serializer_class = MapSerializer
    renderer_classes = [JSONRenderer,]

    serializers = {
        'create': CreateMapSerializer,
    }

    def get_serializer_class(self):
        return self.serializers.get(self.action, self.serializer_class)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)