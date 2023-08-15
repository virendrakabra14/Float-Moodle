from time import time
from django.contrib.auth.models import User
from django.db.models.fields.related import ManyToManyField
from django.http import request
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response

from assignments.models import Assignment, Submission
from assignments.serializers import SubmissionSerializer
from .serializers import CourseSerializer, UserProfileSerializer
from rest_framework import serializers, status
from courses.models import UserProfile, Course, WizardCard
import json
from django.utils import timezone
from django.utils.html import format_html
from django.template.loader import render_to_string
class Templates:
    frontEnd = 'http://localhost:4200/'
    templates = {
        'NC':'newcourse.html',
        'NT':'newtask.html',
        'GO':'gradesout.html',
        'NP':'newpost.html',
        'pythonfail':'pythonFail.html',
        'pythonsuccess':'pythonSuccess.html',
        'otp':'otp.html',
        'submission':'submission.html',
        'FF':'feedbackformat.html',
        'shellfail':'shellFail.html',
        'shellsuccess':'shellSuccess.html'
    }
    subjects = {
        'NC':lambda params:('{code}:Welcome 🤝 to {code}'.format(**params)),
        'NT':lambda params:('{code}:Assignment 📝 {number} published!'.format(**params)),
        'GO':lambda params: ('{code}:Grades ✅ for Assignment {number} out!'.format(**params)),
        'NP':lambda params: ('{code}:New 🚩 Post! from {author}'.format(**params)),
        'pythonfail':lambda params:('{code}:AutoGrader Failure❌ for Assignment {number}!'.format(**params)),
        'pythonsuccess':lambda params:('{code}:AutoGrader Successful ✔ for Assignment {number}!'.format(**params)),
        'otp':lambda params:('OTP 🔑 Requested for {username}'.format(**params)),
        'submission':lambda params:('{code}:Submission 📄 received for Assignment {number}'.format(**params)),
        'FF':lambda params:('{code}:Feedback File Guidlines'.format(**params)),
        'shellfail' : lambda params:('{code}:AutoGrader Failure❌ for Assignment {number}!'.format(**params)),
        'shellsuccess':lambda params:('{code}:AutoGrader Successful ✔ for Assignment {number}!'.format(**params)),
    }
    def getFrontEndLink(key,emailparams):
        if(key=='NT'or key=='GO'):
            return Templates.frontEnd+'assignments/'+emailparams['courseid']+'/'+str(emailparams['number']-1)+'/'
        if(key=='NP'):
            return Templates.frontEnd+'posts/' + emailparams['courseid'] + '/' + str(emailparams['number']-1)+'/'
    def getSubjectBody(key,params):
        subject = Templates.subjects[key](params)
        print("here2")
        return subject,render_to_string(Templates.templates[key], params)
