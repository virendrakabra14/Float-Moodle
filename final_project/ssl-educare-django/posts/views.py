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
import json
import datetime
from django.utils import timezone
class postData(APIView):
    def updatePublished(course:Course):
        posts = Post.objects.filter(course=course, published=False)
        print(posts)
        for post in posts:
            post:Post
            print(post.releaseDate)
            reldatetime = timezone.datetime.fromisoformat(post.releaseDate.isoformat())
            if(reldatetime.utcoffset().total_seconds()==0):
                reldatetime = timezone.datetime.astimezone(reldatetime)
            thepresent = timezone.localtime().replace(tzinfo=None)
            if(thepresent>reldatetime.replace(tzinfo=None)):
                post.published = True
                post.sendPublishMail()
            post.save()
    def get(self, request,courseid, role,num=None):
        response = ""
        try:
            course = Course.objects.get(courseID=courseid)
            postData.updatePublished(course)
            if(num!=None):
                try:
                    post = Post.objects.get(course=course, number=num)
                    # print(post)
                    if((not post.published) and (not (role=='instructor'))):
                        post.instruction = "To be released"
                        post.title = "The world might never know."
                        post.files = "MI6-Classified"
                    response = PostSerializer(post).data
                except ObjectDoesNotExist:
                    response = "ENUM_DNE"
            else:
                posts = Post.objects.filter(course=course)
                for post in posts:
                    if((not post.published) and (not (role=='instructor'))):
                        post.instruction = "To be released"
                        post.title = "The world might never know."
                        post.files = "MI6-Classified"
                response = PostSerializer(posts, many=True).data
        except ObjectDoesNotExist:
            response = "Course_DNE"
        return Response(response)
    def post(self, request, userid, courseid,num=None):
        response = ""
        try:
            course = Course.objects.get(courseID = courseid)
            author = UserProfile.objects.get(userID=userid)
        except ObjectDoesNotExist:
            response = "Course_DNE"
            print(response)
        hasFile = False
        if(request.data.__contains__('file')):
            hasFile = True
        data = json.loads(request.data['data'])
        if(num==None):
            anum = len(Post.objects.filter(course = course))
            print("assigning num:", anum)
            print(data)
            if(data['releasePostNow']):
                data['releaseDate'] = timezone.localtime()
            else:
                data['releaseDate'] = timezone.datetime.fromisoformat(data['releaseDate']).astimezone()
                data['releasePostNow'] = False
            print(data)
            newpost = Post.objects.create(course=course,
                                    number=anum,
                                    title=data['title'],
                                    instruction=data['instruction'],
                                    releaseDate=data['releaseDate'],
                                    published=data['releasePostNow'])
            newpost.author.add(author)
            if(hasFile):
                newpost.files = request.data['file']
                newpost.save()
            if(data['releasePostNow']==True):
                newpost:Post; newpost.sendPublishMail()
        else:
            post = Post.objects.get(course=course,number=num)
            post:Post
            data:dict
            print(data)
            keys = data.keys()
            if(keys.__contains__('discussable')):
                post.discussable = data['discussable']
            if(keys.__contains__('title')):
                post.title = data['title']
            if(keys.__contains__('instruction')):
                post.instruction = data['instruction']
            if(hasFile):
                post.files = request.data['file']
            if(keys.__contains__('releaseDate')):
                print(timezone.datetime.fromisoformat(data['releaseDate']))
                post.releaseDate=timezone.datetime.fromisoformat(data['releaseDate'])
                if(post.releaseDate.replace(tzinfo=None)>timezone.localtime().replace(tzinfo=None)):
                    post.published = False
            post.save()
            if(keys.__contains__('delete')):
                print('Deleteing: ')
                post.delete()
        return Response(PostSerializer(Post.objects.filter(course=course),many=True).data)
