import React, { useState , useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../context/Theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../../../context/BaseUrl/BaseUrlContext';
import axios from 'axios';

interface AreaChatProps {
    id:number
}

type Data = {
  id:string;
  name:string;
  count:number;
}

const AreaChartCom:React.FC<AreaChatProps> = ({id}) => {
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
      const response = await axios.get(`${baseUrl}/rules/all`, {
        headers: {
          token: `Bearer ${Token}`,
        },
      })

      if (response.data.status) {
        const processedData = processChartData(response.data.rules);
        setChartData(processedData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const processChartData = (rules: any[]): Data[] => {
    return rules.reduce((acc: Data[], rule: any) => {
      const firstName = rule.userName.split(' ')[0]; 
  
      const existingUser = acc.find((item: Data) => item.name === firstName);
  
      if (existingUser) {
        existingUser.count += 1;
      } else {
        acc.push({
          id: rule.userId,
          name: firstName,
          count: 1,
        });
      }
  
      return acc;
    }, []);
  };
  

  console.log(chartData);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          width={150} height={40} data={chartData}
        >
          <XAxis 
            dataKey="name" 
            tick={{ fill: colors.grey[100] }}
            axisLine={{stroke:colors.grey[100]}} />
          <YAxis 
            tick={{ fill: colors.grey[100] }} 
            axisLine={{stroke:colors.grey[100]}}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: colors.primary[400] }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          {id === 1 ? 
            <Area type="monotone" dataKey="count" stroke="#8884d8" fill={colors.blueAccent[400]} fillOpacity={0.3} />
          : <Area type="monotone" dataKey="pv" stroke="#8884d8" fill={colors.redAccent[400]} fillOpacity={0.3} />
          }
        </AreaChart>
      </ResponsiveContainer>
  )
}

export default AreaChartCom