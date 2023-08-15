# Generated by Django 3.2.6 on 2021-10-15 12:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
        ('assignments', '0003_auto_20211007_1956'),
    ]

    operations = [
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('readAssignment', models.BooleanField(default=False)),
                ('files', models.FileField(null=True, upload_to='')),
                ('grade', models.FloatField(default=0)),
                ('time', models.DateTimeField(null=True)),
                ('feedback', models.TextField(default='')),
                ('comments', models.TextField(default='')),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='assignments.assignment')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='courses.userprofile')),
            ],
        ),
    ]