from django.contrib import admin

from maps.models import Map

class MapAdmin(admin.ModelAdmin):
    fields = ('uuid', 'name', 'world_x_cols', 'world_y_rows')
    readonly_fields = ('uuid',)


admin.site.register(Map, MapAdmin)