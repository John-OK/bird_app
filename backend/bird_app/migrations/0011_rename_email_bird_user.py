# Generated by Django 4.0.6 on 2023-10-12 19:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bird_app', '0010_rename_user_bird_email_alter_bird_date_confirmed'),
    ]

    operations = [
        migrations.RenameField(
            model_name='bird',
            old_name='email',
            new_name='user',
        ),
    ]
