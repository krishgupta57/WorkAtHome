from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'customers', views.CustomerProfileViewSet)
router.register(r'workers', views.WorkerProfileViewSet)
router.register(r'categories', views.ServiceCategoryViewSet)
router.register(r'addresses', views.AddressViewSet)
router.register(r'slots', views.BookingSlotViewSet)
router.register(r'bookings', views.BookingViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'reviews', views.ReviewViewSet)
router.register(r'messages', views.MessageViewSet)
router.register(r'notifications', views.NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register_user, name='auth_register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('admin-analytics/stats/', views.admin_stats, name='admin_stats'),
]