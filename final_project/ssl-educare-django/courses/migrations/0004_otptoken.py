# Generated by Django 3.2.6 on 2021-11-28 03:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_alter_wizardcard_wizard'),
    ]

    operations = [
        migrations.CreateModel(
            name='OTPToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purpose', models.CharField(default='general', max_length=100)),
                ('otp', models.CharField(max_length=100)),
                ('users', models.ManyToManyField(related_name='_courses_otptoken_users_+', to='courses.UserProfile')),
            ],
        ),
    ]
