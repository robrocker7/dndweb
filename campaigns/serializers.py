import json

import numpy as np
from django.core.cache import cache
from rest_framework import serializers

from campaigns.models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = (
            'uuid',
            'name',
            'banner',
            'dungeon_master',
            'players',
            'created_by',
            'created_on'
        )

