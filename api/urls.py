
from api.apis import BankListAPI, BankReserveForecastAPIView, CountryMetricsAPIView, CurrencyConversionAPI, MoneyTransferAPIView, UserAccountListAPI, DailyTransactionChargesAPIView
from django.urls import path

urlpatterns = [
    path('banks/', BankListAPI.as_view(), name='bank-list'),
    path('user-accounts/', UserAccountListAPI.as_view(), name='user-account-list'),
    path('currency-conversions/', CurrencyConversionAPI.as_view(), name='currency-conversion'),
    path('transfer/', MoneyTransferAPIView.as_view(), name='money-transfer'),
    path('daily-transaction-charges/', DailyTransactionChargesAPIView.as_view(), name='daily-transaction-charges'),
    path('country-metrics/', CountryMetricsAPIView.as_view(), name='country-metrics'),
    path('bank-reserve-forecast/', BankReserveForecastAPIView.as_view(), name="bank-reserve-forecast"),
]