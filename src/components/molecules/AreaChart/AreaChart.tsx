import React, { useState , useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../context/Theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../../../context/BaseUrl/BaseUrlContext';
import axios from 'axios';

type Data = {
  userName:string;
  deviceCount:number;
}

const AreaChartCom:React.FC = () => {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const Token = savedUserData.accessToken;
  const {colors} = useTheme();
  const [chartData, setChartData] = useState<Data[]>([]);
  const navigate = useNavigate();
  const { baseUrl } = useBaseUrl();

  useEffect(() => {
    if(!Token){
      navigate("/");
    }else{
      FetchData();
    }
  },[Token]);

  const FetchData = async() => {
    try {
      const response = await axios.get(`${baseUrl}/chart/area-chart`, {
        headers: {
          token: `Bearer ${Token}`,
        },
      })

      if (response.data.status) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          width={150} height={40} data={chartData}
        >
          <XAxis 
            dataKey="userName" 
            tick={{ fill: colors.grey[100] }}
            axisLine={{stroke:colors.grey[100]}} />
          <YAxis 
            tick={{ fill: colors.grey[100] }} 
            axisLine={{stroke:colors.grey[100]}}
            tickFormatter={(value) => Math.round(value).toString()}
            tickCount={2}
            domain={[0, 1]} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: colors.primary[400] }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
            <Area type="monotone" dataKey="deviceCount" stroke="#8884d8" fill={colors.blueAccent[400]} fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
  )
}

export default AreaChartCom