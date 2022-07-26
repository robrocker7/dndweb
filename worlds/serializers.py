import numpy as np
from django.core.cache import cache
from rest_framework import serializers

from worlds.models import World


class WorldSerializer(serializers.ModelSerializer):
    world_layers = serializers.ListField()

    class Meta:
        model = World
        fields = (
            'uuid',
            'name',
            'world_x_cols',
            'world_y_rows',
            'world_layers'
        )

    def save(self, *args, **kwargs):
        print(self.validated_data['world_layers']);
        self.validated_data['world_layers'] = bytes(self.validated_data['world_layers'])
        instance = super().save(*args, **kwargs)
        layers = np.frombuffer(instance.world_layers, dtype=np.uint8).reshape(instance.world_x_cols, instance.world_y_rows)

        response = {
            'type': 'terrain_update',
            'payload':np.rot90(layers, -1).flatten().tolist()
        }
        cache.set('terrain_update', response)
        return instance