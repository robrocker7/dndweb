import uuid
import json

import numpy as np
from django.db import models


class Map(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)  # external ID
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    campaign = models.ForeignKey('campaigns.Campaign', on_delete=models.CASCADE)
    
    # shape
    world_x_cols = models.IntegerField()
    world_y_rows = models.IntegerField()
    world_layers = models.BinaryField(null=True, blank=True)

    def __str__(self):
        return self.name

    @property
    def map_layers_list(self):
        return json.loads(str(self.world_layers, "utf-8"))
        #return np.frombuffer(self.world_layers, dtype=np.uint8).tolist()


