import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBanks, setCountry, type Bank } from './banksSlice';
import CurrencyConversionTable from '../currencyConversions/CurrencyConversionTable';
import BankReserveForecast from '../bankReserveForecast/BankReserveForecast';

const BanksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    banks,
    loading,
    error,
    country,
    countryOptions,
  } = useAppSelector((state) => state.banks);

  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);

  const displayedAccounts = banks.filter((bank: Bank) => {
    const matchesCountry = country ? bank.country === country : true;
    return matchesCountry;
  });

  return (
    <div className="container mt-4">
      <h3>Banks List</h3>
      <div className="row mb-3">
        <div className="col-md-5">
          <label>Country</label>
          <select
            className="form-control"
            value={country}
            onChange={(e) => dispatch(setCountry(e.target.value))}
          >
            <option value="">All Countries</option>
            {countryOptions.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
      </div>
      {loading && <p>Loading banks...</p>}
      {error && <p className="text-danger">{error}</p>}
        <div className="row">
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                <th>Account Number</th>
                <th>Bank Name</th>
                <th>Country</th>
                <th>Currency</th>
                <th>Balance</th>
                <th>Interest Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {displayedAccounts.map((account) => (
                <tr key={account.account_number}>
                  <td>{account.account_number}</td>
                  <td>{account.bank_name}</td>
                  <td>{account.country}</td>
                  <td>{account.currency}</td>
                  <td>{account.balance}</td>
                  <td>{account.interest_rate_percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && displayedAccounts.length === 0 && <p>No banks found.</p>}
      </div>
      <BankReserveForecast country={country} />
    </div>
  );
};

export default BanksPage;
