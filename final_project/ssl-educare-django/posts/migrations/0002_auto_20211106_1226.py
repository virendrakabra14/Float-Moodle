# Generated by Django 3.2.6 on 2021-11-06 06:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='comments',
            field=models.TextField(default='{}'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='post',
            name='discussable',
            field=models.BooleanField(default=True),
        ),
    ]
