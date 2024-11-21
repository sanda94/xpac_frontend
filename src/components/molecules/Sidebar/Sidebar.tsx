import React, { useState } from 'react';
import { useTheme } from '../../../context/Theme/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser , FaBars, FaClipboardList } from 'react-icons/fa';
import { PiPresentationChartFill } from 'react-icons/pi';
import { MdOutlineAddLocationAlt } from "react-icons/md";
import { TbCategoryPlus } from "react-icons/tb";
import { BsCpuFill } from 'react-icons/bs';
import { CgArrowRightO, CgArrowLeftO } from 'react-icons/cg';
import { Tooltip } from 'react-tooltip';
import { Images } from '../../../constants';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
    const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const UserType = savedUserData.userType;
    const { colors } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigate = (url: string) => {
        if(url === "/"){
            if(window.confirm("Are you sure to log out?")){
                navigate(url);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
            } else{
                return;
            }
        }        
        else{
            navigate(url);
            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
       }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeSidebar = () => {
        setIsMobileMenuOpen(false);
    };

    
    const mainMenuItems = [
        ...(UserType !== 'Customer' ? [{ name: 'Home', icon: <FaHome />, path: '/home' }] : []),
        { name: 'Summary', icon: <PiPresentationChartFill />, path: '/summary' },
    ];

    const generalMenuItems = [
        ...(UserType !== 'Customer' ? [{ name: 'Users', icon: <FaUser />, path: '/users' }] : []),
        { name: 'Devices', icon: <BsCpuFill />, path: '/devices' },
        ...(UserType === "Admin" ? [{ name: 'Rules', icon: <FaClipboardList />, path: '/rules' }]: []),
        ...(UserType === 'Admin' ? [{ name: 'Category', icon: <TbCategoryPlus />, path: '/categories' }] : []),
        ...(UserType === 'Admin' ? [{ name: 'Location', icon: <MdOutlineAddLocationAlt />, path: '/locations' }] : []),
    ];

    return (
        <div className='lg:h-full min-h-[100vh]'>
            {!isMobileMenuOpen && (
                <div 
                    className="fixed z-50 mt-[10px] lg:hidden top-4 left-9"
                    style={{color:colors.grey[100]}}    
                >
                    <button onClick={toggleMobileMenu} className="text-xl transition-colors duration-300 hover:text-purple-500">
                        <FaBars />
                    </button>
                </div>
            )}

            {/* Sidebar container */}
            <div
                className={`fixed top-0 left-0 z-40 h-full text-${colors.grey[100]} transition-all duration-300
                    ${isCollapsed ? 'w-16' : 'w-64'}
                    ${isMobileMenuOpen ? 'w-64' : ''}
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:relative lg:flex flex-col lg:min-h-screen`}
                style={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}
            >
                {/* Sidebar Title */}
                <div className="flex items-center justify-between p-4 mt-3 text-xl font-bold ">
                    {!isCollapsed ? 'XPAC' : ''}
                    <button onClick={isMobileMenuOpen ? closeSidebar : toggleSidebar} className="text-2xl text-center transition-colors duration-300 focus:outline-none hover:text-purple-500">
                        {isMobileMenuOpen ? <CgArrowLeftO /> : isCollapsed ? <CgArrowRightO /> : <CgArrowLeftO />}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className='flex items-center justify-center w-full mt-5 mb-5'>
                    <img 
                        className='w-[130px] h-auto'
                        alt='Logo'
                        src={Images.logo}
                    />
                </div>
                )}

                <ul className={`px-2 mt-3 space-y-2 ${!isCollapsed ? "mb-5" : "mb-0"}`}>
                    <span style={{color:colors.grey[100]}} className={`font-bold px-2 ${isCollapsed ? 'hidden' : ''}`}>MAIN</span>
                    {mainMenuItems.map((item, index) => (
                        <li
                            key={index}
                            className={`flex items-center cursor-pointer px-3 py-[5px] rounded-lg hover:text-purple-500 duration-300 transition-colors ${
                                location.pathname === item.path ? `text-purple-500` : ''
                            } ${!isCollapsed ? "ml-5" : "ml-0"}`}
                            onClick={() => handleNavigate(item.path)}
                        >
                            <span className="text-xl"
                            data-tooltip-id={`${item.name}TooltipId`}
                            data-tooltip-content={`${item.name} Page`}
                            >{item.icon}</span>
                            {(!isCollapsed || isMobileMenuOpen) && (
                                <span className="ml-4 font-medium">{item.name}</span>
                            )}
                            {isCollapsed && !isMobileMenuOpen && (
                                <Tooltip id={`${item.name}TooltipId`} place='right' />
                            )}
                        </li>
                    ))}
                </ul>

                <ul className={`flex-grow px-2 space-y-2`}>
                    <span style={{color:colors.grey[100]}} className={`font-bold px-2 ${isCollapsed ? 'hidden' : ''}`}>GENERAL</span>
                    {generalMenuItems.map((item, index) => (
                        <li
                            key={index}
                            className={`flex items-center cursor-pointer px-3 py-2 rounded-lg hover:text-purple-500 duration-300 transition-colors ${
                                location.pathname === item.path ? `text-purple-500` : ''
                            } ${!isCollapsed ? "ml-5" : "ml-0"}`}
                            onClick={() => handleNavigate(item.path)}
                        >
                            <span className="text-xl"
                            data-tooltip-id={`${item.name}TooltipId`}
                            data-tooltip-content={`${item.name} Page`}
                            >{item.icon}</span>
                            {(!isCollapsed || isMobileMenuOpen) && (
                                <span className="ml-4 font-medium">{item.name}</span>
                            )}
                            {isCollapsed && !isMobileMenuOpen && (
                                <Tooltip id={`${item.name}TooltipId`} place='right' />
                            )}
                        </li>
                    ))}
                </ul>

                {/* Logout */}
                {/* <div className="px-4 py-2">
                    <button
                        className="flex items-center justify-center w-full py-2 text-center text-white bg-red-600 rounded-lg"
                        onClick={logOut}
                        data-tooltip-id={`LogOutTooltipId`}
                        data-tooltip-content={`Log Out`}
                    >
                        {isCollapsed ? <FaSignOutAlt /> : isMobileMenuOpen ? "Log Out" : "Log Out"}
                        {isCollapsed && !isMobileMenuOpen && (
                                <Tooltip id={`LogOutTooltipId`} place='right' />
                            )}
                    </button>
                </div> */}
            </div>

            {/* Background overlay for mobile when sidebar is open */}
            {isMobileMenuOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                ></div>
            )}
        </div>
    );
};

export default Sidebar;
