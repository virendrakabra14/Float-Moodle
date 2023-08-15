from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from . import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/create/', views.userCreate.as_view(), name="create"),
    path('users/auth/', views.userAuth.as_view(), name="auth"),
    path('users/<str:userid>/otpmail/', views.userAuth.as_view(), name="OTPMail"),
    path('users/<str:userid>/changepw/', views.userData.as_view(), name="changepw"),
    path('users/<str:userid>/editprofile/', views.userData.as_view(), name="editprofile"),    
    path('users/<str:userid>/', views.userData.as_view(), name="data"),
    path('courses/', include('courses.urls'), name="courses_redirect"),
    path('assignments/', include('assignments.urls'), name='assignments_redirect'),
    path('posts/', include('posts.urls'), name='posts_redirect'),
    path('comments/', include('comments.urls'), name='comments_redirect')
]
urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)