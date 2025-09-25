from rest_framework import serializers
from api.models import BankAccount

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = '__all__' # Serialize all fields of the BankAccount model
