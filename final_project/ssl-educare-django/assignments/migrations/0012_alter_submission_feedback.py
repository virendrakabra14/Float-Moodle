# Generated by Django 3.2.6 on 2021-11-26 02:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assignments', '0011_assignment_graded'),
    ]

    operations = [
        migrations.AlterField(
            model_name='submission',
            name='feedback',
            field=models.TextField(blank=True, default=''),
        ),
    ]
