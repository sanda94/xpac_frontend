import React, { useEffect, useState } from 'react';
import { AreaChartCom, PageHeader , Barchart} from '../../components/molecules';
import { useTheme } from '../../context/Theme/ThemeContext';
import './home.scss';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../../context/BaseUrl/BaseUrlContext';
import axios from 'axios';
import { useToast } from '../../context/Alert/AlertContext';

type Counts = {
  adminCount:string,
  modCount:string,
  customerCount:string,
  deviceCount:string
}

const Home: React.FC = () => {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const Token = savedUserData.accessToken;
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { baseUrl } = useBaseUrl();
  const [counts , setCounts] = useState<Counts>();
  const {notify} = useToast();
  const [isLoading , setLoading] = useState<boolean>(true); 

  if (colors) {
    document.documentElement.style.setProperty('--border-color', colors.grey[100]);
    document.documentElement.style.setProperty('--bg-color', colors.primary[400]);
  }

  useEffect(() => {
    if(!Token){
      navigate("/");
    }else{
      FetchData();
    }
  },[]);

  const FetchData = async () => {
    try {
      const countsResponse = await axios.get(`${baseUrl}/summary/count`, {
          headers: {
            token: `Bearer ${Token}`,
          },
        })
      if (countsResponse.data.status) {
        setCounts(countsResponse.data.data);
      }
    } catch (error:any) {
      console.log(error);
      notify(error.response.data.error.message, "error"); 
    }finally{
      setLoading(false);
    }
  };

  return (
    <div style={{ color: colors.grey[100] }}>
      <PageHeader title="HOME" subTitle="This is The Home Page." />
      {isLoading ? (
        <div style={{color:colors.grey[100]}} className='mt-10 text-lg font-semibold'>Loading...</div>
      ) : (
      <div className="grid gap-5 lg:grid-rows-10 grid-cols-1 xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 auto-rows-[minmax(180px, auto)] mt-5">
        {/* Totle Customers */}
        <div className="flex flex-col justify-between row-span-3 p-5 transition-all duration-300 rounded-lg box hover:scale-105">
          <div className='flex items-center justify-between gap-5 '>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="min-w-[50px] min-h-[50px] w-[50px] h-[50px]">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            
            <span className='text-md'>Total Customers</span>
          </div>
          <span className='text-5xl font-bold text-center lg:text-left' style={{ color: colors.greenAccent[400] }}>{counts?.customerCount}</span>
        </div>
        {/* Totle Admins */}
        <div className="flex flex-col justify-between row-span-3 p-5 transition-all duration-300 rounded-lg box hover:scale-105">
          <div className='flex items-center justify-between gap-5'>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="min-w-[50px] min-h-[50px] w-[50px] h-[50px]">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            
            <span className='text-md'>Total Admins</span>
          </div>
          <span className='text-5xl font-bold text-center lg:text-left' style={{ color: colors.greenAccent[400] }}>{counts?.adminCount}</span>
        </div>
        {/* Totle Moderators */}
        <div className="flex flex-col justify-between row-span-3 p-5 transition-all duration-300 rounded-lg box hover:scale-105">
          <div className='flex items-center justify-between gap-5'>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="min-w-[50px] min-h-[50px] w-[50px] h-[50px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
 
            <span className='text-md text-wrap'>Total Moderators</span>
          </div>
          <span className='text-5xl font-bold text-center lg:text-left' style={{ color: colors.greenAccent[400] }}>{counts?.modCount}</span>
        </div>
        {/* Totle Devices */}
        <div className="flex flex-col justify-between row-span-3 p-5 transition-all duration-300 rounded-lg box hover:scale-105">
          <div className='flex items-center justify-between gap-5'>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="min-w-[50px] min-h-[50px] w-[50px] h-[50px]">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 0 1 0 9.424m-4.138-5.976a3.736 3.736 0 0 0-.88-1.388 3.737 3.737 0 0 0-1.388-.88m2.268 2.268a3.765 3.765 0 0 1 0 2.528m-2.268-4.796a3.765 3.765 0 0 0-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9.027 9.027 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.014 9.014 0 0 1-9.424 0m5.976-4.138a3.765 3.765 0 0 1-2.528 0m0 0a3.736 3.736 0 0 1-1.388-.88 3.737 3.737 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 0 1-1.652-1.306 9.027 9.027 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.014 9.014 0 0 1 0-9.424m4.138 5.976a3.765 3.765 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 0 0-1.652 1.306A9.025 9.025 0 0 0 4.33 7.288" />
              </svg>
            
            <span className='text-md'>Total Devices</span>
          </div>
          <span className='text-5xl font-bold text-center lg:text-left' style={{ color: colors.greenAccent[400] }}>{counts?.deviceCount}</span>
        </div>
        <div className="flex flex-col items-center justify-between col-span-1 row-span-6 p-5 rounded-lg lg:col-span-2 md:col-span-2 box ">
          <span 
            className='py-2 font-semibold lg:text-xl' 
            style={{ color: colors.grey[100] }}
            >Devices Count of Recent Customers (30 Days)</span>
            <AreaChartCom />
        </div>
        <div className="flex flex-col items-center justify-between col-span-1 row-span-6 p-5 rounded-lg lg:col-span-2 md:col-span-2 box">
          <span 
              className='py-2 font-semibold text-center lg:text-xl' 
              style={{ color: colors.grey[100] }}
              >Statistics of Recent Devices</span>
            <Barchart />
        </div>
      </div>
    )}
    </div>
  );
};

export default Home;
