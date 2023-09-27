from django.urls import path
from . import views

urlpatterns = [
    path('', views.send_the_homepage),
    path('signup/', views.sign_up),
    path('login/', views.log_in),
    path('logout/', views.log_out),
    path('whoami/', views.who_am_i),
    path('find_birds/<str:bird_name>', views.find_birds),
    path('geolocate/', views.geolocate),
    path('confirm_bird/', views.confirm_bird),
    path('get_users_birds/', views.get_users_birds),
    path('delete_birds/', views.delete_birds),
    path('update_user_coords/', views.update_user_coords),
]
