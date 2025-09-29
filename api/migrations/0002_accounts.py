from django.db import migrations, models
import random

def create_initial_data(apps, schema_editor):
    Country = apps.get_model('api', 'Country')
    Currency = apps.get_model('api', 'Currency')
    Bank = apps.get_model('api', 'Bank')

    countries_info = [
        ("USA", "USD", "US Dollar", "$", "First National Bank"),
        ("RUSSIA", "RUB", "Russian Ruble", "₽", "Sberbank"),
        ("INDIA", "INR", "Indian Rupee", "₹", "State Bank of India"),
        ("CHINA", "CNY", "Renminbi", "¥", "ICBC"),
        ("BRAZIL", "BRL", "Brazilian Real", "R$", "Banco do Brasil"),
        ("GERMANY", "EUR", "Euro", "€", "Deutsche Bank"),
        ("FRANCE", "EUR", "Euro", "€", "BNP Paribas"),
        ("UK", "GBP", "Pound Sterling", "£", "HSBC"),
        ("JAPAN", "JPY", "Yen", "¥", "MUFG Bank"),
        ("AUSTRALIA", "AUD", "Australian Dollar", "A$", "Commonwealth Bank"),
    ]

    for name, code, cname, symbol, bank_name in countries_info:
        country, _ = Country.objects.get_or_create(name=name, currency=code, transfer_charges=round(random.uniform(0.01, 0.20), 2))
        currency, _ = Currency.objects.get_or_create(name=cname, symbol=symbol, code=code)
        Bank.objects.get_or_create(
            country=country,
            bank_name=bank_name,
            currency=currency,
            interest_rate_percent=round(random.uniform(2, 4), 2),
            account_number=f"{name[:3].upper()}{random.randint(10000000, 99999999)}",
            balance=round(random.uniform(10000, 100000), 2),
        )

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),  # replace with your app and previous migration
    ]

    operations = [
        migrations.RunPython(create_initial_data),
    ]
