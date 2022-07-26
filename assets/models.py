import uuid
from django.db import models

def version_upload_to(instance, filename):
    file_type = filename.split('.')[-1]
    return '{0}/{1}-{2}.{3}'.format('versions', instance.name,
        timezone.now().isoformat(), file_type)
class ImageAsset(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)  # external ID
    name = models.CharField(max_length=255)
    asset = models.FileField(
        blank=True,
        null=True,
        upload_to=version_upload_to,
        storage=ScopeStorage()
    )