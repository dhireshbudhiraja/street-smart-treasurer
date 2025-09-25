
from api.views import accounts_list
from django.urls import path


urlpatterns = [
    path('accounts', accounts_list, name='accounts_list'),
]