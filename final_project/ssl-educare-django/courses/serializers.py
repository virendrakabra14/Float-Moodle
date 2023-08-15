from collections import OrderedDict
from django.db.models.fields import CharField
from courses.models import UserProfile, Course, User
from rest_framework import serializers
from assignments.models import Assignment
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
    def to_representation(self, instance):
        repre = super().to_representation(instance)
        temp = instance.user
        # print(temp)
        userobj = User.objects.get(username=temp)
        repre['username'] = userobj.username
        repre['email'] = userobj.email
        repre:OrderedDict
        userobj:User
        repre['DOB'] = userobj.date_joined.isoformat().split('T')[0]
        print(repre['DOB'])
        del repre['user']
        del repre['id']
        # print(repre.items())
        # print(userobj)
        return repre
class CourseSerializer(serializers.ModelSerializer):
    instructors = serializers.PrimaryKeyRelatedField(many=True,read_only=True)
    class Meta:
        model = Course
        fields = '__all__'
    def to_representation(self, instance):
        repre = super().to_representation(instance)
        # print(list(instance.students.all()))
        temp = instance.instructors.all()
        arr = []
        for upro in temp:
            arr.append(upro.__str__())
        # print(arr)
        repre['instructors'] = arr
        arr = []
        studs = instance.students.all()
        for upro in studs:
            arr.append(upro.__str__())
        repre['students'] = arr
        arr = []
        for wizcard in instance.wizardcards.all():
            arr.append({wizcard.wizard.__str__():wizcard.level})
        # print(arr)
        repre['wizardcards'] = arr

        return repre