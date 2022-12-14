# Generated by Django 4.0.6 on 2022-08-17 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bird_app', '0004_remove_bird_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bird',
            name='user_position',
        ),
        migrations.AddField(
            model_name='bird',
            name='user_lat',
            field=models.DecimalField(decimal_places=20, default=0.0, max_digits=23),
        ),
        migrations.AddField(
            model_name='bird',
            name='user_lng',
            field=models.DecimalField(decimal_places=20, default=0.0, max_digits=23),
        ),
    ]
