from collections import OrderedDict
from django.db.models.fields import CharField
from posts.models import Comment, Post
from courses.models import UserProfile, Course, User
from rest_framework import serializers
from django.utils import timezone
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
    def to_representation(self, instance):
        repre = super().to_representation(instance)
        reldate = timezone.datetime.fromisoformat(repre['datemade'])
        # repre['acceptSubmission'] = (duedate>timezone.localtime().replace(tzinfo=None))and(reldate<=timezone.localtime().replace(tzinfo=None))
        
        repre['datemade'] = reldate.replace(tzinfo=None).isoformat()
        # print(type(repre['replies']))
        arr = []
        repre['authorid'] = UserProfile.objects.get(id=repre['author']).userID
        repre['author'] = UserProfile.objects.get(id=repre['author']).user.username
        for replyid in repre['replies']:
            arr.append(Comment.objects.get(id=replyid))
        repre['replies'] = CommentSerializer(arr, many=True).data
        repre['datemade'] = reldate.date().isoformat()+', '+":".join(reldate.time().isoformat().split(':')[:-1])
        repre['commenting'] = False
        repre['replyable'] = True
        return repre