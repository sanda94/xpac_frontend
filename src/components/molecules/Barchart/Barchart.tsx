import React , { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Rectangle } from 'recharts';
import { useTheme } from '../../../context/Theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../../../context/BaseUrl/BaseUrlContext';
import axios from 'axios';

  type Data = {
    title:string,
    itemCount:number,
    batteryPercentage:string
  }

const Barchart:React.FC = () => {
    const {colors} = useTheme();
    const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const Token = savedUserData.accessToken;
    const navigate = useNavigate();
    const { baseUrl } = useBaseUrl();
    const [data , setData] = useState<Data[]>([]);

    useEffect(() => {
      if(!Token){
        navigate("/");
      }else{
        FetchData();
      }
    },[Token]);
  
    const FetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/chart/bar-chart`, {
            headers: {
              token: `Bearer ${Token}`,
            },
          })

        if(response.data.status){
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
  return (
    
        <ResponsiveContainer width="100%" height={300}>
            <BarChart width={150} height={40} data={data}>
              <XAxis 
                  dataKey="title" 
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