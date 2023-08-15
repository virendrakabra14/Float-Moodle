from datetime import tzinfo
from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import BooleanField, CharField, DateTimeField, FloatField, IntegerField, TextField
from django.db.models.fields import related
from django.db.models.fields.related import ForeignKey, ManyToManyField
from courses.models import Course, UserProfile


from posts.models import Comment
# Create your models here.
def upload_local(instance, filename):
    modelname = type(instance).__name__
    if(modelname=='Submission'):
        courseid = instance.assignment.course.courseID
        tasknum = instance.assignment.number
        userid = instance.student.userID
        return '/'.join([courseid, 'assignments', str(tasknum), 'submissions', userid, filename])
    else:
        #modelname = post/assignment
        courseid = instance.course.courseID
        number = instance.number
        # 's'.lower
        return '/'.join([courseid, modelname.lower() + 's',str(number),filename])

class Assignment(models.Model):
    course = ForeignKey(Course, on_delete=CASCADE)
    number = IntegerField()
    title = CharField(max_length=300, default="Awesome Assignment!")
    instruction = TextField()
    author=ManyToManyField(UserProfile, related_name='author+',default='self.course.instructors.all()[0]')
    published = BooleanField(default=False)
    releaseDate = DateTimeField()
    weight = FloatField(blank=True,null=True)
    files = models.FileField(null=True,blank=True,upload_to=upload_local)
    dueDate = DateTimeField()
    graded = BooleanField(default=False)
    def __str__(self):
        return self.course.courseID +':'+str(self.number)+':'+self.title
    def sendPublishMail(self):
        host = 'http://127.0.0.1:8000'
        from courses.views import Templates
        emailparams = {
            'code':self.course.courseCode,
            'courseid':self.course.courseID,
            'number':self.number+1,
            'title':self.title,
            'instruction':self.instruction,
            'author':self.author.all()[0].user.username,
            'duedate':', '.join(self.dueDate.replace(tzinfo=None).isoformat().split('T')),
            'mainlink':Templates.frontEnd,
            'hasfile':False
        }
        emailparams['link'] = Templates.getFrontEndLink('NT',emailparams)
        if(self.files!='' and self.files != None):
            emailparams['hasfile']=True; emailparams['attachment'] = host + '/media/'+str(self.files)
        
        for student in self.course.students.all():
            student:UserProfile
            emailparams['username'] = student.user.username
            student.asyncSendEmail(*Templates.getSubjectBody('NT', emailparams))
        for wizcard in self.course.wizardcards.all():
            emailparams['username'] = wizcard.wizard.user.username
            wizcard.wizard.asyncSendEmail(*Templates.getSubjectBody('NT', emailparams))
    def sendGradesOutMail(self):
        host = 'http://127.0.0.1:8000'
        from courses.views import Templates
        emailparams = {
            'code':self.course.courseCode,
            'courseid':self.course.courseID,
            'number':self.number+1,
            'title':self.title,
            'author':self.author.all()[0].user.username,
            'instruction':self.instruction,
            'duedate':', '.join(self.dueDate.replace(tzinfo=None).isoformat().split('T')),
            'mainlink':Templates.frontEnd,
            'hasfile':False
        }
        emailparams['link'] = Templates.getFrontEndLink('GO',emailparams)
        if(self.files!='' and self.files != None):
            emailparams['hasfile']=True; emailparams['attachment'] = host + '/media/'+str(self.files)
        print(emailparams)
        for student in self.course.students.all():
            student:UserProfile
            emailparams['username'] = student.user.username
            student.asyncSendEmail(*Templates.getSubjectBody('GO', emailparams))
        for wizcard in self.course.wizardcards.all():
            emailparams['username'] = wizcard.wizard.user.username
            wizcard.wizard.asyncSendEmail(*Templates.getSubjectBody('GO', emailparams))
class Submission(models.Model):
    assignment = ForeignKey(Assignment, on_delete=CASCADE)
    student = ForeignKey(UserProfile, on_delete=CASCADE)
    readAssignment = BooleanField(default=False)
    files = models.FileField(blank=True, null=True, upload_to=upload_local)
    grade = FloatField(default=-1)
    time = DateTimeField(null=True)
    feedback = TextField(default="",blank=True)
    comments = ManyToManyField(Comment, related_name='comment+', blank=True)
    def __str__(self):
        return self.assignment.course.courseID + ':' + str(self.assignment.number)+ ':' +self.student.userID 
    def sendConfirmationMail(self):
        from courses.views import Templates
        self.student:UserProfile
        emailparams = {
            'username':self.student.user.username,
            'code':self.assignment.course.courseCode,
            'courseid':self.assignment.course.courseID,
            'number':self.assignment.number+1,
            'mainlink':Templates.frontEnd,
            'title':self.assignment.title,
            'author':self.assignment.author.all()[0].user.username,
            'duedate':', '.join(self.assignment.dueDate.replace(tzinfo=None).isoformat().split('T'))
        }
        emailparams['link'] = Templates.getFrontEndLink('NT', emailparams)
        self.student.asyncSendEmail(*Templates.getSubjectBody('submission', emailparams))