class courseData(APIView):
    def get(self, request, role=None,courseid=None, userid=None):
        if(courseid!=None):
            if(courseid=='all'):
                courses = Course.objects.all()
                serializer = CourseSerializer(courses, many=True)
                return Response(serializer.data)
            else:
                try:
                    course = Course.objects.get(courseID=courseid)
                    ser = CourseSerializer(course)
                    data = ser.data
                except ObjectDoesNotExist:
                    data = ['Does Not Exist']
                return(Response(data))
        else:
            if(role=='student'):
                try:
                    # print(userid)
                    # userpro = UserProfile.objects.get(userID=userid)
                    courses = Course.objects.filter(students__userID=userid)
                    # print(courses)
                    ser = CourseSerializer(courses, many=True)
                    data = ser.data
                    userpro = UserProfile.objects.get(userID=userid)
                    for i,course in enumerate(courses):
                        progress = 0; totaltasks = 0
                        data[i]['new'] = "false"
                        for task in Assignment.objects.filter(course=course):
                            totaltasks+=1
                            subm = Submission.objects.get(student = userpro, assignment=task)
                            if(not (subm.files==''or subm.files==None)):
                                progress+=1
                            else:
                                print(subm.assignment.title)
                        data[i]['progress'] = round(100*progress/max([1,totaltasks]), 0)
                    
                except ObjectDoesNotExist:
                    data = 'Does Not Exist'
                return Response(data)
            elif(role=='instructor'):
                courses = Course.objects.filter(instructors__userID=userid)
                ser = CourseSerializer(courses, many=True)
                data = ser.data
                # if(data==[]):
                    # data = 'Does Not Exist'
                return(Response(data))
            elif(role=='wizard'):
                userobj = UserProfile.objects.get(userID=userid)
                courses = Course.objects.filter(wizardcards__wizard=userobj)
                data = CourseSerializer(courses, many=True).data
                return(Response(data))
    def post(self, request:HttpRequest, userid,courseid=None):
        if(courseid==None):
            #create request:
            creator = UserProfile.objects.get(userID=userid)
            emailparams = {}
            response = []
            data = json.loads(request.body.decode())['params']['updates'][0]['value']
            if(len(Course.objects.filter(courseID=data['courseID']))>0):return Response("Course Exists.")
            courseobj = Course.objects.create(courseName=data['name'], courseCode=data['code'], courseID=data['courseID'])
            roles = data['roles']
            emailparams = {
                'code':courseobj.courseCode,
                'role':'instructor👨‍🏫',
                'author':creator.user.username,
                'link':Templates.frontEnd
            }
            for prof in roles['instructors']:
                # try:
                    userpro = UserProfile.objects.get(userID=prof)
                    courseobj.instructors.add(userpro)
                    userpro:UserProfile
                    emailparams['username'] = userpro.user.username
                    userpro.asyncSendEmail(*Templates.getSubjectBody('NC', emailparams))
                # except:
                    # response.append(prof)
            emailparams['role'] = 'student👨‍🎓'
            for student in roles['students']:
                # try:
                    userpro = UserProfile.objects.get(userID=student)
                    courseobj.students.add(UserProfile.objects.get(userID=student))
                    emailparams['username'] = userpro.user.username
                    userpro.asyncSendEmail(*Templates.getSubjectBody('NC', emailparams))
                # except:
                    # response.append(student)
            emailparams['role'] = 'wizard🧙‍♂️'
            for wizard in roles['wizards']:
                # try:
                    userpro = UserProfile.objects.get(userID=wizard)
                    courseobj.wizardcards.add(WizardCard.objects.create(wizard=UserProfile.objects.get(userID=wizard)))
                    emailparams['username'] = userpro.user.username
                    userpro.asyncSendEmail(*Templates.getSubjectBody('NC', emailparams))
                # except:
                    # response.append(wizard)
            courseobj.save()
            return Response({'courseid':data['courseID'], 'errorids':response})
        # print(courseid)
        # print("Hi")
        #handles create request
        #handles add/rem request
        return Response("Success")
