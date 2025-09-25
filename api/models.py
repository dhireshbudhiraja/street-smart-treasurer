# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
class BankAccount(models.Model):
    id = models.AutoField(primary_key=True)
    owner_name = models.CharField(max_length=100)
    country = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50, unique=True)
    currency = models.CharField(max_length=10)
    interest_rate_percent = models.DecimalField(max_digits=4, decimal_places=2)
    balance = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return f"{self.owner_name} - {self.account_number} ({self.country})"