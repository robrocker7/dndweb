import time
import random
import functools
import itertools
import operator
import numpy as np

from worlds.constants import WORLD_MASKS, TERRAIN_MASK


class World:
    def __init__(self, x, y, instance=None, world_uuid=None):
        self.x_cols = x
        self.y_rows = y
        self.world_uuid = str(world_uuid)
        # initialize variables
        self.world_xx, self.world_yy = np.mgrid[0:self.x_cols, 0:self.y_rows]


        self.terrain_mask = np.zeros(
            self.x_cols * self.y_rows, dtype=int).reshape(
            self.x_cols, self.y_rows)
        
        self.layers = np.array([
                self.terrain_mask,
            ])


    def get_tile_at_coord(self, x, y):
        return Tile(x, y, self.layers[:, x, y])

    def build_coords(self):
        # uses the mgrid structures to build the 2dim matrix of the world
        return np.stack((self.world_xx, self.world_yy), axis=2)

    def get_packet_world_payload(self):
        # because of UE coord system differences we need to rotate the grid
        _layers = self.layers.copy()
        _layers[0] = np.rot90(_layers[0], -1)
        return _layers[0].flatten().tolist()

    def transform_layer_updates(self, updates):
        xaxis = []
        yaxis = []
        iaxis = []
        for x,y,i in updates:
            xaxis.append(x)
            yaxis.append(y)
            iaxis.append(i)
        return [xaxis, yaxis, iaxis]


    def update_from_tiles(self, tiles):
        mask_update_map = {
            WORLD_MASKS.TERRAIN_MASK: [],  # Xs,Ys,Values
        }
        for tile in tiles:
            mask_update_map[WORLD_MASKS.TERRAIN_MASK].append(
                [tile.x, tile.y, tile.masks[WORLD_MASKS.TERRAIN_MASK]])

        for layer, values in mask_update_map.items():
            self._set_layers(layer, values)

    def _set_layers(self, layer, updates):
        values = self.transform_layer_updates(updates)
        self.layers[layer, values[0], values[1]] = values[2]


class Tile(object):
    def __init__(self, x, y, masks, creature_uuid=None):
        self.x = x
        self.y = y
        self.masks = masks
        self.creature_uuid = creature_uuid

    def __str__(self):
        return '{0}, {1}'.format(self.x, self.y)

    def is_available(self):
        if self.masks[WORLD_MASKS.TERRAIN_MASK] or self.masks[WORLD_MASKS.CREATURE_MASK]: # hardcoded layer values
            return False 
        return True

    def set_terrain_mask(self, terrain_mask):
        self.masks[WORLD_MASKS.TERRAIN_MASK] = terrain_mask

    def get_terrain_mask(self):
        return self.masks[WORLD_MASKS.TERRAIN_MASK]

    def clear_terrain_mask(self):
        self.masks[WORLD_MASKS.TERRAIN_MASK] = TERRAIN_MASK.GRASS

    def get_packet_payload(self):
        return [
            float(self.x),
            float(self.y),
            [float(l) for l in self.masks]
        ]

    @classmethod
    def from_packet_payload(cls, payload):
        return cls(*payload)
