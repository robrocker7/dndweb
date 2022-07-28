from io import BytesIO

from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.exceptions import APIException
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.authentication import SessionAuthentication

from campaigns.models import Campaign
from campaigns.serializers import CampaignSerializer
from maps.models import WorldMap


class CampaignViewSet(CreateModelMixin,
                      RetrieveModelMixin,
                      UpdateModelMixin,
                      GenericViewSet):
    lookup_field = 'uuid'
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    renderer_classes = [JSONRenderer,]

    serializers = {
    }

    def get_serializer_class(self):
        return self.serializers.get(self.action, self.serializer_class)

    @action(detail=True, methods=['POST'])
    def update_order(self, request, uuid=None):
        new_order = request.data.get('order')
        update_objs = []
        for uuid, order_num in new_order.items():
            obj = WorldMap.objects.get(uuid=uuid)
            obj.order = order_num
            update_objs.append(obj)
        _ = WorldMap.objects.bulk_update(update_objs, ['order'])
        return Response({'success': True})
        