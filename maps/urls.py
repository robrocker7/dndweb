from django.urls import path

from maps import views

urlpatterns = [
    path('new/', views.NewMapView.as_view()),
    path('<slug:slug>/', views.MapHomeView.as_view(), name='map-home'),
]