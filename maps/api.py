from io import BytesIO

from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.exceptions import APIException
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.authentication import SessionAuthentication

from maps.models import WorldMap, WorldMapAssetThrough
from maps.serializers import MapSerializer, CreateMapSerializer, MapAssetSerializer

from assets.models import Asset
from assets.serializers import AssetSerializer


class MapViewSet(CreateModelMixin,
                 RetrieveModelMixin,
                 UpdateModelMixin,
                 GenericViewSet):
    lookup_field = 'uuid'
    queryset = WorldMap.objects.all()
    serializer_class = MapSerializer
    renderer_classes = [JSONRenderer,]

    serializers = {
        'create': CreateMapSerializer,
    }

    def get_serializer_class(self):
        return self.serializers.get(self.action, self.serializer_class)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['POST'])
    def new_asset(self, request, uuid=None):
        world_map = self.get_object()
        client_asset = request.FILES['asset']

        asset = Asset.objects.create(
            name=request.data['name'],
            path=request.data['cb_path'],
            asset_type=request.data['asset_type'],
            asset=client_asset,
            created_by=self.request.user)
        instance = world_map.worldmapassetthrough_set.create(
            asset=asset,
            layer_uuid=request.data['layer_uuid'],
            cb_path=request.data['cb_path'])
        serializer = MapAssetSerializer(instance=instance)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def assets(self, request, uuid=None):
        asset_throughs = WorldMapAssetThrough.objects.filter(
            world_map__uuid=uuid)
        serializer = MapAssetSerializer(instance=asset_throughs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['PUT', 'DELETE'],
        url_path='asset/(?P<asset_uuid>[^/.]+)')
    def update_asset(self, request, uuid=None, asset_uuid=None):
        if request.method == 'PUT':
            Asset.objects.filter(uuid=asset_uuid).update(
                name=request.data['name'])
            WorldMapAssetThrough.objects.filter(world_map__uuid=uuid, asset__uuid=asset_uuid).update(
                asset_meta=request.data['asset_meta'],
                layer_uuid=request.data['layer_uuid'])
            return Response({'success': True})
        if request.method == 'DELETE':
            Asset.objects.filter(uuid=asset_uuid).delete()
            return Response({'success': True})