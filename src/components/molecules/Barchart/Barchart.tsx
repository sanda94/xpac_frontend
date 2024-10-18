import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Rectangle } from 'recharts';
import { useTheme } from '../../../context/Theme/ThemeContext';

// ---------- Sample test data ----------
const data = [
    {
      name: 'Device 1',
      itemCount: 30,
      batteryPercentage: 66,
      amt: 2400,
    },
    {
      name: 'Device 2',
      itemCount: 15,
      batteryPercentage: 98,
      amt: 2210,
    },
    {
      name: 'Device 3',
      itemCount: 28,
      batteryPercentage: 45,
      amt: 2290,
    },
    {
      name: 'Device 4',
      itemCount: 32,
      batteryPercentage: 18,
      amt: 2000,
    },
    {
      name: 'Device 5',
      itemCount: 8,
      batteryPercentage: 76,
      amt: 2181,
    },
  ];

const Barchart:React.FC = () => {
    const {colors} = useTheme();
  return (
    
        <ResponsiveContainer width="100%" height={300}>
            <BarChart width={150} height={40} data={data}>
              <XAxis 
                  dataKey="name" 
                  tick={{ fill: colors.grey[100] }}
                  axisLine={{stroke:colors.grey[100]}}/>
              <YAxis 
                  tick={{ fill: colors.grey[100] }} 
                  axisLine={{stroke:colors.grey[100]}}/>
              <Tooltip 
                  contentStyle={{ backgroundColor: colors.primary[400] }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} 
              />
              <Bar 
                  dataKey="itemCount" 
                  fill={colors.redAccent[400]}
                  activeBar={<Rectangle fill='gold' stroke='gold' />} 
                  name="Items Count"
              />
              <Bar 
                  dataKey="batteryPercentage" 
                  fill={colors.greenAccent[400]}
                  activeBar={<Rectangle fill='gold' stroke='gold' />}
                  name="Battery Percentage" 
              />
            </BarChart>
        </ResponsiveContainer>
  )
}

export default Barchart