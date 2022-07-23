class ClassConst(object):
    @classmethod
    def display(cls, value):
        return cls.DISPLAY[value]

    @classmethod
    def choices(cls, add_blank=False):
        items = cls.DISPLAY
        if add_blank:
            blank = {'': 'Please Select'}
            items = {**blank, **items}
        return ((key, value) for key, value in items.items())

    @classmethod
    def get_from_display(cls, value):
        consts = {v: k for k, v in cls.DISPLAY.items()}
        return consts.get(value)

