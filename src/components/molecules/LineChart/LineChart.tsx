import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define the type for the data prop
interface LineChartProps {
  data: Array<{ dateCreated: string; itemCount: number; batteryPercentage: number }>;
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  console.log(data);
  return (
    <div style={{ width: '100%', height: 400}}>
      <ResponsiveContainer>
        <RechartsLineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dateCreated" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="itemCount" stroke="#8884d8" activeDot={{ r: 8 }} dot={{r:4}}/>
          <Line type="monotone" dataKey="batteryPercentage" stroke="#82ca9d" dot={{r:4}}/>
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
