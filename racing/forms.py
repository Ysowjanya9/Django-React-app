from django import forms
from .models import Team, Driver, Race

class TeamForm(forms.ModelForm):
    drivers = forms.ModelMultipleChoiceField(queryset=Driver.objects.none(), required=True)
    class Meta:
        model = Team
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        instance = kwargs.get('instance')
        super().__init__(*args, **kwargs)
        if instance:
            unassigned = Driver.objects.filter(team__isnull=True)
            current = instance.drivers.all()
            self.fields['drivers'].queryset = (unassigned | current).distinct()
            self.initial['drivers'] = current
        else:
            self.fields['drivers'].queryset = Driver.objects.filter(team__isnull=True)
    def save(self, commit=True):
        team = super().save(commit)
        team.drivers.set(self.cleaned_data['drivers'])
        return team


class DriverForm(forms.ModelForm):
    class Meta:
        model = Driver
        exclude = ['team']
class RaceForm(forms.ModelForm):
    class Meta:
        model = Race
        fields = '__all__'
