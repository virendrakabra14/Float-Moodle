# Generated by Django 3.2.6 on 2021-11-23 03:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assignments', '0006_auto_20211122_2015'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignment',
            name='dueDate',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='assignment',
            name='releaseDate',
            field=models.DateTimeField(),
        ),
    ]