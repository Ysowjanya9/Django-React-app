from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Team, Driver, Race

class TeamSerializer(serializers.ModelSerializer):
    drivers = serializers.PrimaryKeyRelatedField(queryset=Driver.objects.all(), many=True,
    write_only=True)
    driver_name = serializers.SerializerMethodField()
    class Meta:
        model = Team
        fields = ['id','team_name','city','country','drivers', 'driver_name', 'logo_image','description']
    def get_driver_name(self, obj):
        return [f"{driver.first_name} {driver.last_name}" for driver in obj.drivers.all()]

class DriverSerializer(serializers.ModelSerializer):
    team = serializers.SlugRelatedField(slug_field='team_name',required=False,
    allow_null=True,queryset = Team.objects.all())
    upcoming_races = serializers.SerializerMethodField()
    completed_races = serializers.SerializerMethodField()
    class Meta:
        model = Driver
        fields = ['id','first_name','last_name','date_of_birth','team','completed_races',
        'upcoming_races']
    def get_upcoming_races(self,obj):
        return [{'track_name': race.track_name, 'race_date': race.race_date,
        'registration_closure_date':race.registration_closure_date}for race in obj.upcoming_races()]
    def get_completed_races(self,obj):
        return [{'track_name': race.track_name, 'race_date': race.race_date} for race in
        obj.completed_races()]

class RaceSerializer(serializers.ModelSerializer):
    drivers = serializers.PrimaryKeyRelatedField(queryset=Driver.objects.all(), many=True,
    write_only=True)
    driver_names = serializers.SerializerMethodField()
    driver_team = serializers.SerializerMethodField()
    class Meta:
        model = Race
        fields = ['id', 'track_name', 'city', 'country', 'race_date', 'registration_closure_date',
         'drivers', 'driver_names', 'driver_team']
    def get_driver_names(self, obj):
        return [f"{driver.first_name} {driver.last_name}" for driver in obj.drivers.all()]
    def get_driver_team(self, obj):
        return [driver.team.team_name if driver.team else None for driver in obj.drivers.all()]

    def validate(self, attrs):
        instance = self.instance or Race()
        for data, value in attrs.items():
            if data != 'drivers':
                setattr(instance, data, value)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict) from e
        return attrs
