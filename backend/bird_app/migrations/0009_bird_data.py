# Generated by Django 4.0.6 on 2022-08-24 20:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bird_app', '0008_remove_bird_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='bird',
            name='data',
            field=models.JSONField(default={'data': 'empty'}),
        ),
    ]