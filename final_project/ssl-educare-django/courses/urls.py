from django.contrib import admin
from django.urls import path, include
from . import views
urlpatterns = [
    path('byuser/<str:role>/<str:userid>/', views.courseData.as_view(), name="usercourses"),
    path('byuser/<str:role>/<str:userid>/todo/', views.TodoData.as_view(), name="todo"),
    path('create/<str:userid>/', views.courseData.as_view()),
    path('<str:courseid>/', views.courseData.as_view(), name="coursebyid"),
    path('<str:courseid>/<str:role>/', views.memberData.as_view(), name="coursebyid"),
]
