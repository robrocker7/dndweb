import json

import numpy as np
from django.core.cache import cache
from django.templatetags.static import static
from rest_framework import serializers

from maps.models import WorldMap, WorldMapAssetThrough
from campaigns.models import Campaign


class MapSerializer(serializers.ModelSerializer):
    world_layers = serializers.ListField()

    class Meta:
        model = WorldMap
        fields = (
            'uuid',
            'name',
            'world_x_cols',
            'world_y_rows',
            'tile_size',
            'tile_scale',
            'world_layers'
        )

    def save(self, *args, **kwargs):
        if 'world_layers' in self.validated_data.keys() and len(self.validated_data['world_layers']):
            tile_masks = self.validated_data['world_layers'][0]['masks']
            print(tile_masks)
            self.validated_data['world_layers'] = bytes(json.dumps(self.validated_data['world_layers']), encoding="utf-8")
        instance = super().save(*args, **kwargs)
        # world_layers first index is always going to be the tile layer

        if 'world_layers' in self.validated_data.keys() and len(self.validated_data['world_layers']):
            terrain_mask_layer = np.frombuffer(bytes(tile_masks), dtype=np.uint8).reshape(
                instance.world_x_cols, instance.world_y_rows)

            response = {
                'type': 'terrain_update',
                'payload':np.rot90(terrain_mask_layer, -1).flatten().tolist()
            }
            cache.set('terrain_update', response)
        return instance


class MapNoLayersSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorldMap
        fields = (
            'uuid',
            'name',
            'world_x_cols',
            'world_y_rows',
        )


class CreateMapSerializer(serializers.ModelSerializer):
    campaign = serializers.CharField()
    class Meta:
        model = WorldMap
        fields = (
            'name',
            'world_x_cols',
            'world_y_rows',
            'campaign'

        )

    def save(self, *args, **kwargs):
        campaign_uuid = self.validated_data['campaign']
        campaign = Campaign.objects.get(uuid=campaign_uuid)
        self.validated_data['campaign'] = campaign
        return super().save(*args, **kwargs)


class MapAssetSerializer(serializers.ModelSerializer):
    asset_file = serializers.SerializerMethodField()
    asset_type = serializers.SerializerMethodField()

    class Meta:
        model = WorldMapAssetThrough
        fields = (
            'asset_file',
            'asset_type',
            'world_map',
            'layer_uuid',
            'cb_path'
        )

    def get_asset_file(self, obj):
        return obj.asset.asset.url;

    def get_asset_type(self, obj):
        return obj.asset.asset_type

    @classmethod
    def prefetch_related_querset(cls, queryset):
        return queryset.prefetch_related(
            'asset', 'world_map')