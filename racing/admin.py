from django.contrib import admin
from . import models, forms
# Register your models here.
class TeamAdmin(admin.ModelAdmin):
    form = forms.TeamForm
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if 'drivers' in form.cleaned_data:
            obj.drivers.set(form.cleaned_data['drivers'])
class DriverAdmin(admin.ModelAdmin):
    form = forms.DriverForm
admin.site.register(models.Team,TeamAdmin)
admin.site.register(models.Driver,DriverAdmin)
admin.site.register(models.Race)
