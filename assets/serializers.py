import json

import numpy as np
from django.core.cache import cache
from rest_framework import serializers

from assets.models import Asset


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = (
            'uuid',
            'name',
            'path',
        )

