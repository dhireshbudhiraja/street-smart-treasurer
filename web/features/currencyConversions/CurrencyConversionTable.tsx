import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCurrencyConversions } from './currencyConversionSlice';

const CurrencyConversionTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversions, loading, error } = useAppSelector((state) => state.currencyConversion);

  useEffect(() => {
    dispatch(fetchCurrencyConversions());
  }, [dispatch]);

  return (
    <div className="container mt-4">
      <h3>Currency Conversion Rates</h3>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>From Currency</th>
              <th>To Currency</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            {conversions.map(({ id, from_currency, to_currency, rate }) => (
                <tr key={id}>
                  <td>{from_currency}</td>
                  <td>{to_currency}</td>
                  <td>{rate}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CurrencyConversionTable;
