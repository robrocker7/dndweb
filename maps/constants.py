from dndweb.constants import ClassConst


class TERRAIN_MASK(ClassConst):
    GRASS = 0
    BLOCKED = 1
    TEST = 2
    PURPLE = 3

    DISPLAY = {
        GRASS: 'Grass',
        BLOCKED: 'Blocked',
        TEST: 'test',
        PURPLE: 'Purple'
    }


class WORLD_MASKS(ClassConst):
    TERRAIN_MASK = 0
    INTERACTABLE_MASK = 1
    CREATURE_MASK = 2

    DISPLAY = {
        TERRAIN_MASK: 'Terrain',
        INTERACTABLE_MASK: 'Interactable',
        CREATURE_MASK: 'Creature'
    }


class LAYER_VISIBILITY_COMPONENT(ClassConst):
    EVERYONE = 0
    DM_ONLY = 1
    SET_PLAYERS = 3

    DISPLAY = {
        EVERYONE: 'Everyone',
        DM_ONLY: 'DM Only',
        SET_PLAYERS: 'Set Players'
    }