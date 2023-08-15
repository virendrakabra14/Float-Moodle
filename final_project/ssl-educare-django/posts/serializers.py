from collections import OrderedDict
from django.db.models.fields import CharField
from posts.models import Comment, Post
from courses.models import UserProfile, Course, User
from rest_framework import serializers
from django.utils import timezone
from comments.serializers import CommentSerializer
host = 'http://127.0.0.1:8000'
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'
    def to_representation(self, instance):
        repre = super().to_representation(instance)
        reldatetime = timezone.datetime.fromisoformat(repre['releaseDate']).replace(tzinfo=None)
        reldate = reldatetime.date()
        reltime = reldatetime.time()
        thepresent = timezone.localtime().replace(tzinfo=None)
        # print(duedate, duetime, reldate, reltime)
        repre['releaseDate'] = reldate.isoformat()
        repre['releaseTime'] = ':'.join(reltime.isoformat().split(':')[:-1])
        
        del repre['course']
        repre['comments'] = CommentSerializer(instance.comments, many=True).data
        if(repre['files']!=None):
            repre['hasfiles']=True
            repre['files'] = {
                'name':repre['files'].split('/')[-1],
                'url':host + repre['files']
            }
        return repre
