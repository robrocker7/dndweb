import uuid
from django.db import models


def asset_upload_to(instance, filename):
    file_type = filename.split('.')[-1]
    return '{0}/{1}/banner.{2}'.format('campaign', instance.uuid, file_type)


class Asset(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)  # external ID
    name = models.CharField(max_length=255)
    path = models.TextField()  # can be longer than 255 if; For organization outside campaigns
    asset = models.FileField(
        blank=True,
        null=True,
        upload_to=asset_upload_to)
    asset_type = models.CharField(max_length=255)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now_add=True)
