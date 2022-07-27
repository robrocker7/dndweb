from django import forms
from django_bootstrap5.renderers import FieldRenderer


from maps.models import Map
from maps.constants import LAYER_VISIBILITY_COMPONENT


# class WorldCanvasFieldRenderer(FieldRenderer):
#     def render(self):
#         print(self.widget.attrs)
#         self.widget.attrs['rv-value'] = self.field.name
#         return super().render()


class NewMapForm(forms.ModelForm):
    class Meta:
        model = Map
        fields = [
            'name',
            'world_x_cols',
            'world_y_rows',
        ]


class LayerDetailsComponentForm(forms.Form):
    name = forms.CharField(widget=forms.TextInput(attrs={'rv-value': 'model.name'}))
    visibility = forms.ChoiceField(
        choices=LAYER_VISIBILITY_COMPONENT.choices(),
        widget=forms.Select(attrs={'rv-value': 'model.visibility'}))

    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)
    #     for field_name in self.fields:
    #         self.fields[field_name].widget.attrs['rv-value'] = field_name