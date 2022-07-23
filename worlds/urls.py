from django.urls import path

from worlds import views

urlpatterns = [
    path('new/', views.NewWorldView.as_view()),
    path('<slug:slug>/', views.WorldHomeView.as_view(), name='world-home'),
]