class memberData(APIView):
    def get(self, req, role, courseid):
        from assignments.views import GradesData
        from courses.models import UserProfile
        # from assi
        respjson = {}
        course = Course.objects.get(courseID=courseid)
        course:Course
        ranklist = {}
        for task in Assignment.objects.filter(course=course):
            key = 'A'+str(task.number+1)
            ranklist[key] = GradesData.getRankList(course, task)
        if(role=='students'or role=='members'):
            respjson['students'] = {}; 
            memberarr = []; memberDataarr = []
            for stu in course.students.all():
                memberarr.append({stu.__str__():0})
                memberDataarr.append({'userID':str(stu),
                                    'username':stu.user.username,
                                    'email':stu.user.email,
                                    'score':GradesData.getCumulativeScore(course, stu)})
                memberDataarr[-1]['taskGrades'] = []
                for key in ranklist.keys():
                    ranks = ranklist[key]
                    for rank in ranks:
                        if(list(rank.keys())[0]==str(stu)):
                            memberDataarr[-1]['taskGrades'].append({'name':key,
                                                                    'score':list(rank.values())[0]})
                    # if():
            respjson['students']['members'] = memberarr
            respjson['students']['memberdata'] = memberDataarr
        if(role=='wizards'or role=='members'):
            respjson['wizards'] = {}
            memberarr = [];memberDataarr = []
            for wizcard in course.wizardcards.all():
                memberarr.append({wizcard.wizard.__str__():wizcard.level})
                memberDataarr.append({'userID':str(wizcard.wizard),
                                        'email':wizcard.wizard.user.email,
                                        'username':wizcard.wizard.user.username})
            respjson['wizards']['members'] = memberarr
            respjson['wizards']['memberdata'] = memberDataarr
        if(role=='instructors' or role=='members'):
            memberarr = [];memberDataarr = []
            respjson['instructors'] = {}
            for prof in course.instructors.all():
                memberarr.append({prof.__str__():4})
                memberDataarr.append({'userID':str(prof),
                                    'email':prof.user.email,
                                    'username':prof.user.username})
            respjson['instructors']['members'] = memberarr
            respjson['instructors']['memberdata'] = memberDataarr
        return Response(respjson)
    def validateList(self,list):
        """Check existence of users
        check instersection"""
        return True
    def editMemberList(role,memberlist,course,memberField):
        deflevels = {'students':0,'wizards':1,'instructors':4}
        memberids = [list(obj.keys())[0] for obj in memberlist]
        respjson = {}
        respjson[role] = []
        respjson['errors'] = []
        for obj in memberlist:
            userid = list(obj.keys())[0]
            if(role=='wizards'):
                try:
                    userpro = UserProfile.objects.get(userID=userid)
                    if(len(memberField.filter(wizard__userID=userid))==0):
                    # memberField.add(WizardCard.objects.get_or_create())
                        wizcard = WizardCard.objects.create(wizard=userpro, level=obj[userid])
                        memberField.add(wizcard)
                    else:
                        card = memberField.get(wizard__userID=userid)
                        card.level = obj[userid]
                        card.save()
                except:
                    respjson['errors'].append(userid)
            elif(len(memberField.filter(userID=userid))==0):
                try:
                    userpro = UserProfile.objects.get(userID=userid)
                    memberField.add(userpro)
                    if(role=='students'):
                        tasks = Assignment.objects.filter(course=course)
                        for task in tasks:
                            if(len(Submission.objects.filter(assignment=task, student=userpro))==0):
                                Submission.objects.create(assignment=task, student = userpro)
                except Exception:
                    respjson['errors'].append(userid)

        if(role=='wizards'):
            for member in memberField.all():
                if(not memberids.__contains__(member.wizardID())):
                    memberField.remove(member)
                else:
                    # obj = json.loads("{"+member.__str__()+"}")
                    obj = {member.wizardID():int(member.__str__().split(':')[1])}
                    respjson[role].append(obj)
        else:
            for member in memberField.all():
                if(not memberids.__contains__(member.__str__())):
                    memberField.remove(member)
                    if(role=='students'):
                        tasks = Assignment.objects.filter(course=course)
                        for task in tasks:
                            Submission.objects.filter(student=member, assignment=task).delete()
                else:
                    respjson[role].append({member.__str__():deflevels[role]})
        course.save()
        return respjson['errors']
    def post(self, req:HttpRequest, courseid, role):
        course = Course.objects.get(courseID=courseid)
        respjson = {}
        memberlist = json.loads(req.body.decode())['params']['updates'][0]['value']
        if(not self.validateList(memberlist)):
            return Response("Changes Not Saved")
        # print(memberlist)
        if(role=='students'):
            respjson = memberData.editMemberList(role, memberlist, course, course.students)
        if(role=='wizards'):
            respjson = memberData.editMemberList(role, memberlist, course, course.wizardcards)
        if(role=='instructors'):
            respjson = memberData.editMemberList(role, memberlist, course, course.instructors)
        return Response(respjson)
