import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BanksPage from './features/banks/BanksPage';
import TransferForm from './features/userAcccounts/transferForm';
import DailyChargesChart from './features/transactionCharges/DailyChargesChart';
import CountryMetricsDashboard from './features/countryMetrics/CountryMetricsDashboard';
import CurrencyConversionTable from './features/currencyConversions/CurrencyConversionTable';

const App: React.FC = () => (
  <Router>
    <nav className="navbar navbar-expand navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Street Smart Treasurer</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/banks">Banks</Link>
          <Link className="nav-link" to="/currency-conversions">Currency Conversions</Link>
          <Link className="nav-link" to="/transfer">Transfer</Link>
        </div>
      </div>
    </nav>
    <Routes>
      <Route path="/banks" element={<BanksPage />} />
      <Route path="/transfer" element={<TransferForm />} />
      <Route path="/currency-conversions" element={<CurrencyConversionTable />} />
      <Route path="*" element={<>
        <CountryMetricsDashboard  />
        <DailyChargesChart />
        </>} />
    </Routes>
  </Router>
);

export default App;
