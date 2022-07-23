from django import forms

from worlds.models import World


class NewWorldForm(forms.ModelForm):
    class Meta:
        model = World
        fields = [
            'name',
            'world_x_cols',
            'world_y_rows',
        ]
