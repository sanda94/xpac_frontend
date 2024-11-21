import React, { useEffect, useState } from 'react'
import { useTheme } from '../../context/Theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/Alert/AlertContext';
import axios from "axios";
import { useBaseUrl } from '../../context/BaseUrl/BaseUrlContext';

const Login: React.FC = () => {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  console.log(savedUserData);
  const [UserDetails, setUserDetails] = useState({
    emailAddress: savedUserData.emailAddress,
    password: savedUserData.password,
    accessToken: savedUserData.accessToken
  });

  const { notify } = useToast();
  const navigate = useNavigate();
  const { baseUrl } = useBaseUrl();

  useEffect(() => {
    if(UserDetails.accessToken){
      navigate("/home")
    }
  },[UserDetails.accessToken])
  
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handelLoginButton = () => {
    if(!UserDetails.emailAddress && !UserDetails.password){
      notify('Enter Email Address and Password before click Login button.' , 'warning');
    } else if(!UserDetails.emailAddress){
      notify('Email Address is required.' , 'warning');
    }else if (!isValidEmail(UserDetails.emailAddress)) {
      notify('Please enter a valid Email Address.', 'warning');
    }else if(!UserDetails.password){
      notify('Password is required.' , 'warning');
    } else{
      Login();
    }
  }

  const Login = async() => {
    try {
      const response = await axios.post(
          `${baseUrl}/users/login`, {
            emailAddress: UserDetails.emailAddress,
            password: UserDetails.password
          });
      if(response.data.status){
        if(response.data.userType === "Customer"){
          navigate("/summary");
        }else{
          navigate("/home");
        }
       
        localStorage.setItem('userData' , JSON.stringify({
          emailAddress: UserDetails.emailAddress,
          userId:response.data.userId,
          userType:response.data.userType,
          accessToken:response.data.accessToken
        }) ,);
      }else{
        notify(response.data.error.message , "error");
      }
    } catch (error:any) {
      console.log(error);
      notify(error.response.data.error.message, "error"); 
    }
  }

  const { theme } = useTheme();

  return (
    <div
      className="flex items-center justify-center min-w-[350px]"
    >
      <div className={`w-full max-w-sm p-8 rounded-lg shadow-lg text-black ${theme === 'dark' ? "bg-white" : "bg-gray-200"}`} 
      >
        <h1 className="mb-6 text-2xl font-semibold text-center text-black">Login</h1>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm ">Email Address</label>
          <input
            type="email"
            className="w-full px-3 py-2 leading-tight text-[12px] text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            placeholder="Enter your email"
            value={UserDetails.emailAddress}
            onChange={(e) => setUserDetails({ ...UserDetails, emailAddress: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 leading-tight text-[12px] text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
            value={UserDetails.password}
            onChange={(e) => setUserDetails({ ...UserDetails, password: e.target.value })}
          />
        </div>

        <button
          className="w-full px-3 py-2 text-[12px] font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          type="button"
          onClick={handelLoginButton}
        >
          Login
        </button>
        {/* <p className='text-[12px] cursor-pointer text-black text-center mt-4 hover:text-gray-500'>Forgot Password?</p> */}
      </div>
    </div>
  );
};

export default Login;
