// src/components/ChartCustomerGrowth.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function ChartCustomerGrowth({ data }) {
  if (!data || data.length === 0) {
    return <p>No customer growth data available.</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h4>Customer Growth Over Time</h4>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="newCustomers"
            name="New Customers"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
