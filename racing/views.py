from django.shortcuts import render, redirect
from django.contrib import messages
from rest_framework import generics, status
from rest_framework.response import Response
from .serializer import TeamSerializer, DriverSerializer, RaceSerializer
from .models import Team, Driver, Race
from .forms import TeamForm, DriverForm, RaceForm

def home(request):
    return render(request, 'home.html')

def team_create(request):
    if not Driver.objects.filter(team__isnull=True).exists():
        messages.warning(request, "No available drivers in the system to create a team.")
        return redirect('team_list')

    if request.method == 'POST':
        form = TeamForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, "Team created successfully.")
            return redirect('team_list')
    else:
        form = TeamForm()
    return render(request, 'teams/team_form.html',{'form':form, 'heading': 'Create a Team'})

def team_list(request):
    teams = Team.objects.all()
    return render(request, 'teams/team_list.html',{'teams': teams})

def team_view(request, pk):
    try:
        team = Team.objects.get(id=pk)
        return render(request, 'teams/team_view.html',{'team': team})
    except Team.DoesNotExist:
        messages.error(request, "Team not found.")
        return redirect('team_list')
def team_edit(request, pk):
    try:
        team = Team.objects.get(id=pk)
    except Team.DoesNotExist:
        messages.error(request, "Team not found.")
        return redirect('team_list')
    if request.method =='POST':
        form = TeamForm(request.POST, request.FILES, instance=team)
        if form.is_valid():
            form.save()
            messages.success(request, "Team edited successfully.")
            return redirect('team_list')
    else:
        form=TeamForm(instance=team)
    return render(request, 'teams/team_form.html',{'form':form, 'heading': 'Update a Team'})

def team_bulk_delete(request):
    if request.method == 'POST':
        team_ids = request.POST.getlist('team_ids')
        undeletable = []
        deletable = []
        for team_id in team_ids:
            try:
                team = Team.objects.get(id=team_id)
                if team.drivers.filter(races__isnull=False).exists():
                    undeletable.append(team.team_name)
                else:
                    deletable.append(team.team_name)
                    team.delete()
            except Team.DoesNotExist:
                continue
        if undeletable:
            messages.error(
                request, f"Could not delete {', '.join(undeletable)} with drivers in races")
        if deletable:
            messages.success(
                request, f"Selected teams {', '.join(deletable)} deleted successfully.")
    return redirect('team_list')

def driver_create(request):
    if request.method == 'POST':
        form = DriverForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Driver created successfully.")
            return redirect('driver_list')
    else:
        form = DriverForm()
    return render(request, 'drivers/driver_form.html',{'form':form, 'heading': 'Create a Driver'})

def driver_list(request):
    drivers = Driver.objects.all()
    return render(request, 'drivers/driver_list.html',{'drivers': drivers})

def driver_view(request, pk):
    try:
        driver = Driver.objects.get(id=pk)
        return render(request, 'drivers/driver_view.html',{'driver': driver})
    except Driver.DoesNotExist:
        messages.error(request, "Driver not found.")
        return redirect('driver_list')

def driver_edit(request, pk):
    try:
        driver = Driver.objects.get(id=pk)
    except Driver.DoesNotExist:
        return redirect('driver_list')
    if request.method =='POST':
        form = DriverForm(request.POST, instance=driver)
        if form.is_valid():
            form.save()
            messages.success(request, "Driver edited successfully.")
            return redirect('driver_list')
    else:
        form = DriverForm(instance=driver)
    return render(request, 'drivers/driver_form.html',{'form':form, 'heading': 'Update a Driver'})

def driver_bulk_delete(request):
    if request.method == 'POST':
        driver_ids = request.POST.getlist('driver_ids')
        undeletable = []
        deletable = []
        for driver_id in driver_ids:
            try:
                driver = Driver.objects.get(id=driver_id)
                if driver.races.exists():
                    undeletable.append(driver.first_name + " " + driver.last_name)
                else:
                    deletable.append(driver.first_name + " " + driver.last_name)
                    driver.delete()
            except Driver.DoesNotExist:
                continue
        if undeletable:
            messages.error(
                request, f"Could not delete {', '.join(undeletable)} with registered races")
        if deletable:
            messages.success(
                request, f"Selected drivers {', '.join(deletable)} deleted successfully.")
    return redirect('driver_list')

def race_create(request):
    if request.method == 'POST':
        form = RaceForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Race created successfully.")
            return redirect('race_list')
    else:
        form = RaceForm()
    return render(request, 'races/race_form.html',{'form':form, 'heading': 'Create a Race'})

def race_list(request):
    races = Race.objects.all()
    return render(request, 'races/race_list.html',{'races': races})

def race_view(request, pk):
    try:
        race = Race.objects.get(id=pk)
        return render(request, 'races/race_view.html',{'race': race})
    except Race.DoesNotExist:
        messages.error(request, "Race not found.")
    return redirect('race_list')

