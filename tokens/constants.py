from dndweb.constants import ClassConst


class TOKEN_TYPES(ClassConst):
    PLAYER = 0
    HOSTILE = 1
    NON_HOSTILE = 2
    SPELL_EFFECT = 3

    DISPLAY = {
        PLAYER: 'Player',
        HOSTILE: 'Hostile',
        NON_HOSTILE: 'Non Hostile',
        SPELL_EFFECT: 'Spell Effect'
    }
