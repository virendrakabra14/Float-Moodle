import datetime
from django.http import request
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from rest_framework.utils import serializer_helpers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers, status
from courses.models import OTPToken, UserProfile,User
from courses.serializers import UserProfileSerializer
from django.core.exceptions import ObjectDoesNotExist
from courses import serializers as sre
import json
import secrets
class userCreate(APIView):
    def get(self, request):
        pass
    def post(self, request):
        response = ""
        userdata = json.loads(request.body.decode())['params']['updates'][0]['value']
        print(userdata)
        username = userdata['username']
        userid = userdata['userid']
        password = userdata['password']
        #regex check for userid
        users = UserProfile.objects.filter(userID=userid)
        if(len(users)!=0):
            response = "User Exists in Database"
        else:
            user:User
            user = User.objects.create(username=username)
            user.set_password(password)
            user.save()
            profile = UserProfile.objects.create(user=user, userID=userid)
            profile.save()
            response = sre.UserProfileSerializer(profile).data
        return Response(response)
class userData(APIView):
    def get(self, request, userid):
        response = ""
        if(userid!='all'):
            user = UserProfile.objects.get(userID=userid)
            ser = UserProfileSerializer(user,many=False)
            response = ser.data
        else:
            response = UserProfileSerializer(UserProfile.objects.all(), many=True).data
        return Response(response)
    def post(self, request, userid):
        response = ""
        #can be used for edit profile and for changepassword
        userpro = UserProfile.objects.get(userID=userid)
        data = json.loads(request.body.decode())["params"]['updates'][0]
        print(data)
        if(data['param']=='pwdata'):
            
            user = userpro.user
            user:User
            pws = data['value']
            print(pws)
            otp = pws['otp']
            print('Rec otp', otp)
            tokens = OTPToken.objects.filter(otp=otp)
            if(len(tokens)==1 and tokens[0].users.all()[0]==userpro and tokens[0].purpose=='changepw'):
                if(user.check_password(pws['currpw'])):
                    #check if newpw satisfy any reqs.
                    user.set_password(pws['newpw1'])
                    user.save()
                    tokens.delete()
                    response = "success"
                else:
                    response = "Current Password is Wrong"
            else:
                response = "OTP is wrong"
        else:
            #assuming data['param']=='profiledata'
            user = userpro.user
            details = data['value']
            if(user.check_password(details['password'])):
                user.username = details['username']
                user.email = details['email']
                user.date_joined = datetime.date.fromisoformat(details['DOB'])
                ##date_joined is used as dob. date_joined_the_world
                user.save()
                response = "editsuccess"
            else:
                response = "Wrong_PW"
            print(data['value'])
            
        return Response(response)
        pass#to be programmed alongside service file in ng
class userAuth(APIView):
    def get(self,request,userid):
        otp =  secrets.token_hex(6)
        userpro = UserProfile.objects.get(userID=userid)
        userpro:UserProfile
        token = OTPToken.objects.create(purpose='changepw', otp=otp)
        token.users.add(userpro)
        token.save()
        userpro.sendOTPMail(token, 'changing your password')
        token:OTPToken
        token.setToSelfdestruct()
        return Response(token.timeout)
    def post(self, request):
        data = json.loads(request.body.decode())["params"]['updates']
        userid = data[0]['value']
        password = data[1]['value']
        print(userid, password)
        response = "uncaught"
        try:
            userpro = UserProfile.objects.get(userID=userid)
            print(userpro.user.username)
            if(userpro.user.check_password(password)):
                response = sre.UserProfileSerializer(userpro).data
            else:
                response = "Wrong_Password"
                print("wp")
        except ObjectDoesNotExist:
            response = "User_DNE"
            print("User DNE")
        return Response(response)