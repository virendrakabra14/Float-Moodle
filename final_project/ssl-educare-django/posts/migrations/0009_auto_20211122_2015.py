# Generated by Django 3.2.6 on 2021-11-22 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0008_notif'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='title',
            field=models.CharField(default='Super Important!', max_length=300),
        ),
        migrations.DeleteModel(
            name='Notif',
        ),
    ]
