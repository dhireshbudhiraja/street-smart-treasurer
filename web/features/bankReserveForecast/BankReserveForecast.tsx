import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBankReserveForecast } from './bankReserveForecastSlice';

const BankReserveForecast: React.FC<{ country?: string }> = ({ country }) => {
  const dispatch = useAppDispatch();
  const { forecasts, loading, error } = useAppSelector((state) => state.bankReserveForecast);

  useEffect(() => {
    dispatch(fetchBankReserveForecast());
  }, [dispatch]);

  return (
    <div className="container mt-4">
      <h3>Bank Reserve Forecast for Next Day</h3>

      {loading && <p>Loading forecast...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && forecasts.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Bank Name</th>
                <th>Country</th>
                <th>Currency</th>
                <th>Predicted Minimum Reserve</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.filter((b) => country ? b.country === country : true).map((b) => (
                <tr key={b.bank_id}>
                  <td>{b.bank_name}</td>
                  <td>{b.country}</td>
                  <td>{b.currency}</td>
                  <td>{b.predicted_min_reserve_for_next_day.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && forecasts.length === 0 && <p>No forecast data available.</p>}
    </div>
  );
};

export default BankReserveForecast;