class TodoData(APIView):

    def getUngradedAssignments(courses,singletask=None):
        items = []
        if(singletask==None):
            for course in courses:
                    tasks = Assignment.objects.filter(course=course)
                    for task in tasks:
                        duedatetime = timezone.datetime.fromisoformat(task.dueDate.isoformat())
                        if(duedatetime.utcoffset().total_seconds()==0):
                            duedatetime = timezone.datetime.astimezone(duedatetime)
                        thepresent = timezone.localtime().replace(tzinfo=None)
                        if(duedatetime.replace(tzinfo=None)<thepresent):
                            totsubms =len(Submission.objects.filter(assignment = task)) - len(Submission.objects.filter(assignment=task, files=''))
                            ungradedsubms = len(Submission.objects.filter(assignment=task,grade=-1))-len(Submission.objects.filter(assignment=task,grade=-1,files=''))
                            if(ungradedsubms>0):
                                items.append({
                                    'courseCode':course.courseCode,
                                    'courseID':course.courseID,
                                    'type':'Task',
                                    'number':task.number,
                                    'title':task.title,
                                    'dueDate':duedatetime.date().isoformat(),
                                    'leftToGrade':ungradedsubms,
                                    'totalSubmissions':totsubms
                                })
        else:
            task = singletask
            course = courses[0]
            duedatetime = timezone.datetime.fromisoformat(task.dueDate.isoformat())
            if(duedatetime.utcoffset().total_seconds()==0):
                duedatetime = timezone.datetime.astimezone(duedatetime)
            thepresent = timezone.localtime().replace(tzinfo=None)
            if(duedatetime.replace(tzinfo=None)<thepresent):
                totsubms =len(Submission.objects.filter(assignment = task)) - len(Submission.objects.filter(assignment=task, files=''))
                ungradedsubms = len(Submission.objects.filter(assignment=task,grade=-1))-len(Submission.objects.filter(assignment=task,grade=-1,files=''))
                if(ungradedsubms>0):
                    items.append({
                        'courseCode':course.courseCode,
                        'courseID':course.courseID,
                        'type':'Task',
                        'number':task.number,
                        'title':task.title,
                        'dueDate':duedatetime.date().isoformat(),
                        'leftToGrade':ungradedsubms,
                        'totalSubmissions':totsubms
                    })
            else:
                items.append('Not yet due.')
        return items
    def get(self, request, userid, role):
        items = []
        user = UserProfile.objects.get(userID=userid)
        if(role=='student'):
            courses = Course.objects.filter(students__userID=userid)
            for course in courses:
                tasks = Assignment.objects.filter(course=course)
                for task in tasks:
                    numNotDone = len(Submission.objects.filter(assignment=task,files=""))
                    peerProgress = 100*(len(Submission.objects.filter(assignment=task))-numNotDone)/max(1,len(Submission.objects.filter(assignment=task)))
                    reldatetime = timezone.datetime.fromisoformat(task.releaseDate.isoformat())
                    if(reldatetime.utcoffset().total_seconds()==0):
                        reldatetime = timezone.datetime.astimezone(reldatetime)
                    duedatetime = timezone.datetime.fromisoformat(task.dueDate.isoformat())
                    if(duedatetime.utcoffset().total_seconds()==0):
                        duedatetime = timezone.datetime.astimezone(duedatetime)
                    thepresent = timezone.localtime().replace(tzinfo=None)
                    if(duedatetime.replace(tzinfo=None)>thepresent and reldatetime.replace(tzinfo=None)<=thepresent):
                        subm = Submission.objects.get(assignment = task, student=user)
                        if(str(subm.files)==""):
                            items.append({
                                'courseCode':course.courseCode,
                                'courseID':course.courseID,
                                'type':'Task',
                                'number':task.number,
                                'title':task.title,
                                'dueDate':duedatetime.date().isoformat(),
                                'dueTime':duedatetime.time().isoformat()[:-3],
                                'peerProgress':round(peerProgress, 0),
                            })
        elif(role=='instructor'):
            courses = Course.objects.filter(instructors__userID=userid)
            items.extend(TodoData.getUngradedAssignments(courses))
        elif(role=='wizard'):
            courses = Course.objects.filter(wizardcards__wizard=user)
            items.extend(TodoData.getUngradedAssignments(courses))
        return Response(items)