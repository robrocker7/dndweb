import uuid
import json

import numpy as np
from django.db import models


class WorldMapAssetThrough(models.Model):
    asset = models.ForeignKey(
        'assets.Asset', on_delete=models.CASCADE)
    world_map = models.ForeignKey(
        'maps.WorldMap', on_delete=models.CASCADE)
    
    layer_uuid = models.CharField(max_length=255)  # uuid of layer the asset belongs to
    cb_path = models.TextField()  # we'll use this to store directory display information
    created_on = models.DateTimeField(auto_now_add=True)


class WorldMap(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)  # external ID
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    campaign = models.ForeignKey('campaigns.Campaign', on_delete=models.CASCADE)
    order = models.IntegerField(default=1, help_text='Used for ordering of the maps in the UI')
    
    # shape
    world_x_cols = models.IntegerField()
    world_y_rows = models.IntegerField()
    tile_size = models.IntegerField(default=10, help_text='Used to scale the individual tile size in the UI.')
    tile_scale = models.IntegerField(default=1, help_text='Used to scale the world. Default scale is 5x5')
    world_layers = models.BinaryField(null=True, blank=True)

    assets = models.ManyToManyField(
        'assets.Asset',
        through=WorldMapAssetThrough,
        through_fields=('world_map', 'asset'))

    def __str__(self):
        return self.name

    @property
    def map_layers_list(self):
        return json.loads(str(self.world_layers, "utf-8"))
        #return np.frombuffer(self.world_layers, dtype=np.uint8).tolist()


