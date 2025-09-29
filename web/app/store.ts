import { configureStore } from '@reduxjs/toolkit';
import banksReducer from '../features/banks/banksSlice';
import currencyConversionReducer from '../features/currencyConversions/currencyConversionSlice';
import userAccountsReducer from '../features/userAcccounts/userAccountsSlice';
import transactionChargesReducer from '../features/transactionCharges/transactionChargesSlice';
import countryMetricsReducer from '../features/countryMetrics/countryMetricsSlice';
import bankReserveForecastReducer from '../features/bankReserveForecast/bankReserveForecastSlice';

export const store = configureStore({
  reducer: {
    userAccounts: userAccountsReducer,
    banks: banksReducer,
    currencyConversion: currencyConversionReducer,
    transactionCharges: transactionChargesReducer,
    countryMetrics: countryMetricsReducer,
    bankReserveForecast: bankReserveForecastReducer,
  },
});

// Types for useSelector and useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
