# Generated by Django 4.0.6 on 2022-08-17 17:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bird_app', '0002_bird'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bird',
            name='data',
            field=models.TextField(),
        ),
    ]
