import os
# import boto3

# from django.conf import settings
# from django.core.files.base import File
# from django.core.files.storage import Storage
# from django.utils.deconstruct import deconstructible
# from storages.backends.s3boto3 import S3Boto3Storage


# class StaticStorage(S3Boto3Storage):
#     location = settings.STATICFILES_LOCATION


# @deconstructible
# class S3MediaStorage(Storage):
#     bucket = None
#     directory_path = None
#     s3_url = None

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         access, secret = self.get_aws_credentials(settings)
#         self.s3 = boto3.client('s3',
#             aws_access_key_id=access,
#             aws_secret_access_key=secret)

#     def get_aws_credentials(self, local_settings):
#         access = os.getenv('AWS_ACCESS_KEY_ID',
#             getattr(local_settings, 'AWS_ACCESS_KEY_ID', None))
#         secret = os.getenv('AWS_SECRET_ACCESS_KEY',
#             getattr(local_settings, 'AWS_SECRET_ACCESS_KEY', None))
#         return access, secret

#     def get_bucket(self):
#         if self.bucket is None:
#             raise NotImplementedError('bucket attribute should not be None')
#         return self.bucket

#     def get_directory_path(self):
#         if self.directory_path is None:
#             raise NotImplementedError('directory_path attribute should not be None')
#         return self.directory_path

#     def get_s3_url(self):
#         if self.s3_url is None:
#             raise NotImplementedError('s3_url attribute should not be None')
#         return self.s3_url

#     def _open(self, name, mode='rb'):
#         return File(open(self.path(name), mode))

#     def _save(self, name, content):
#         print('attempting upload')
#         print(content)
#         self.s3.upload_fileobj(
#             content,
#             self.get_bucket(),
#             '{0}{1}'.format(self.get_directory_path(), name))

#         # boto requires explicit closing of file-like object
#         content.close()

#         return name

#     def exists(self, name):
#         # Disregard existing files and overwrite
#         return False

#     def url(self, name):
#         return self.get_s3_url() + name
