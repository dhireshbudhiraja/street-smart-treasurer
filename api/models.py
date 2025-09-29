# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from decimal import Decimal

from django.db import models

class Country(models.Model):
    name = models.CharField(max_length=50, unique=True)
    currency = models.CharField(max_length=3, unique=False)
    transfer_charges = models.DecimalField(max_digits=4, decimal_places=2)  # between 0.01 and 0.20

    def __str__(self):
        return self.name

class Currency(models.Model):
    name = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=5, unique=False)
    code = models.CharField(max_length=3, unique=True)

    def __str__(self):
        return self.name

class CurrencyConversion(models.Model):
    from_currency = models.ForeignKey(Currency, related_name='conversions_from', on_delete=models.CASCADE)
    to_currency = models.ForeignKey(Currency, related_name='conversions_to', on_delete=models.CASCADE)
    rate = models.DecimalField(max_digits=12, decimal_places=6)

    class Meta:
        unique_together = ('from_currency', 'to_currency')

    def __str__(self):
        return f'Conversion from {self.from_currency} to {self.to_currency}: {self.rate}'

class Bank(models.Model):
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    bank_name = models.CharField(max_length=100, unique=True)
    interest_rate_percent = models.DecimalField(max_digits=4, decimal_places=2)  # Tied to the bank
    account_number = models.CharField(max_length=50, unique=True)
    balance = models.DecimalField(max_digits=20, decimal_places=2)

    def __str__(self):
        return f"{self.country} - {self.bank_name} - {self.currency}"


class UserAccount(models.Model):
    username = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.username} ({self.country.name})'

class TransactionStatus(models.TextChoices):
    # Use max_length=1 or 2 to match the value length
    FAILURE = 'F', 'Failure'
    SUCCESS = 'S', 'Success'

class Transaction(models.Model):
    # Core References
    from_useraccount = models.ForeignKey('UserAccount', related_name='transactions_sent', on_delete=models.CASCADE)
    to_useraccount = models.ForeignKey('UserAccount', related_name='transactions_received', on_delete=models.CASCADE)

    # Currency Context (Crucial for audit and historical accuracy)
    from_currency = models.ForeignKey('Currency', related_name='transactions_from', on_delete=models.PROTECT)
    to_currency = models.ForeignKey('Currency', related_name='transactions_to', on_delete=models.PROTECT)
    
    # Financial Details
    money_sent = models.DecimalField(max_digits=18, decimal_places=2)       # In 'from_currency'
    money_received = models.DecimalField(max_digits=18, decimal_places=2)   # In 'to_currency'
    transaction_charge = models.DecimalField(max_digits=10, decimal_places=4) # In 'to_currency' (or specify which currency)
    
    # Conversion Rate (Crucial for reconciliation)
    conversion_rate = models.DecimalField(max_digits=20, decimal_places=10, default=Decimal(1))

    # Status & Metadata
    status = models.CharField(
        max_length=2, 
        choices=TransactionStatus.choices, 
        default=TransactionStatus.SUCCESS
    )
    # Use 'timestamp' for the actual event time (good for ML/historical data)
    timestamp = models.DateTimeField(auto_now_add=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.status} {self.money_sent} {self.from_currency.code} to {self.to_useraccount}'

       