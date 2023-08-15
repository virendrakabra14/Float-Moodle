# Generated by Django 3.2.6 on 2021-11-22 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0009_auto_20211122_2015'),
        ('assignments', '0005_auto_20211106_1226'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='submission',
            name='comments',
        ),
        migrations.AddField(
            model_name='submission',
            name='comments',
            field=models.ManyToManyField(related_name='_assignments_submission_comments_+', to='posts.Comment'),
        ),
    ]