def race_edit(request, pk):
    try:
        race = Race.objects.get(id=pk)
    except Race.DoesNotExist:
        return redirect('race_list')
    form = RaceForm(instance=race)
    if request.method =='POST':
        form = RaceForm(request.POST, instance=race)
        if form.is_valid():
            form.save()
            messages.success(request, "Race edited successfully.")
            return redirect('race_list')
    return render(request, 'races/race_form.html',{'form':form, 'heading': 'Update a Race'})

def race_bulk_delete(request):
    if request.method == 'POST':
        race_ids = request.POST.getlist('race_ids')
        undeletable = []
        deletable = []
        for race_id in race_ids:
            try:
                race = Race.objects.get(id=race_id)
                if race.driver.exists():
                    undeletable.append(race.track_name)
                else:
                    deletable.append(race.track_name)
                    race.delete()
            except Race.DoesNotExist:
                continue
        if undeletable:
            messages.error(request, f"Could not delete {', '.join(undeletable)} with drivers")
        if deletable:
            messages.success(
                request, f"Selected races {', '.join(deletable)} deleted successfully.")
    return redirect('race_list')

class TeamCreateApi(generics.CreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    def get(self, request, *args, **kwargs):
        unassigned_drivers = Driver.objects.filter(team__isnull=True)
        if not unassigned_drivers.exists():
            return Response({"message": "No unassigned drivers available. Cannot create a team."},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response()

    def create(self, request, *args, **kwargs):
        drivers = request.data.get('drivers')
        if not drivers:
            return Response( {"drivers": ["At least one driver must be assigned to the team."]},
                            status=status.HTTP_400_BAD_REQUEST)
        super().create(request, *args, **kwargs)
        return Response({"message": "Team created successfully."})

class TeamListApi(generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class TeamEditApi(generics.RetrieveUpdateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({"message": "Team edited successfully."})

class TeamBulkDeleteApi(generics.GenericAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    def delete(self, request, *args, **kwargs):
        team_ids = request.data.get('team_ids', [])
        undeletable = []
        deletable = []
        for team_id in team_ids:
            try:
                team = Team.objects.get(id=team_id)
                if team.drivers.filter(races__isnull=False).exists():
                    undeletable.append(team.team_name)
                else:
                    deletable.append(team.team_name)
                    team.delete()
            except Team.DoesNotExist:
                continue
        if undeletable:
            return Response(
                {"message":f"Could not delete {', '.join(undeletable)} with drivers in races."},
                status=status.HTTP_400_BAD_REQUEST)
        if deletable:
            return Response({
                "message":f"Selected teams {', '.join(deletable)} deleted successfully."})
        return Response({"message": "No valid teams found to delete."},
                        status=status.HTTP_400_BAD_REQUEST)


class DriverCreateApi(generics.CreateAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class DriverListApi(generics.ListAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    def get_queryset(self):
        queryset = Driver.objects.all()
        unassigned = self.request.query_params.get('unassigned') == 'true'
        team_id = self.request.query_params.get('team_id')

        if unassigned:
            queryset = queryset.filter(team__isnull=True)
            if team_id:
                queryset = queryset | Driver.objects.filter(team_id=team_id)
        return queryset.distinct()

class DriverEditApi(generics.RetrieveUpdateAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({"message": "Driver edited successfully."})

class DriverBulkDeleteApi(generics.GenericAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    def delete(self, request, *args, **kwargs):
        driver_ids = request.data.get('driver_ids', [])
        undeletable = []
        deletable = []
        for driver_id in driver_ids:
            try:
                driver = Driver.objects.get(id=driver_id)
                if driver.races.exists():
                    undeletable.append(driver.first_name + " " + driver.last_name)
                else:
                    deletable.append(driver.first_name + " " + driver.last_name)
                    driver.delete()
            except Driver.DoesNotExist:
                continue
        if undeletable:
            return Response(
                {"message":f"Could not delete {', '.join(undeletable)} with registered races."},
                status=status.HTTP_400_BAD_REQUEST)
        if deletable:
            return Response(
                {"message":f"Selected drivers {', '.join(deletable)} deleted successfully."})
        return Response({"message": "No valid drivers found to delete."},
                        status=status.HTTP_400_BAD_REQUEST)

class RaceCreateApi(generics.CreateAPIView):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({"message": "Race created successfully."})

class RaceListApi(generics.ListAPIView):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer

class RaceEditApi(generics.RetrieveUpdateAPIView):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({"message": "Race edited successfully."})

class RaceBulkDeleteApi(generics.GenericAPIView):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    def delete(self, request, *args, **kwargs):
        race_ids = request.data.get('race_ids', [])
        undeletable = []
        deletable = []
        for race_id in race_ids:
            try:
                race = Race.objects.get(id=race_id)
                if race.drivers.exists():
                    undeletable.append(race.track_name)
                else:
                    deletable.append(race.track_name)
                    race.delete()
            except Race.DoesNotExist:
                continue
        if undeletable:
            return Response(
                {"message":f"Could not delete {', '.join(undeletable)} with drivers."},
                status=status.HTTP_400_BAD_REQUEST)
        if deletable:
            return Response(
                {"message":f"Selected races {', '.join(deletable)} deleted successfully."})
        return Response({"message": "No valid races found to delete."},
                        status=status.HTTP_400_BAD_REQUEST)
