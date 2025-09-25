# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponse
from rest_framework import generics

from api.serializers import BankAccountSerializer
from api.models import BankAccount

# List and create bank accounts
class BankAccountListView(generics.ListCreateAPIView):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer

# Create your views/apis here.
def accounts_list(request):
    BankAccounts = BankAccount.objects.all()
    serializer = BankAccountSerializer(BankAccounts, many=True)
    return HttpResponse(serializer.data, content_type="application/json")
    
