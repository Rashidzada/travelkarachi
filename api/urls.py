from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'segments', views.FlightSegmentViewSet, basename='segment')
router.register(r'agents', views.SubAgentViewSet, basename='agent')

urlpatterns = [
    path('auth/login/', views.login_view, name='api-login'),
    path('auth/logout/', views.logout_view, name='api-logout'),
    path('auth/me/', views.me_view, name='api-me'),
    path('dashboard/', views.dashboard_view, name='api-dashboard'),
    path('pos/search/', views.pos_search_flights, name='api-pos-search'),
    path('pos/promo/', views.validate_promo, name='api-pos-promo'),
    path('reports/', views.reports_view, name='api-reports'),
    path('settings/', views.settings_view, name='api-settings'),
    path('', include(router.urls)),
]
