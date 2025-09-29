import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCountryMetrics } from "./countryMetricsSlice";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";

const CountryMetricsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { metrics, loading, error } = useAppSelector((state) => state.countryMetrics);

  useEffect(() => {
    dispatch(fetchCountryMetrics());
  }, [dispatch]);

  const chartProfitData = metrics.map((m) => ({
    country: m.country_name,
    profit: Number(m.total_profit),
  }));

  const chartFailureData = metrics.map((m) => ({
    country: m.country_name,
    failure_rate:
      m.total_transactions > 0
        ? (m.failed_transactions / m.total_transactions) * 100
        : 0,
  }));

  return (
    <div className="container mt-4">
      <h3>Country Transaction Metrics</h3>
      {loading && <p>Loading metrics...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && metrics.length > 0 && (
        <>
          <div className="mb-4">
            <h4 className="mb-3">Summary Table</h4>
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Total Profit</th>
                    <th>Total Txns</th>
                    <th>Failed Txns</th>
                    <th>Success Txns</th>
                    <th>Failure Rate (%)</th>
                    <th>Avg Interest Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.country_id}>
                      <td>{m.country_name}</td>
                      <td>{Number(m.total_profit).toFixed(2)}</td>
                      <td>{m.total_transactions}</td>
                      <td>{m.failed_transactions}</td>
                      <td>{m.success_transactions}</td>
                      <td>
                        {m.total_transactions > 0
                          ? ((m.failed_transactions / m.total_transactions) * 100).toFixed(2)
                          : "0.00"}
                      </td>
                      <td>{Number(m.avg_interest_rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <h4>Total Profit by Country</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartProfitData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit" fill="#40a700" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="col-md-6">
              <h4>Failure Rate by Country (%)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartFailureData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="failure_rate" fill="#a70000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountryMetricsDashboard;
