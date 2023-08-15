from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import BooleanField, CharField, DateTimeField, IntegerField, TextField
from django.db.models.fields.related import ForeignKey, ManyToManyField, OneToOneField
# from assignments.models import upload_local
# from assignments.models import Assignment
from courses.models import Course, UserProfile

# Create your models 
class Comment(models.Model):
    # post = OneToOneField(Post, on_delete=CASCADE, null=True, blank=True)
    datemade = DateTimeField()
    author = ForeignKey(UserProfile, on_delete=models.CASCADE)
    text = TextField(default="")
    replies = ManyToManyField("self", related_name='reply+', symmetrical=False, blank=True)

class Post(models.Model):
    course = ForeignKey(Course, on_delete=CASCADE)
    number = IntegerField()
    title = CharField(max_length=300, default="Super Important!")
    instruction = TextField()
    published = BooleanField(default=False)
    author = ManyToManyField(UserProfile, related_name='author+')
    discussable = BooleanField(default=True)
    comments = ManyToManyField(Comment, related_name='comment+',blank=True)
    releaseDate = DateTimeField()
    files = models.FileField(null=True,blank=True)
    def __str__(self):
        return self.course.courseID + ':'+str(self.number)
    def sendPublishMail(self):
        host = 'http://127.0.0.1:8000'
        from courses.views import Templates
        emailparams ={
            'code':self.course.courseCode,
            'courseid':self.course.courseID,
            'number':self.number+1,
            'title':self.title,
            'author':self.author.all()[0].user.username,
            'instruction':self.instruction,
            'mainlink':Templates.frontEnd,
            'hasfile':False
        }
        emailparams['link'] = Templates.getFrontEndLink('NP', emailparams)
        if(self.files!='' and self.files != None):
            emailparams['hasfile']=True; emailparams['attachment'] = host+'/media/'+str(self.files)
        # print(emailparams)
        for student in self.course.students.all():
            emailparams['username'] = student.user.username
            student:UserProfile
        
            student.asyncSendEmail(*Templates.getSubjectBody('NP', emailparams))
        for wizcard in self.course.wizardcards.all():
            emailparams['username'] = wizcard.wizard.user.username
            
            wizcard.wizard.asyncSendEmail(*Templates.getSubjectBody('NP', emailparams))

# class Notif(models.Model):
#     user = OneToOneField(UserProfile, null=True, on_delete=CASCADE)
#     post = OneToOneField(Post, null=True, on_delete=CASCADE)
#     task = OneToOneField(Assignment, null=True, on_delete=CASCADE)