# Generated by Django 5.2.1 on 2025-06-12 07:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('racing', '0007_alter_race_race_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='primary_driver',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='primary_for_team', to='racing.driver'),
        ),
    ]
