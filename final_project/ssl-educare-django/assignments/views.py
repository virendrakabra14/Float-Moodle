from functools import partial
import os
import threading, subprocess
from django.contrib.auth.models import User
from django.core.checks.messages import Error
from django.db.models.fields import DateTimeField
from django.db.models.fields.related import ManyToManyField
from django.http import request
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
# from .serializers import CourseSerializer, UserProfileSerializer
from assignments.models import Assignment
from assignments.serializers import AssignmentSerializer, SubmissionSerializer
from courses.models import UserProfile, Course
from courses.serializers import CourseSerializer
import json
import datetime
from assignments.models import Submission
import zipfile
import shutil

from courses.views import TodoData
def zipFileList(zipname,filepaths):
    zipf = zipfile.ZipFile('media/'+zipname, 'w')
    for path in filepaths:
        zipf.write(path)
    zipf.close()
    return '/media/'+zipname
class workData(APIView):
    def updatePublished(course:Course):
        tasks = Assignment.objects.filter(course=course, published=False)
        # tasks:Assignment[2]
        for task in tasks:
            task:Assignment
            reldatetime = timezone.datetime.fromisoformat(task.releaseDate.isoformat())
            if(reldatetime.utcoffset().total_seconds()==0):
                reldatetime = timezone.datetime.astimezone(reldatetime)
            thepresent = timezone.localtime().replace(tzinfo=None)
            if(thepresent>reldatetime.replace(tzinfo=None)):
                task.published = True
                task.sendPublishMail()
                print("to be published", task)
            task.save()
    def get(self, req, courseid, role, num=None):
        response = ""
        try:
            course = Course.objects.get(courseID=courseid)
            workData.updatePublished(course)
            if(num!=None):
                print(num)
                try:
                    assignment = Assignment.objects.get(course = course, number=num)
                    if((not assignment.published) and (not (role=='instructor'))):
                        assignment.instruction = "To be released."
                        assignment.title = "The world might never know."
                        assignment.files = "MI6-Classified"
                    response = AssignmentSerializer(assignment).data
                except ObjectDoesNotExist:
                    response = "ENUM_DNE"
            else:
                print(role)
                assignments = Assignment.objects.filter(course=course)
                for assignment in assignments:
                    if((not assignment.published) and (not (role=='instructor'))):
                        assignment.instruction = "To be released."
                        assignment.title = "The world might never know."
                        assignment.files = "MI6-Classified"
                response = AssignmentSerializer(assignments, many=True).data
            # print(assignments)

        except ObjectDoesNotExist:
            print("Course_DNE")
            response = "Course_DNE"
        return Response(response)

    def post(self, req, userid,courseid,num=None):
        response = ""
        course = ""; author=""
        try:
            course = Course.objects.get(courseID = courseid)
            author = UserProfile.objects.get(userID=userid)
        except ObjectDoesNotExist:
            response = "Course_DNE"
            print(response)
        # print(json.loads(req.data['data']))
        
        hasfile = False
        if(req.data.__contains__('file')):
            hasfile = True
            # print(.read().decode())
        data = json.loads(req.data['data'])
        if(num==None):
        # data = json.loads(req.body.decode())['params']['updates'][0]['value']
            anum = len(Assignment.objects.filter(course = course))
            print("Assigning num: ",anum)
            if(data['releaseTaskNow']):
                print("releaseTaskNow")
                data['releaseDate'] = timezone.localtime()
            else:
                data['releaseTaskNow']=False
                data['releaseDate'] = timezone.datetime.fromisoformat(data['releaseDate']).astimezone()
            data['dueDate'] = timezone.datetime.fromisoformat(data['dueDate']).astimezone()
            data:dict
            hasweight = False
            if(data['weight']!=''):
                hasweight = True
            print(data)
            # try:
            newtask = Assignment.objects.create(course=course,
                                    number=anum,
                                    title=data['title'],
                                    instruction=data['instruction'],
                                    releaseDate=data['releaseDate'],
                                    dueDate = data['dueDate'],
                                    published=data['releaseTaskNow'])
            newtask:Assignment
            newtask.author.add(author)
            if(hasfile):
                newtask.files = req.data['file']
                print("saved file")
                newtask.save()
            if(hasweight):
                newtask.weight = data['weight']
                newtask.save()
            # print(a.choices)
            for upro in course.students.all():
                Submission.objects.create(assignment=newtask, student=upro)

            if(data['releaseTaskNow']==True):
                newtask.sendPublishMail()
        else:
            ##update details request/delete request
            task = Assignment.objects.get(course=course,number=num)
            task:Assignment
            data:dict
            keys = data.keys()
            if(keys.__contains__('releaseGrades')):
                if(data['releaseGrades']):
                    response = TodoData.getUngradedAssignments([course],task)
                    if(response==[]):
                        task.graded = data['releaseGrades']
                        task:Assignment
                        task.sendGradesOutMail()
                    else:
                        #frontend takes care of this based on response.
                        pass
                else:
                    task.graded = data['releaseGrades']
            if(keys.__contains__('title')):
                task.title = data['title']
            if(keys.__contains__('instruction')):
                task.instruction = data['instruction']
            if(hasfile):
                task.files = req.data['file']
            if(keys.__contains__('releaseDate')):
                # print(timezone.datetime.fromisoformat(data['releaseDate']).astimezone())
                task.releaseDate=timezone.datetime.fromisoformat(data['releaseDate']).astimezone()
                if(task.releaseDate.replace(tzinfo=None)>timezone.localtime().replace(tzinfo=None)):
                    task.published = False
            if(keys.__contains__('dueDate')):
                task.dueDate=timezone.datetime.fromisoformat(data['dueDate']).astimezone()
            if(keys.__contains__('weight')):
                task.weight = data['weight']
            task.save()
            if(keys.__contains__('delete')):
                task.delete()
        return Response(AssignmentSerializer(Assignment.objects.filter(course=course),many=True).data)

