from django.urls import path
from . import views

urlpatterns = [
    path('', views.send_the_homepage),
    path('signup/', views.sign_up),
    path('login/', views.log_in),
    path('logout/', views.log_out),
    path('whoami/', views.who_am_i),
    path('xeno-canto-api/', views.xeno_canto_api),
    # path('geolocate/', views.geolocate),
]
