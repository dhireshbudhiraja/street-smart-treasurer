# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from api.models import Bank, CurrencyConversion
from api.serializers import BankSerializer, CountryMetricsSerializer, CurrencyConversionSerializer, UserAccountSerializer
from django.db.models.functions import TruncDate
from django.db.models import Sum, Count, Q, Avg
from rest_framework import generics
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from decimal import Decimal, ROUND_DOWN
from .models import TransactionStatus, UserAccount, Bank, CurrencyConversion, Transaction
from datetime import datetime, timedelta, date
import joblib
import pandas as pd

class BankListAPI(generics.ListAPIView):
    serializer_class = BankSerializer
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return Bank.objects.all()
    
class CurrencyConversionAPI(generics.ListAPIView):
    serializer_class = CurrencyConversionSerializer
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return CurrencyConversion.objects.all()
    
class UserAccountListAPI(generics.ListAPIView):
    serializer_class = UserAccountSerializer  # Reuse UserAccountSerializer for simplicity
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return UserAccount.objects.select_related('country', 'currency').all()    


class MoneyTransferAPIView(APIView):

    @transaction.atomic
    def post(self, request):
        from_user_id = request.data.get('from_user_id')
        to_user_id = request.data.get('to_user_id')
        amount = request.data.get('amount')

        if not all([from_user_id, to_user_id, amount]):
            return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        if(from_user_id == to_user_id):
            return Response({"error": "Sender and recipient cannot be the same."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(amount)
            if amount <= 0:
                raise ValueError()
        except:
            return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from_user = UserAccount.objects.select_related('country', 'currency').get(id=from_user_id)
            to_user = UserAccount.objects.select_related('country', 'currency').get(id=to_user_id)
        except UserAccount.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get from_user's country bank account and to_user's bank account
        try:
            from_bank_account = Bank.objects.select_for_update().get(country=from_user.country)
            to_bank_account = Bank.objects.select_for_update().get(country=to_user.country)
        except Bank.DoesNotExist:
            return Response({"error": "Bank account not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Conversion rate from from_user currency to to_user currency
        try:
            conversion = CurrencyConversion.objects.get(
                from_currency=from_user.currency,
                to_currency=to_user.currency
            )
            conversion_rate = conversion.rate
        except CurrencyConversion.DoesNotExist:
            return Response({"error": "Conversion rate not defined for these currencies."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate transfer charges based on to_user country transfer charges

        # Total debit required from to_user account: converted amount + charges
        converted_amount = (amount * conversion_rate).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        transaction_charge = (converted_amount * to_user.country.transfer_charges).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
        # Calculate money received by to_user after charges
        money_received = converted_amount - transaction_charge

        # Additional charges if recipient's bank account balance is insufficient
        if to_bank_account.balance < money_received:
            Transaction.objects.create(
                from_useraccount=from_user,
                to_useraccount=to_user,
                source_currency=from_user.currency,
                to_currency=to_user.currency,
                money_sent=amount,
                transaction_charge=0,
                conversion_rate=conversion_rate,
                money_received=converted_amount,
                status=TransactionStatus.FAILURE,
                timestamp = datetime.now()
            )
            return Response({"error": "Insufficient funds in the bank account to transfer money."},
                        status=status.HTTP_400_BAD_REQUEST)

        # Create transaction record
        Transaction.objects.create(
            from_useraccount=from_user,
            to_useraccount=to_user,
            source_currency=from_user.currency,
            to_currency=to_user.currency,
            money_sent=amount,
            transaction_charge=transaction_charge,
            conversion_rate=conversion_rate,
            money_received=money_received,
            status=TransactionStatus.SUCCESS,
            timestamp = datetime.now()
        )
        from_bank_account.balance += amount
        from_bank_account.save() 
        to_bank_account.balance -= money_received
        to_bank_account.save()

        return Response({
            "message": "Transfer successful.",
            "data": {
                "sent": f"{amount} {from_user.currency.code}",
                "received": f"{money_received} {to_user.currency.code}",
                "transaction_charge": f"{transaction_charge} {to_user.currency.code}",
            }
        }, status=status.HTTP_200_OK)


class DailyTransactionChargesAPIView(APIView):
    def get(self, request):
        # Parse dates from query parameters with fallbacks
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        try:
            if start_date_str:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            else:
                # default to 30 days ago if not provided
                start_date = datetime.now() - timedelta(days=30)

            if end_date_str:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            else:
                end_date = datetime.now()
        except ValueError:
            return Response({"error": "Invalid date format, expected YYYY-MM-DD."},
                            status=status.HTTP_400_BAD_REQUEST)

        if start_date > end_date:
            return Response({"error": "start_date must be before or equal to end_date."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Filter transactions within date range, truncate timestamp to date
        charges_data = (
            Transaction.objects
            .filter(timestamp__date__gte=start_date.date(), timestamp__date__lte=end_date.date())
            .annotate(date=TruncDate('timestamp'))
            .values('date', 'to_useraccount__country__name')
            .annotate(total_charges=Sum('transaction_charge'))
            .order_by('date', 'to_useraccount__country__name')
        )

        # Organize result as {date: {currency: total_charges, ...}, ...}
        result = {}
        for entry in charges_data:
            date = entry['date'].strftime('%Y-%m-%d')
            country = entry['to_useraccount__country__name']
            total = entry['total_charges'] or 0

            if date not in result:
                result[date] = {}
            result[date][country] = float(total)

        return Response(result, status=status.HTTP_200_OK)


class CountryMetricsAPIView(APIView):
    def get(self, request):
        # Aggregate transaction stats
        tx_stats = (
            Transaction.objects
            .values('to_useraccount__country__id', 'to_useraccount__country__name')
            .annotate(
                total_profit=Sum('transaction_charge'),
                total_transactions=Count('id'),
                failed_transactions=Count('id', filter=Q(status='F')),
                success_transactions=Count('id', filter=Q(status='S')),
            )
        )

        # Aggregate average interest rates from banks
        interest_rates = (
            Bank.objects
            .values('country__id')
            .annotate(avg_interest_rate=Avg('interest_rate_percent'))
        )
        interest_dict = {i['country__id']: i['avg_interest_rate'] for i in interest_rates}

        # Prepare combined data for serialization
        results = []
        for stats in tx_stats:
            country_id = stats['to_useraccount__country__id']
            results.append({
                'country_id': country_id,
                'country_name': stats['to_useraccount__country__name'],
                'total_profit': stats['total_profit'] or 0,
                'total_transactions': stats['total_transactions'],
                'failed_transactions': stats['failed_transactions'],
                'success_transactions': stats['success_transactions'],
                'avg_interest_rate': interest_dict.get(country_id, 0),
            })

        serializer = CountryMetricsSerializer(results, many=True)
        return Response(serializer.data)


class BankReserveForecastAPIView(APIView):
    def get(self, request):
        try:
            model = joblib.load("bank_reserve_predict_model.pkl")
        except Exception:
            return Response({"error": "Model not found. Please run training command."})
        banks = Bank.objects.all()
        results = []
        yesterday = date.today() - timedelta(days=1)
        for bank in banks:
            txns = Transaction.objects.filter(
                to_useraccount__country=bank.country,
                to_currency=bank.currency,
                timestamp__date=yesterday
            )
            profit = txns.aggregate(Sum("transaction_charge"))["transaction_charge__sum"] or 0
            num_failed = txns.filter(status="F").count()
            num_success = txns.filter(status="S").count()
            X_pred = pd.DataFrame([{
                "profit": profit,
                "num_failed": num_failed,
                "num_success": num_success,
                "avg_interest_rate": float(bank.interest_rate_percent),
            }])
            reserve_pred = float(model.predict(X_pred)[0])
            results.append({
                "bank_id": bank.id,
                "bank_name": bank.bank_name,
                "country": bank.country.name,
                "currency": bank.currency.code,
                "predicted_min_reserve_for_next_day": round(reserve_pred, 2),
            })
        return Response(results)
