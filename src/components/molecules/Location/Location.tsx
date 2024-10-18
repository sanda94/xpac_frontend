import React, { useState , useEffect } from "react";
import Swal from "sweetalert2";
import "./location.scss";
import { useTheme } from "../../../context/Theme/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useBaseUrl } from "../../../context/BaseUrl/BaseUrlContext";
import { useToast } from "../../../context/Alert/AlertContext";

// ---------- Rule Data Interface ----------
interface LocationData {
    _id: string | undefined,
    location:string | undefined,
    description: string | undefined,
};

// ---------- Rule Interface ----------
interface LocationProps {
    onClose: () => void,
    locationData: LocationData | null,
    fetchData: () => void,
}
const LocationPopup: React.FC<LocationProps> = ({ onClose, locationData , fetchData }) => {
    const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const Token = savedUserData.accessToken;
    const [location , setLocation] = useState<LocationData>({
        _id:locationData?._id,
        location:locationData?.location,
        description:locationData?.description
    })
    const { colors, theme } = useTheme();
    const navigate = useNavigate();
    const { baseUrl } = useBaseUrl();
    const { notify } = useToast();

    useEffect(() => {
        if(!Token){
          navigate("/");
        }
      },[Token]);

    const handleSave = () => {
        Swal.fire({
            title: "",
            text: "Are you sure to Update Location?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: theme === 'dark' ? "#86D293" : '#73EC8B',
            cancelButtonColor: theme === 'dark' ? "#B8001F" : "#C7253E",
            background: colors.primary[400],
            iconColor: colors.blueAccent[400],
            confirmButtonText: "Ok",
            color: colors.grey[100],
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                UpdateCategory();
            }
        });
    };    

    const UpdateCategory = async() => {
        const data = {
           location:location.location,
           description:location.description
        }

        try { 
            const response = await axios.put(`${baseUrl}/locations/update/${location._id}`, data,{
                headers: {
                    token: `Bearer ${Token}`,
                  }
            });
            if(response.data.status){
                Swal.fire({
                    title: "",
                    text: "Update Location Successfully!",
                    icon: "success",
                    showCancelButton: false,
                    confirmButtonColor: theme === 'dark' ? "#86D293" : '#73EC8B',
                    background: colors.primary[400],
                    iconColor: "#06D001",
                    confirmButtonText: "Ok",
                    color: colors.grey[100],
                    allowOutsideClick: false
                })
                fetchData();
                onClose();
            }           
        } catch (error) {
            console.log(error);
            notify("An unexpected error occurred. Please try again later.", "error"); 
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full p-6 text-black lg:max-[90vh] md:max-h-[85vh] max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg lg:w-2/3">
                <h2 className="mb-4 text-lg font-bold text-center text-black">Edit Location</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Conditionally hide based on the URL path */}
                    <div>
                    <label className='w-full font-semibold text-[13px]'>Category</label>
                    <input
                        type="text"
                        name="category"
                        placeholder="Location"
                        value={location.location}
                        onChange={(e) => setLocation({...location , location:e.target.value})}
                        className="w-full p-2 mt-2 text-[12px] border rounded-md"
                    />
                    </div>
                    <div>
                    <label className='w-full font-semibold text-[13px]'>Description</label>
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={location.description}
                        onChange={(e) => setLocation({...location , description:e.target.value})}
                        className="w-full p-2 mt-2 text-[12px] border rounded-md"
                    />
                    </div>
                </div>

                <div className="flex justify-end mt-6 space-x-4">
                    <button
                        className="px-4 py-3 bg-gray-300 rounded-md hover:bg-gray-400 text-[12px] w-full"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 text-[12px] w-full"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPopup;
