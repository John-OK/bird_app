from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import *

# Inheriting from 'AbstractUser' lets us use all the fields of the default User,
# and overwrite the fields we need to change
# This is different from 'AbstractBaseUser', which only gets the password management features from the default User,
# and needs the developer to define other relevant fields.
class User(AbstractUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # Email & Password are required by default.

class Bird(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    bird_name = models.CharField(max_length=255, blank=False, default="noname", validators=[MinLengthValidator(1, 'This field cannot be blank.')])
    date_confirmed = models.DateField(auto_now_add=True)
    user_lat = models.DecimalField(max_digits=23, decimal_places=20, default=0.00)
    user_lng = models.DecimalField(max_digits=23, decimal_places=20, default=0.00)
    # data = models.JSONField(default={"data": "empty"})