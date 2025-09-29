from django.db import migrations

def set_currency_rates(apps, schema_editor):
    Currency = apps.get_model('api', 'Currency')
    CurrencyConversion = apps.get_model('api', 'CurrencyConversion')

    # Example fixed conversion rates relative to a base currency (e.g., USD)
    # Replace or extend with any source like API fetch if needed.
    
    usd_rates = {
        'USD': 1.0,
        'RUB': 74.0,
        'INR': 80.0,
        'CNY': 6.9,
        'BRL': 5.2,
        'EUR': 0.9,
        'GBP': 0.75,
        'JPY': 110.0,
        'AUD': 1.4        
    }

    currency_dict = dict(
        Currency.objects.all().values_list('code', 'id')
    )

    done_currencies = []


    # Outer loop: 'FROM' currency
    for from_currency in usd_rates:
        # Inner loop: 'TO' currency
        for to_currency in usd_rates:
            if(done_currencies.__contains__(f"{from_currency}_{to_currency}") or from_currency == to_currency):
                continue
            # Calculate the cross-rate: Rate(FROM->TO) = Rate(USD->TO) / Rate(USD->FROM)
            rate = usd_rates[to_currency] / usd_rates[from_currency]
            # Append the result as a tuple (FROM, TO, RATE)
            done_currencies.append(f"{from_currency}_{to_currency}")
            CurrencyConversion.objects.create(
                from_currency=Currency.objects.get(id=currency_dict[from_currency]),
                to_currency=Currency.objects.get(id=currency_dict[to_currency]),
                rate=rate
            )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_useraccounts'),  # Adjust according to your last migration
    ]

    operations = [
        migrations.RunPython(set_currency_rates),
    ]
