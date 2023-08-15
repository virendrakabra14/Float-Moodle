from django.contrib import admin

from .models import OTPToken, UserProfile, Course

admin.site.register(UserProfile)
admin.site.register(Course)
admin.site.register(OTPToken)
# Register your models here.
