from django.contrib import admin
from django.urls import path, include
from . import views
urlpatterns = [
    path('<str:courseid>/<str:userid>/create/', views.postData.as_view(), name='create'),
    path('<str:courseid>/<str:userid>/<int:num>/update/', views.postData.as_view(), name='update'),
    path('<str:courseid>/all/<str:role>/', views.postData.as_view(), name='allwork'),
    path('<str:courseid>/<int:num>/<str:role>/', views.postData.as_view(), name='allwork'),
    
]
