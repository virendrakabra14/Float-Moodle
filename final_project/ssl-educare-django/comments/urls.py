from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from . import views
urlpatterns = [
    path('<str:courseid>/<int:num>/', views.CommentMaker.as_view(), name='comments'),
    path('<str:courseid>/<int:num>/<int:cid>/delete/', views.CommentMaker.as_view(), name='comments')
]
urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)