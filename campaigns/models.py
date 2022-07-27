import uuid
from django.db import models


def campaign_banner_upload_to(instance, filename):
    file_type = filename.split('.')[-1]
    return '{0}/{1}/banner.{2}'.format('campaign', instance.uuid, file_type)


class Campaign(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)  # external ID
    name = models.CharField(max_length=255)
    banner = models.ImageField(
        blank=True,
        null=True,
        upload_to=campaign_banner_upload_to)

    dungeon_master = models.ForeignKey('users.User', related_name='campaign_dungeon_master', on_delete=models.CASCADE)
    players = models.ManyToManyField('users.User', related_name='campaign_players')

    created_by = models.ForeignKey('users.User', related_name='campaign_created_by', on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
