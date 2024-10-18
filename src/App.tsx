import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { 
  Device,
  Devices, 
  EditProfile, 
  Home, 
  Login, 
  Product, 
  Products, 
  Profile, 
  Rules, 
  Summary, 
  Users,
  Category,
  Location, 
} from './pages'
import { useTheme } from './context/Theme/ThemeContext'
import { useState } from 'react';
import { Footer, Sidebar } from './components/molecules';
import { GrSun } from "react-icons/gr";
import { FiMoon } from "react-icons/fi";
//import { FaUserCog } from "react-icons/fa";
import { Tooltip } from 'react-tooltip';
import { BiSolidUser } from "react-icons/bi";
import Swal from 'sweetalert2';
import { FaPowerOff } from "react-icons/fa6";

function App() {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const UserId = savedUserData.userId;
  const {theme , colors , toggleTheme} = useTheme();
  const [isCollapsed , setIsCollapsed] = useState<boolean>(false); 
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigate = (url:string) => {
    navigate(url);
  }

  const logOut = () => {
    Swal.fire({
        title: "",
        text: "Are you sure to log out?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor:theme === 'dark' ? "#86D293" : '#73EC8B',
        cancelButtonColor: theme === 'dark' ? "#B8001F" : "#C7253E" ,
        background:colors.primary[400],
        iconColor:colors.blueAccent[400],
        confirmButtonText: "Ok",
        color:colors.grey[100],
        allowOutsideClick: false
    }).then((result) => {
        if(result.isConfirmed){
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          if (userData) {
            delete userData.accessToken;
            localStorage.setItem('userData', JSON.stringify(userData));
        }
          navigate("/");
        }
    })
}


  return (
    <div className='flex w-full min-h-screen' style={{backgroundColor: theme=== 'dark' ? colors.primary[500]: "#fcfcfc"}}>
      <div  
        className='fixed h-[100vh] top-0 left-0 z-50'>
        {location.pathname !== "/" && (
          <Sidebar 
            isCollapsed={isCollapsed} 
            toggleSidebar={toggleSidebar} 
          />
        )}
      </div>
      <main
        className={`flex flex-col min-h-[100vh] ml-0 flex-1 pt-6 relative transition-all duration-500 overflow-y-auto ${
          location.pathname !== "/" && isCollapsed ? 'lg:ml-[60px]' : location.pathname !== "/" ? 'lg:ml-[250px]' : 'ml-0 items-center justify-center'
        }`}
      >
        <div
          className='fixed top-0 right-0 z-40 flex items-center justify-between w-full gap-6 px-8 py-4' 
          style={{
            color: colors.grey[100],
            backgroundColor:location.pathname != "/" ? colors.primary[400] : "" 
          }}
        >
          {location.pathname === "/" ? (
           <div className='w-[70px] h-[70px] mr-auto'>
              <img 
              src='/lsanda.svg'
              alt='icon'
              className='w-full h-full'
            />
           </div>
        ) : null}
        <div 
            className={`${location.pathname === "/" ? "" : "ml-auto"}`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <div
                className={`flex items-center cursor-pointer px-3 py-2 rounded-lg text-xl hover:text-purple-500 duration-300 transition-colors`}
                data-tooltip-id="theme"
                data-tooltip-content={`Change Theme`}
              >
                <FiMoon />
              </div>
            ): (
              <div
                className={`flex items-center cursor-pointer px-3 py-2 rounded-lg text-xl hover:text-purple-500 duration-300 transition-colors`}
                data-tooltip-id="theme"
                data-tooltip-content={`Change Theme`}
              >
                <GrSun />
              </div>
            )}
          </div>
        <div className={`${location.pathname === "/" ? "hidden" : null} flex items-center justify-end`}>
          {/* <div
            className={`
                ${location.pathname === "/edit-profile" ? "text-purple-500" : ""}
                flex items-center cursor-pointer px-3 py-2 rounded-lg text-xl hover:text-purple-500 duration-300 transition-colors
            `}
            onClick={() => handleNavigate(`/edit-profile`)}
            data-tooltip-id="edit"
            data-tooltip-content={`Edit Profile`}
          >
            <FaUserCog />
          </div> */}
          <div
            className={`
              ${location.pathname === `/users/${UserId}` ? "text-purple-500" : ""}
              flex items-center cursor-pointer px-3 py-2 rounded-lg text-xl hover:text-purple-500 duration-300 transition-colors
            `}
            onClick={() => handleNavigate(`/users/${UserId}`)}
            data-tooltip-id="view"
            data-tooltip-content={`View Profile`}
          >
            <BiSolidUser />
          </div>
          <div
            className={` 
              flex items-center cursor-pointer px-3 py-2 rounded-lg text-xl hover:text-purple-500 duration-300 transition-colors
            `}
            onClick={logOut}
            data-tooltip-id="logout"
            data-tooltip-content={`Log Out`}
          >
            <FaPowerOff />
          </div>
          </div>
        </div>
        <div className='px-8 pt-20 pb-36'>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/home' element={<Home />} />
          <Route path='/devices' element={<Devices />} />
          <Route path='/device/:deviceId' element={<Device />} />
          <Route path='/product' element={<Product />} />
          <Route path='/products' element={<Products />} />
          <Route path='/users/:userId' element={<Profile />} />
          <Route path='/rules' element={<Rules />} />
          <Route path='/summary' element={<Summary />} />
          <Route path='/users' element={<Users />} />
          <Route path='/edit-profile' element={<EditProfile />} />
          <Route path='/categories' element={<Category />} />
          <Route path='/locations' element={<Location />} />
        </Routes>
        </div>
        <div className='absolute bottom-0 w-full'>
          <Footer />
        </div>
      </main>
      {/* Tooltip Components */}
      <Tooltip id="theme" place='bottom' className='z-40' />
      <Tooltip id="edit" place='bottom' className='z-40' />
      <Tooltip id="view" place='bottom' className='z-40'  />
      <Tooltip id="logout" place='bottom-end' className='z-40'  />   
    </div>
  )
}

export default App
