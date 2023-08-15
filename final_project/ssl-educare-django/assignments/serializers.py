from collections import OrderedDict
from datetime import timedelta
from django.db.models.fields import CharField
from assignments.models import Assignment
from courses.models import UserProfile, Course, User
from rest_framework import ISO_8601, serializers
from django.utils import timezone
from assignments.models import Submission
from posts.serializers import CommentSerializer
host = 'http://127.0.0.1:8000'
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
    def to_representation(self, instance):
        repre = super().to_representation(instance)
        del repre['course']
        del repre['id']
        #for some reason, this gives utc
        # print(repre['releaseDate'])
        duedatetime = timezone.datetime.fromisoformat(repre['dueDate']).replace(tzinfo=None)
        reldatetime = timezone.datetime.fromisoformat(repre['releaseDate']).replace(tzinfo=None)
        duedate = duedatetime.date()
        reldate = reldatetime.date()
        duetime = duedatetime.time()
        reltime = reldatetime.time()
        thepresent = timezone.localtime().replace(tzinfo=None)
        # print(duedate, duetime, reldate, reltime)
        repre['acceptSubmission'] = (duedatetime>thepresent and(reldatetime<=thepresent))
        repre['dueDate'] = duedate.isoformat()
        repre['releaseDate'] = reldate.isoformat()
        repre['dueTime'] = ':'.join(duetime.isoformat().split(':')[:-1])
        repre['releaseTime'] = ':'.join(reltime.isoformat().split(':')[:-1])
        if(repre['files']!='' and repre['files']!=None):
            repre['hasfiles']=True
            repre['files'] = {
                'name':repre['files'].split('/')[-1],
                'url':host + repre['files']
            }
        repre['seenby']=len(Submission.objects.filter(assignment =instance, readAssignment=True))
        repre['submittedby']=len(list(filter(lambda x: x.files!='',Submission.objects.filter(assignment=instance))))
        return repre
class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
    def to_representation(self, instance):
        repre =  super().to_representation(instance)
        del repre['assignment']
            
        if(instance.assignment.published):
            # print(repre.keys())
            repre['student'] = UserProfile.objects.get(id=repre['student']).userID
            if(repre['time']!=None):
                repre['time'] = timezone.datetime.fromisoformat(repre['time']).replace(tzinfo=None).isoformat()
            try:
                repre['files'] = {
                    'name':repre['files'].split('/')[-1],
                    'url':host+repre['files']
                }
            except:
                print(repre['student'])
            repre['comments'] = CommentSerializer(instance.comments, many=True).data
            if(not instance.assignment.graded):
                del repre['grade']
                del repre['feedback']
        else:
            repre['student'] = UserProfile.objects.get(id=repre['student']).userID
            repre['comments'] = CommentSerializer(instance.comments, many=True).data
        return repre