class submissionData(APIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    
    def pythonGrader(script:bytes, submdir:str, task:Assignment, grader:UserProfile):
        ##the command 'python' may be 'python3' etc. depending on server specs
        executor = 'python'
        proc = subprocess.Popen('python',
                                stdout=subprocess.PIPE,
                                stdin=subprocess.PIPE,
                                stderr=subprocess.STDOUT,
                                cwd=os.getcwd() + submdir[1:])
        out = proc.communicate(input=script)[0]
        try:
            submissionData.parseFeedback(json.loads(out.decode()), task)
            grader.sendGraderSuccessMail(out.decode(), executor, task)
        except:
            grader.sendGraderFailMail(out.decode(), executor, task)

    def shellGrader(script:bytes, submdir:str, task:Assignment, grader:UserProfile):
        executor = 'shell'
        proc = subprocess.Popen(['/bin/bash'], stdin=subprocess.PIPE, stdout=subprocess.PIPE,cwd=os.getcwd() + submdir[1:])
        out = proc.communicate(input=script)[0]
        try:
            submissionData.parseFeedback(json.loads(out.decode()), task)
            grader.sendGraderSuccessMail(out.decode(), executor, task)
        except:
            grader.sendGraderFailMail(out.decode(), executor, task)

    executors = {
        'py':pythonGrader,
        'sh':shellGrader
        }
    def maptoExecutor(file,submdir, task, grader):
        ext = file.name.split('.')[-1]
        if(submissionData.executors.__contains__(ext)):
            threading.Thread(target=partial(submissionData.executors[ext], file.read(), submdir, task, grader)).start()
            return "S"
        else:
            return "E"
    def get(self, request, courseid, num, userid=None):
        response = "Unset"
        course = Course.objects.get(courseID = courseid)
        task = Assignment.objects.get(course = course, number=num)
        if(userid!=None):
            # if()
            # try:
                upro = UserProfile.objects.get(userID=userid)
                submission= Submission.objects.get(assignment=task, student=upro)
                if(submission.assignment.published):
                    submission.readAssignment = True
                    submission.save()
                response = SubmissionSerializer(submission).data
            # except:
            #     response = "Student_DNE"
        else:
            print("Here")
            metadat = {
                'Number of Submissions':0
            }
            files = []
            submissions = Submission.objects.filter(assignment = task)
            for subm in submissions:
                if(subm.files!=''):
                    files.append('media/'+subm.files.__str__())
                    metadat['Number of Submissions']+=1
                    dataser = SubmissionSerializer(subm).data
                    print(dataser)
                    metadat[subm.student.__str__()] = {
                        'time':dataser['time'],
                        'comments':dataser['comments'],
                    }
            # zippath = zipFileList(f'submissions_{courseid}_{num}_{timezone.now().strftime("%m_%d_%H_%M_%S")}.zip', files)
            zippath = f'media/submissions_{courseid}_{num}_{timezone.now().strftime("%m_%d_%H_%M_%S")}'
            zipdir = f'media/{courseid}/assignments/{num}/submissions/'
            metafilepath = zipdir+f'meta_{courseid}_{num}_{timezone.now().strftime("%m_%d_%H_%M_%S")}.txt'
            ftemp = open(metafilepath, 'w')
            ftemp.write("{" + "\n".join("{!r}: {!r},".format(k, v) for k, v in metadat.items()) + "}")
            ftemp.close()
            shutil.make_archive(zippath, 'zip', zipdir)
            os.remove(metafilepath)
            metadat['zippath'] = zippath
            response = {
                'zippath':'/'+zippath + '.zip'
            }
        return Response(response)
    def parseFeedback(feedbacks, task):
        response = {}
        for userid in feedbacks:
            print(type(feedbacks[userid]))
            print(feedbacks[userid]['feedback'])
            response['NE_users'] = []; response['NE_students'] = []
            try:
                upro = UserProfile.objects.get(userID=userid)
                try:
                    submobj = Submission.objects.get(student=upro, assignment=task)
                except:
                    response['NE_students'].append(userid)
            except:
                response['NE_users'].append(userid)
            submobj.grade = float(feedbacks[userid]['grade'])
            submobj.feedback = feedbacks[userid]['feedback']
            submobj.save()
        return response
    def post(self, request:HttpRequest, courseid, num, userid=None):
        course = Course.objects.get(courseID = courseid)
        task = Assignment.objects.get(course = course, number = num)    
        if(userid!=None):
            #userid => request is to make a submission
            if(not AssignmentSerializer(task).data['acceptSubmission']):
                return Response("Deadline passed")
            file = request.data['file']
            upro = UserProfile.objects.get(userID=userid)  
            subm, created = Submission.objects.get_or_create(assignment=task, student=upro)
            subm:Submission
            subm.readAssignment = True
            subm.files = file
            subm.time = timezone.now()
            subm.feedback = "Not Graded Yet"
            print(timezone.now())
            subm.save()
            subm.sendConfirmationMail()
        else:
            #no userid in url=>request is to submit grader file
            request:HttpRequest
            response = {}
            file = request.data['file']
            gradertype = request.data['type']
            grader = UserProfile.objects.get(userID=request.data['graderID'])
            submdir = './media/'+courseid+'/assignments/'+str(num)+'/submissions/'
            if(gradertype=='auto'):
                if(submissionData.maptoExecutor(file, submdir, task, grader)=="E"):
                    response['msg'] = f"Script Extension not supported. We support {list(submissionData.executors.keys())}"
                else:
                    response['msg'] = f"The Autograder has accepted your script! The output will be mailed to you."
            elif(gradertype=='manual'):
                content = file.read().decode()
                try:
                    feedbacks = json.loads(content)
                    response['msg'] = ''
                    response.update(submissionData.parseFeedback(feedbacks, task))
                except:
                    response['msg'] = 'Invalid feedback format. Please check your mail for the guidelines.'
                    response['NE_users'] = []
                    response['NE_students'] = []
                    grader:UserProfile
                    grader.sendFeedbackFormatMail(course)
        # .split(b'---WebKit')[1]
        return Response(response)

class GradesData(APIView):
    def getMeanAndVariance(gradedScores:list):
        mean = sum(gradedScores)/max(len(gradedScores),1)
        var = (sum(map(lambda x:(x-mean)**2,gradedScores)))/max(len(gradedScores),1)
        return round(mean,2),round(var,2)
    def getRankList(course, task=None):
        response= []
        if(task!=None):
            for user in course.students.all():
                subm = Submission.objects.get(assignment=task,student=user)
                if(subm.files!=None and subm.files!=''):
                    grade = subm.grade
                    response.append({str(user):grade})
                else:
                    response.append({str(user):-2})
            response = sorted(response, key=lambda x: -list(x.values())[0])
            for x in response:
                if(list(x.values())[0]==-1):
                    x[list(x.keys())[0]] = 'NG'
                if(list(x.values())[0]==-2):
                    x[list(x.keys())[0]] = 'NS'
        else:
            for user in course.students.all():
                response.append({str(user):GradesData.getCumulativeScore(course, user)})
            response = sorted(response, key=lambda x: -list(x.values())[0])
        return response
    def responseForTaskGrades(task:Assignment,course:Course,userpro:UserProfile):
        if(not task.graded):
            return {'task':str(task.number)+':'+task.title, 'Graded':False}
        gradedScores = []
        subms = Submission.objects.filter(assignment=task)
        for subm in subms:
            if(subm.grade!=-1):
                gradedScores.append(subm.grade)
        mean,var = GradesData.getMeanAndVariance(gradedScores)
        weight = task.weight
        if(weight==None):
            weight = 'NA'
        response = {'task':str(task.number)+':'+task.title, 'number':task.number,'Graded':True,'meanscore':mean, 'variance':var,'weight':weight}
        if(userpro in (course.students.all())):
            subm = Submission.objects.get(assignment=task,student=userpro)
            if(task.weight==None):
                task.weight = 0
            if(subm.grade!=-1):
                response['score'] = subm.grade
            else:
                response['score'] = 'TBA'
        elif(userpro in (course.instructors.all())):
            response['rankList'] = GradesData.getRankList(course, task)
        return response
    
    def getCumulativeScore(course:Course,student:UserProfile):
        cumulscore = 0;cumulweight = 0
        tasks = Assignment.objects.filter(course=course, graded=True)
        for task in tasks:
            if(task.weight!=None and task.weight>0):
                
                try:
                    subm = Submission.objects.get(assignment=task,student=student)
                    if(subm.files!=None and subm.files!=''):
                        cumulscore+=subm.grade*task.weight; cumulweight+=task.weight
                except ObjectDoesNotExist:
                    print(student,task)
                
        cumulscore /=max(cumulweight,1)
        return round(cumulscore,2)
    def responseForCourseGrades(course:Course, userpro:UserProfile):
        response = {}
        cumulscores = []
        for user in course.students.all():
            cumulscores.append(GradesData.getCumulativeScore(course,user))
        response['meanscore'],response['variance'] = GradesData.getMeanAndVariance(cumulscores)
        if(userpro in course.students.all()):
            # try:
            response.update({'cumulScore':GradesData.getCumulativeScore(course,userpro)})

        elif(userpro in course.instructors.all()):
            response['rankList'] = GradesData.getRankList(course)
        return response
    def get(self, request,userid,courseid,num=None):
        userpro = UserProfile.objects.get(userID=userid)
        course = Course.objects.get(courseID=courseid)
        tasks = Assignment.objects.filter(course=course)
        response = {
            'taskGrades':[],
            'courseGrades':[]#becomes a dictionary if student calls the request.
        }
        courseRankList = []
        if(num==None):
            for task in tasks:
                if(task.published):
                    response['taskGrades'].append(GradesData.responseForTaskGrades(task,course,userpro))
            response['courseGrades'] = GradesData.responseForCourseGrades(course,userpro)
        else:
            task = Assignment.objects.get(course=course,number=num)
            response = GradesData.responseForTaskGrades(task,course,userpro)
        return Response(response)
    def post(self,request,courseid):
        pass