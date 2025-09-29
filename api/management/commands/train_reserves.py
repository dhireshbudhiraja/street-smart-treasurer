from django.core.management.base import BaseCommand
from api.models import Bank, Transaction
from datetime import date, timedelta
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

class Command(BaseCommand):
    help = "Train model to predict next day's minimum reserve for banks"

    def handle(self, *args, **options):
        # Define the path for the saved model
        MODEL_PATH = "bank_reserve_predict_model.pkl"
        
        banks = Bank.objects.all()
        records = []
        
        # Calculate the start date for historical transactions
        start_date = date.today() - timedelta(days=365)
        
        self.stdout.write(f"Starting model training using data from {start_date} to {date.today()}.")

        for bank in banks:
            # Fetch transactions within the last 365 days relevant to the bank
            txns = Transaction.objects.filter(
                to_useraccount__country=bank.country,
                to_currency=bank.currency,
                timestamp__gte=start_date
            )
            df = pd.DataFrame(list(txns.values(
                "timestamp", "money_sent", "transaction_charge", "status"
            )))
            
            if df.empty:
                self.stdout.write(f"Skipping Bank {bank.id}: Insufficient transaction data.")
                continue
                
            # Convert timestamp once
            df["datetime"] = pd.to_datetime(df["timestamp"])
            df["date"] = df["datetime"].dt.date
            
            # Prepare daily features
            daily = df.groupby("date").agg(
                total_received=("money_sent", "sum"),
                profit=("transaction_charge", "sum"),
                num_failed=("status", lambda x: (x == "F").sum()),
                num_success=("status", lambda x: (x == "S").sum()),
            ).reset_index()
            
            # 1. The 'actual' reserve required for a day is based on money received on that day.
            daily["min_required_reserve_actual"] = daily["total_received"] 
            
            # 2. Shift the target variable UP by 1 day. 
            #    The features (profit, num_failed, etc.) for day T will now align with 
            #    the target variable (reserve) for day T+1.
            daily["target_reserve"] = daily["min_required_reserve_actual"].shift(-1)
            
            
            # Add static features
            daily["bank_id"] = bank.id
            daily["avg_interest_rate"] = float(bank.interest_rate_percent)
            
            records.append(daily)
            
        if not records:
            self.stdout.write(self.style.ERROR("Insufficient Data to train model."))
            return
            
        data = pd.concat(records)
        
        # Drop the last row of each bank group, as it will have NaN for the shifted target
        data.dropna(subset=["target_reserve"], inplace=True)
        
        # Define Features (X) and Target (y)
        X = data[["profit", "num_failed", "num_success", "avg_interest_rate"]]
        y = data["target_reserve"] # Use the shifted target column
        
        self.stdout.write(f"Training model with {len(data)} total data points...")
        
        # Train Model
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(X, y)
        
        # Save Model
        joblib.dump(model, MODEL_PATH)
        self.stdout.write(self.style.SUCCESS(f"Model trained and saved as {MODEL_PATH}"))