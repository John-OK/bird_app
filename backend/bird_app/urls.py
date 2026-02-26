from django.urls import path
from . import views
from bird_app.views_csp import csp_violation_report

urlpatterns = [
    path("", views.send_the_homepage),
    path("signup/", views.sign_up),
    path("login/", views.log_in),
    path("logout/", views.log_out),
    path("whoami/", views.who_am_i),
    path("find_birds/", views.find_birds_post),
    path("find_birds/<str:bird_name>/", views.find_birds),
    path("geolocate/", views.geolocate),
    path("confirm_bird/", views.confirm_bird),
    path("get_users_birds/", views.get_users_birds),
    path("delete_birds/", views.delete_birds),
    path("delete_bird/<int:bird_id>/", views.delete_bird),
    path("csp-violation-report/", csp_violation_report, name="csp_violation_report"),
]
