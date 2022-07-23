from django.contrib import admin

from worlds.models import World

class WorldAdmin(admin.ModelAdmin):
    fields = ('uuid', 'name', 'world_x_cols', 'world_y_rows')
    readonly_fields = ('uuid',)


admin.site.register(World, WorldAdmin)