from django.db import migrations
from datetime import timedelta, datetime
from decimal import ROUND_DOWN, Decimal
import random
from django.utils import timezone 


def create_historical_transactions(apps, schema_editor):
    UserAccount = apps.get_model('api', 'UserAccount')
    CurrencyConversion = apps.get_model('api', 'CurrencyConversion')
    Country = apps.get_model('api', 'Country')
    Transaction = apps.get_model('api', 'Transaction')

    all_accounts = list(UserAccount.objects.all())
    countries = list(Country.objects.all())
    conversions = list(CurrencyConversion.objects.all())
    conversion_dict = {f"{c.from_currency_id}_{c.to_currency_id}": c.rate for c in conversions}
    countries_map = {c.id: c.transfer_charges for c in countries}
    statuses = ['S', 'F']

    # Date range for last 2 years, 20 transactions per day 
    end_date = (datetime.now()).date()
    start_date = end_date - timedelta(days=730)
    SECONDS_IN_DAY = 24 * 60 * 60 
    transactions_to_create = [] # New list to hold objects

    for day_offset in range(730):
        current_date = start_date + timedelta(days=day_offset)
        # Convert the date object to a datetime object at midnight (00:00:00)
        tx_datetime_midnight = datetime.combine(current_date, datetime.min.time())
        for _ in range(20):
            random_seconds = random.randrange(SECONDS_IN_DAY)
            naive_tx_datetime = tx_datetime_midnight + timedelta(seconds=random_seconds)
            tx_datetime = timezone.make_aware(naive_tx_datetime)
            from_user = random.choice(all_accounts)
            to_user = random.choice([a for a in all_accounts if a.id != from_user.id])
            amount = Decimal(str(round(random.uniform(10, 1000), 2))).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
            status = random.choices(statuses, weights=[0.8, 0.2])[0]  # 80% success
            conversion_rate = Decimal(str(conversion_dict.get(f"{from_user.currency_id}_{to_user.currency_id}", 1.0)))
            transaction_rate = Decimal(str(countries_map.get(to_user.country_id, 0.05)))
            converted_amount = Decimal(amount * conversion_rate).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
            transaction_charge = Decimal(converted_amount * transaction_rate).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
            money_received = Decimal(converted_amount - transaction_charge).quantize(Decimal('0.01'), rounding=ROUND_DOWN)
            transaction_instance = Transaction(
                from_useraccount=from_user,
                to_useraccount=to_user,
                from_currency=from_user.currency,
                to_currency=to_user.currency,
                money_sent=amount,
                # Use charge only if successful
                transaction_charge=transaction_charge if status == 'S' else Decimal('0.00'),
                conversion_rate=conversion_rate,
                money_received=money_received,
                status=status,
                timestamp=tx_datetime # Unique random time on the current iteration date
            )
            transactions_to_create.append(transaction_instance)
    Transaction.objects.bulk_create(transactions_to_create)  # Bulk create for efficiency

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0004_conversionrates'),
    ]

    operations = [
        migrations.RunPython(create_historical_transactions),
    ]
