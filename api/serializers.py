from rest_framework import serializers
from .models import Bank, CurrencyConversion, UserAccount

class BankSerializer(serializers.ModelSerializer):
    country = serializers.CharField(source='country.name')
    currency = serializers.CharField(source='currency.code')

    class Meta:
        model = Bank
        fields = ['id','account_number', 'country', 'bank_name', 'currency', 'balance', 'interest_rate_percent']

class CurrencyConversionSerializer(serializers.ModelSerializer):
    from_currency = serializers.CharField(source='from_currency.code')
    to_currency = serializers.CharField(source='to_currency.code')

    class Meta:
        model = CurrencyConversion
        fields = ['id', 'from_currency', 'to_currency', 'rate']

class UserAccountSerializer(serializers.ModelSerializer):
    country = serializers.CharField(source='country.name')
    currency = serializers.CharField(source='currency.code')

    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'country', 'currency']

class CountryMetricsSerializer(serializers.Serializer):
    country_id = serializers.IntegerField()
    country_name = serializers.CharField()
    total_profit = serializers.DecimalField(max_digits=18, decimal_places=2)
    total_transactions = serializers.IntegerField()
    failed_transactions = serializers.IntegerField()
    success_transactions = serializers.IntegerField()
    avg_interest_rate = serializers.DecimalField(max_digits=5, decimal_places=2)