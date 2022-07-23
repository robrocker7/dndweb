import uuid
import numpy as np
from django.db import models


class World(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)  # external ID
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    
    # shape
    world_x_cols = models.IntegerField()
    world_y_rows = models.IntegerField()
    world_layers = models.BinaryField(null=True, blank=True)

    def __str__(self):
        return self.name

    @property
    def world_layers_list(self):
        return np.frombuffer(self.world_layers, dtype=np.uint8).tolist()
