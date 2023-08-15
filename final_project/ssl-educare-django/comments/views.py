from django.core.checks.messages import Error
from django.http import request
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response
# from .serializers import CourseSerializer, UserProfileSerializer
from rest_framework import serializers, status
from posts.models import Comment, Post
from posts.serializers import CommentSerializer, PostSerializer
from courses.models import UserProfile, Course
from assignments.models import Submission, Assignment
import json
import datetime
from django.utils import timezone
from django.shortcuts import render

# Create your views here.
class CommentMaker(APIView):
    def get(self, request, courseid, num, cid):
        Comment.objects.get(id=cid).delete()
        return Response("success")
    def post(self, request,courseid, num):
        data = json.loads(request.body.decode())['params']['updates'][0]['value']
        course = Course.objects.get(courseID=data['courseid'])
        targetfield = "to be changed below"
        author = UserProfile.objects.get(userID=data['authorid'])
        datemade = timezone.localtime()
        print(data)
        if(data['parent']=="Post"):
            post = Post.objects.get(id = data['parentid'])
            targetfield = post.comments
        elif(data['parent']=='Submission'):
            # task = Assignment.objects.get(course = course, number = )
            subm = Submission.objects.get(id=data['parentid'])
            targetfield = subm.comments
        elif(data['parent']=="Comment"):
            toComment = Comment.objects.get(id = data['parentid'])
            targetfield = toComment.replies
        targetfield.add(Comment.objects.create(author=author,datemade=datemade,text=data['text']))

        return Response(CommentSerializer(targetfield, many=True).data)