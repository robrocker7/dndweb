from django.urls import path

from campaigns import views

urlpatterns = [
    path('new/', views.CampaignCreateView.as_view(), name='new'),
    path('<slug:slug>/', views.CampaignHomeView.as_view(), name='campaign_home'),
    path('', views.CampaignLandingPageView.as_view()),
]