from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('<str:courseid>/all/<str:role>/', views.workData.as_view(), name='allwork'),
    path('<str:courseid>/<str:userid>/create/', views.workData.as_view(), name='create'),
    path('<str:courseid>/<str:userid>/<int:num>/update/', views.workData.as_view(), name='update'),
    path('<str:courseid>/<int:num>/<str:role>/', views.workData.as_view(), name='enum_work'),
    path('<str:courseid>/<int:num>/submissions/all/', views.submissionData.as_view(), name='allsubm'),
    path('<str:courseid>/<int:num>/submissions/<str:userid>/', views.submissionData.as_view(), name='submbyuser'),
    path('<str:courseid>/<int:num>/submissions/<str:userid>/submit/', views.submissionData.as_view(), name='submit'),
    path('<str:courseid>/<int:num>/submissions/grader/upload/', views.submissionData.as_view(), name='feedback'),
    path('grades/<str:courseid>/<str:userid>/all/', views.GradesData.as_view(), name='grades_alltasks'),
    path('grades/<str:courseid>/<str:userid>/<int:num>/', views.GradesData.as_view(), name='gradestat_bytask'),
    # path('grades/<str:courseid>/<str:userid>/', views.GradesData.as_view(), name='feedback'),
]
