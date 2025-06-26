from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    path('',views.home, name='home'),
   # Team
   path('racing/teams/', views.team_list, name='team_list'),
   path('racing/teams/create/', views.team_create, name='team_create'),
   path('racing/teams/view/<int:pk>/', views.team_view, name='team_view'),
   path('racing/teams/edit/<int:pk>/', views.team_edit, name='team_edit'),
   path('racing/teams/delete/', views.team_bulk_delete, name='team_delete'),
   # Driver
   path('racing/drivers/', views.driver_list, name='driver_list'),
   path('racing/drivers/create/', views.driver_create, name='driver_create'),
   path('racing/drivers/view/<int:pk>/', views.driver_view, name='driver_view'),
   path('racing/drivers/edit/<int:pk>/', views.driver_edit, name='driver_edit'),
   path('racing/drivers/delete/', views.driver_bulk_delete, name='driver_delete'),
   # Race
   path('racing/races/', views.race_list, name='race_list'),
   path('racing/races/create/', views.race_create, name='race_create'),
   path('racing/races/view/<int:pk>/', views.race_view, name='race_view'),
   path('racing/races/edit/<int:pk>/', views.race_edit, name='race_edit'),
   path('racing/races/delete/', views.race_bulk_delete, name='race_delete'),

   # Team API
   path('racing/api/teams/create/', views.TeamCreateApi.as_view()), # POST
   path('racing/api/teams/', views.TeamListApi.as_view()), # GET
   path('racing/api/teams/edit/<int:pk>/', views.TeamEditApi.as_view()), # GET, PUT, PATCH
   path('racing/api/teams/delete/', views.TeamBulkDeleteApi.as_view()), # DELETE
   # Driver API
   path('racing/api/drivers/create/', views.DriverCreateApi.as_view()), # POST
   path('racing/api/drivers/', views.DriverListApi.as_view()), # GET
   path('racing/api/drivers/edit/<int:pk>/', views.DriverEditApi.as_view()), # GET, PUT, PATCH
   path('racing/api/drivers/delete/', views.DriverBulkDeleteApi.as_view()), # DELETE
   # Race API
   path('racing/api/races/create/',views.RaceCreateApi.as_view()), # POST
   path('racing/api/races/',views.RaceListApi.as_view()), # GET
   path('racing/api/races/edit/<int:pk>/',views.RaceEditApi.as_view()), # GET, PUT, PATCH
   path('racing/api/races/delete/',views.RaceBulkDeleteApi.as_view()), # DELETE
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
