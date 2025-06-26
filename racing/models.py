from datetime import date
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator

def check_logo_size(img):
    max_size = 50 * 1024
    if  img.size > max_size:
        raise ValidationError("Logo size must be less than or equal to 50KB.")

class Team(models.Model):
    team_name = models.CharField(max_length=256,unique=True)
    city = models.CharField()
    country = models.CharField()
    logo_image = models.ImageField(upload_to='TeamLogos/', validators=[check_logo_size])
    description = models.TextField(max_length=1024, blank=True)
    def __str__(self):
        return self.team_name

class Driver(models.Model):
    first_name = models.CharField(max_length=96)
    last_name = models.CharField(max_length=96)
    date_of_birth = models.DateField(validators=[MaxValueValidator(limit_value=date(2000,12,31))])
    team = models.ForeignKey(Team,on_delete=models.SET_NULL,related_name='drivers',null=True,
    blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['first_name','last_name'],
        name='unique_driver_name')]
    def delete(self, *args, **kwargs):
        team = self.team
        super().delete(*args, **kwargs)
        if team:
            team = Team.objects.get(pk=team.pk)
            if not team.drivers.exists():
                team.delete()

    def completed_races(self):
        return self.races.filter(race_date__lt=date.today())
    def upcoming_races(self):
        return self.races.filter(race_date__gte=date.today())
    def __str__(self):
        return self.first_name + " " + self.last_name

class Race(models.Model):
    track_name = models.CharField(max_length=256, unique=True)
    city = models.CharField()
    country = models.CharField()
    race_date = models.DateField()
    registration_closure_date = models.DateField(null=True, blank=True)
    drivers = models.ManyToManyField(Driver, blank=True, related_name='races')
    def clean(self):
        today = date.today()
        if not self.pk:
            if self.race_date < today:
                raise ValidationError({'race_date': "Race date must be in the future."})
        else:
            old = Race.objects.filter(pk=self.pk).first()
            if old.race_date < today:
                raise ValidationError({'race_date': "Cannot update the completed race date."})
            if old.race_date >= today > self.race_date:
                raise ValidationError({'race_date': 'Race date must be in the future.'})
        if self.registration_closure_date and self.registration_closure_date>=self.race_date:
            raise ValidationError({'registration_closure_date': 'Must be before the race date.'})
    def __str__(self):
        return self.track_name
