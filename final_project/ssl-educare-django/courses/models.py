from django.core.mail.message import EmailMultiAlternatives
from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields.related import OneToOneField
from django.contrib.auth.models import User
import threading, time
from functools import partial
# from posts.models import Post
# from assignments.models import Assignment
class UserProfile(models.Model):
    user = OneToOneField(User, on_delete=models.CASCADE)
    userID = models.CharField(max_length=15)
    def __str__(self):
        return self.userID
    def sendEmail(subject,body,toEmail):
        from django.core.mail import EmailMessage
        from django.conf import settings
        email = EmailMultiAlternatives(
            subject,
            '',
            settings.EMAIL_HOST_USER,
            [toEmail],
        )
        email.attach_alternative(body, "text/html")
        email.fail_silently = False
        email.send()
    def asyncSendEmail(self,subject, body, toEmail=None):
        if(toEmail==None and self.user.email==None):
            print("Email not assigned to user object and not supplied to call")
            return
        elif(toEmail!=None):
            threading.Thread(target=partial(UserProfile.sendEmail,subject,body,toEmail)).start()
        else:
            threading.Thread(target=partial(UserProfile.sendEmail, subject,body,self.user.email)).start()
    def sendGraderFailMail(self, output:str, executor, task):
        from courses.views import Templates
        emailparams = {
            'graderUsed':executor,
            'output':output,
            'code':task.course.courseCode,
            'number':task.number+1,
        }
        self.asyncSendEmail(*Templates.getSubjectBody(executor+'fail', emailparams))
    def sendGraderSuccessMail(self, output:str, executor, task):
        from courses.views import Templates
        emailparams = {
            'graderUsed':executor,
            'output':output,
            'code':task.course.courseCode,
            'number':task.number+1,
        }
        self.asyncSendEmail(*Templates.getSubjectBody(executor+'success', emailparams))
    def sendOTPMail(self, token, purpose_verbose):
        from courses.views import Templates
        emailparams = {
            'username':self.user.username,
            'otp':token.otp,
            'purpose':purpose_verbose,
            'timeout':token.timeout
        }
        self.asyncSendEmail(*Templates.getSubjectBody('otp', emailparams))
    def sendFeedbackFormatMail(self, course):
        from courses.views import Templates
        emailparams = {
            'username':self.user.username,
            'code':course.courseCode
        }
        self.asyncSendEmail(*Templates.getSubjectBody('FF', emailparams))
class WizardCard(models.Model):
    wizard = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    level = models.IntegerField(default=3)
    def __str__(self):
        return self.wizard.userID + ":"+str(self.level)
    def wizardID(self):
        return self.wizard.userID

class Course(models.Model):
    courseName = models.CharField(max_length=100, default='Learning')
    courseID = models.CharField(max_length=15, default='LR101y2000s1')
    courseCode = models.CharField(max_length=7, default='LR101')
    instructors = models.ManyToManyField(UserProfile, related_name='instructor+', symmetrical=False)
    wizardcards = models.ManyToManyField(WizardCard, related_name='wizardcard+', symmetrical=False)
    students = models.ManyToManyField(UserProfile, related_name='student+',symmetrical=False)
    def __str__(self):
        return self.courseCode
class OTPToken(models.Model):
    purpose = models.CharField(max_length=100, default='general')
    otp = models.CharField(max_length=100, null=False, blank=False)
    users = models.ManyToManyField(UserProfile, related_name='users+')
    timeout = models.IntegerField(default=120)
    def setToSelfdestruct(self):
        def waitAndDestruct():
            time.sleep(self.timeout)
            self.delete()
        threading.Thread(target=waitAndDestruct).start()