import uuid
from django.db import models

from tokens.constants import TOKEN_TYPES


class Token(models.Model):
	uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)  # external ID
	name = models.CharField(max_length=255)
	token_type = models.CharField(max_length=2, choices=TOKEN_TYPES.choices())
	meta = models.JSONField(null=True, blank=True)
	campaign = models.ForeignKey('campaigns.Campaign', on_delete=models.CASCADE)
	created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now_add=True)
