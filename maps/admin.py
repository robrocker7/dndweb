from django.contrib import admin

from maps.models import WorldMap, WorldMapAssetThrough


class WorldMapAssetThroughInline(admin.TabularInline):
    model = WorldMapAssetThrough


class MapAdmin(admin.ModelAdmin):
    fields = ('uuid', 'name', 'world_x_cols', 'world_y_rows')
    readonly_fields = ('uuid',)

    inlines = [WorldMapAssetThroughInline,]


admin.site.register(WorldMap, MapAdmin)