import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCharges, setStartDate, setEndDate } from './transactionChargesSlice';

const DailyChargesChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, startDate, endDate } = useAppSelector((state) => state.transactionCharges);

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Transform data to recharts format
  const currencies = React.useMemo(() => {
    if (!data) return [];
    const countrySet = new Set<string>();
    Object.values(data).forEach((day) => {
      Object.keys(day).forEach((c) => countrySet.add(c));
    });
    return Array.from(countrySet);
  }, [data]);

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([date, charges]) => ({
      date,
      ...charges,
    }));
  }, [data]);

  useEffect(() => {
    dispatch(fetchCharges({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  return (
    <div className="container mt-4">
      <h3>Daily Profits (Country Wise)</h3>
      <div className="row mb-3 align-items-center">
        <div className="col-auto">
          <label>Start Date:</label>
          <DatePicker
            selected={start}
            onChange={(date) => date && dispatch(setStartDate(date.toISOString().split('T')[0]))}
            maxDate={new Date()}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="col-auto">
          <label>End Date:</label>
          <DatePicker
            selected={end}
            onChange={(date) => date && dispatch(setEndDate(date.toISOString().split('T')[0]))}
            maxDate={new Date()}
            minDate={start}
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>
      {loading && <p>Loading chart...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {currencies.map((country) => (
              <Bar
                key={country}
                dataKey={country}
                stackId="a"
                fill={`#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DailyChargesChart;
