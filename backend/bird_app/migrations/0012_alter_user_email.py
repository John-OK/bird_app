# Generated by Django 4.0.6 on 2023-10-13 06:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bird_app', '0011_rename_email_bird_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(db_index=True, max_length=255, unique=True, verbose_name='email address'),
        ),
    ]