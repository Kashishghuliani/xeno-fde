// src/components/ChartOrdersByDate.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function ChartOrdersByDate({ data }) {
  if (!data || data.length === 0) {
    return <p>No order data available.</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h4>Orders & Revenue by Date</h4>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          {/* Left Y-axis for order count */}
          <YAxis yAxisId="left" orientation="left" />
          {/* Right Y-axis for revenue */}
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip formatter={(value, name) => {
            if (name === 'Revenue') return [`₹${value}`, name];
            return [value, name];
          }} />
          {/* Orders */}
          <Bar yAxisId="left" dataKey="orderCount" fill="#8884d8" name="Orders" />
          {/* Revenue */}
          <Bar yAxisId="right" dataKey="totalRevenue" fill="#82ca9d" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
