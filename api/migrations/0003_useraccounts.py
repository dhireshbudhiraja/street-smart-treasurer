from django.db import migrations

def create_initial_data(apps, schema_editor):
    Country = apps.get_model('api', 'Country')
    Currency = apps.get_model('api', 'Currency')
    UserAccount = apps.get_model('api', 'UserAccount')

    countries = Country.objects.all()

    for country in countries:
        try:
            currency = Currency.objects.get(code=country.currency)
        except Currency.DoesNotExist:
            currency = Currency.objects.first()
        username = f"{country.name}_User"
        UserAccount.objects.create(
            username=username,
            country=country,
            currency=currency 
        )

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_accounts'),  # replace with your app and previous migration
    ]

    operations = [
        migrations.RunPython(create_initial_data),
    ]
