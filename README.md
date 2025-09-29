# Money Transfer & Bank Reserve Management App

A full-stack application to manage user transactions, currency conversions, calculate and optimize bank reserves to minimize transaction failures and maximize profit from transaction charges. It includes a React frontend with Redux state management and a Django backend with ML integration for intelligent reserve forecasting.

---

## Features

- Secure money transfer between user accounts with currency conversion and transaction charges
- Real-time calculation of daily transaction charges by destination currency
- Visualization dashboards for profit, failure rates, and predicted bank reserves
- Machine learning model to forecast minimum required reserves per bank to reduce failures
- Django API endpoints powering advanced analytics and ML-driven recommendations

---

## Tech Stack

- Backend: Django 5.x, Django REST Framework
- Frontend: React, Redux Toolkit, Recharts, React DatePicker, Bootstrap
- ML: scikit-learn Random Forest for reserve prediction
- Data Storage: PostgreSQL (recommended for transactional integrity)

---

## Setup and Installation

### Backend

1. Create and activate a Python virtual environment
2. Install dependencies: pip install -r requirements.txt
3. Create the required PostgreSQL database.Update the `DATABASES` setting in your project's `settings.py` file with your PostgreSQL connection details.
   ```python 
    DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'street_smart_treasurer_db',
        'USER': 'dhireshbudhiraja',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '', 
    }}

4. Run database migrations: ./migrate
5. Train ML model with data: ./train_model
6. Build App: ./build_app
7. Run App: ./run_app
8. Access the app at [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## IMPORTANT API Endpoints

- `/api/transfer/` — POST to perform money transfer between user accounts
- `/api/daily-transaction-charges/` — GET daily aggregated transaction charges by currency
- `/api/country-metrics/` — GET aggregated profit and failure metrics per country
- `/api/bank-reserve-forecast/` — GET predicted minimum bank reserve per bank for next day

---

## ML Integration

- A management command (`train_reserves`) trains a Random Forest model on transaction and bank data
- The model predicts reserve buffers banks should maintain to minimize failures
- Predictions are exposed through the Django API and consumed in the React frontend dashboard

---

## Frontend Features

- Interactive date range filtering for transaction charge visualization
- Summary tables and bar charts for country-wise profit and failure rate
- Bank reserve forecast visualization with Redux state management

---






