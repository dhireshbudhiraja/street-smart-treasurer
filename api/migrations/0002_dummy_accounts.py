from django.db import migrations
import random

def create_dummy_accounts(apps, schema_editor):
    BankAccount = apps.get_model('api', 'BankAccount')

    countries = ["USA", "RUSSIA", "INDIA", "CHINA", "BRAZIL", "GERMANY", "FRANCE", "UK", "JAPAN", "AUSTRALIA"]
    bank_names = {
        "USA": "First National Bank",
        "RUSSIA": "Sberbank",
        "INDIA": "State Bank of India",
        "CHINA": "Industrial and Commercial Bank of China",
        "BRAZIL": "Banco do Brasil",
        "GERMANY": "Deutsche Bank",
        "FRANCE": "BNP Paribas",
        "UK": "HSBC",
        "JAPAN": "Mitsubishi UFJ Financial",
        "AUSTRALIA": "Commonwealth Bank"
    }
    currencies = {
        "USA": "USD",
        "RUSSIA": "RUB",
        "INDIA": "INR",
        "CHINA": "CNY",
        "BRAZIL": "BRL",
        "GERMANY": "EUR",
        "FRANCE": "EUR",
        "UK": "GBP",
        "JAPAN": "JPY",
        "AUSTRALIA": "AUD"
    }

    def generate_account_number(country_code):
        return f"{country_code[:3].upper()}{random.randint(10000000, 99999999)}"

    owner_name = "street_smart_treasurer"

    for country in countries:
        BankAccount.objects.create(
            owner_name=owner_name,
            country=country,
            bank_name=bank_names[country],
            account_number=generate_account_number(country),
            currency=currencies[country],
            interest_rate_percent=round(random.uniform(2, 4), 2),
            balance=round(random.uniform(1000, 1000000), 2)
        )

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),  # adjust to your last migration
    ]

    operations = [
        migrations.RunPython(create_dummy_accounts),
    ]
