from django.urls import path
from . import views

urlpatterns = [
    path('', views.Home),
    path('create/', views.create_book),
    path('register/', views.register_user),
    path('login/', views.login_user),
    path('all-users/', views.all_users),
    path('admin-dashboard/', views.admin_dashboard),
    path('admin-login/', views.admin_login),
    path('admin-dashboard/<int:id>/', views.delete_user),
    path('admin-dashboard/delete/<int:id>/', views.delete_user),
    path('admin-dashboard/update/<int:id>/', views.update_user),
    path('all-bookings/', views.all_bookings),
]