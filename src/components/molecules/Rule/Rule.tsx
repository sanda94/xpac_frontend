import React, { useState , useEffect } from "react";
import Swal from "sweetalert2";
import "./rule.scss";
import { useTheme } from "../../../context/Theme/ThemeContext";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useBaseUrl } from "../../../context/BaseUrl/BaseUrlContext";
import { useToast } from "../../../context/Alert/AlertContext";

// ---------- Rule Data Interface ----------
interface RuleData {
    _id: string | undefined,
    userId:string | undefined,
    userName: string | undefined,
    deviceId:string | undefined,
    deviceName: string | undefined,
    imageUrl:string | undefined,
    emailStatus: string | undefined
};

type Device = {
    _id:string,
    title:string,
  }
  
  type User = {
    _id:string,
    fullName:string,
  }

// ---------- Rule Interface ----------
interface RuleProps {
    onClose: () => void,
    ruleData: RuleData | null,
    fetchData: () => void,
}

const RulePopup: React.FC<RuleProps> = ({ onClose, ruleData , fetchData }) => {
    const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const Token = savedUserData.accessToken;
    const UserType = savedUserData.userType;
    const [rule , setRule] = useState<RuleData>({
        _id:ruleData?._id,
        deviceId:ruleData?.deviceId,
        deviceName:ruleData?.deviceName,
        userId:ruleData?.userId,
        userName:ruleData?.userName,
        imageUrl:ruleData?.imageUrl,
        emailStatus:ruleData?.emailStatus,
    })
    const { colors, theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { baseUrl } = useBaseUrl();
    const [users , setUsers] = useState<User[]>([]);
    const [devices , setDevices] = useState<Device[]>([]);
    const [image , setImage] = useState<File | null>()
    const { notify } = useToast();
    
    console.log("Rule Data ",ruleData);

    useEffect(() => {
        if(!Token){
          navigate("/");
        }else{
          FetchData();
        }
      },[Token]);

      const FetchData = async () => {
        try {
          const [usersResponse, devicesResponse] = await Promise.all([
            axios.get(`${baseUrl}/users/all/nonadmin`, {
              headers: {
                token: `Bearer ${Token}`,
              },
            }),
            axios.get(`${baseUrl}/device/all`, {
              headers: {
                token: `Bearer ${Token}`,
              },
            })
          ]);
      
          if (usersResponse.data.status && devicesResponse.data.status) {
            setUsers(usersResponse.data.nonAdminUsers);
            setDevices(devicesResponse.data.devices);
          } else {
            notify("Failed to fetch data. Please try again later.", "error");
          }
        } catch (error:any) {
          console.log(error);
          notify(error.response.data.error.message, "error"); 
        }
      };

    const handleSave = () => {
        Swal.fire({
            title: "",
            text: "Are you sure to Update Rule?",
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
                UpdateRule();
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "file") {
            const file = e.target.files?.[0] || null;
            setImage(file);
        } else {
            switch (name) {
                case "userName":
                    setRule({...rule , userName:value})
                    break;
                case "deviceName":
                    setRule({...rule , deviceName:value});
                    break;
                case "status":
                    setRule({...rule , emailStatus:value});
                    break;
                default:
                    break;
            }
        }
    };

    const DeleteImage = async(url:any) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        try {
          console.log(fileName);
          await axios.delete(`${baseUrl}/files/delete/${fileName}`,{
            headers: {
              token: `Bearer ${Token}`,
            },
          })
        } catch (error:any) {
          console.log(error);
          //notify(error.response.data.error.message, "error"); 
        }
      }
    
    
      const ImageUpload = async() => {
        if(!image){
          return null;
        }
        if(rule.imageUrl !== null){
          DeleteImage(rule.imageUrl);
        }
        const data = {
          file:image
        }
        try {
          const response = await axios.post(`${baseUrl}/files/save`, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              token: `Bearer ${Token}`,
            },
          });
          return response.data.fileName;
        } catch (error:any) {
          console.log(error);
          //notify(error.response.data.error.message, "error"); 
        }
      }

    const UpdateRule = async() => {
        const ImageUrl = await ImageUpload();
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        const data = {
            deviceId:rule.deviceId,
            deviceName:rule.deviceName,
            userId:rule.userId,
            userName:rule.userName,
            imageUrl:ImageUrl !== null ? `https://xpacc.online/uploads/${ImageUrl}`: rule.imageUrl,
            emailStatus:rule.emailStatus,
            dateUpdated:date,
            timeUpdated:time,
        }

        try { 
            const response = await axios.put(`${baseUrl}/rules/update/${rule._id}`, data,{
                headers: {
                    token: `Bearer ${Token}`,
                  }
            });
            if(response.data.status){
                Swal.fire({
                    title: "",
                    text: "Update Rule Successfully!",
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
        } catch (error:any) {
          console.log(error);
          notify(error.response.data.error.message, "error"); 
        }
    }

    console.log(rule);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full p-6 text-black lg:max-[90vh] md:max-h-[85vh] max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg lg:w-2/3">
                <h2 className="mb-4 text-lg font-bold text-center text-black">Edit Rule</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Conditionally hide based on the URL path */}
                    {!location.pathname.includes("/user") &&  UserType !== "Customer" && (
                        <div>
                        <label className='w-full font-semibold text-[13px]'>User Name</label>
                        <select
                            name="status"
                            className="w-full p-2 mt-2 text-[12px] border rounded-md"
                            value={rule.userId}
                            onChange={(e) => setRule({...rule , userId:e.target.value , userName:e.target.selectedOptions[0].text})}
                          >
                            {users.length > 0 && users.map((user) =>(
                                <option key={user._id} value={user._id}>{user.fullName}</option>
                            ))}
                          </select>
                        </div>
                    )}
                    {!location.pathname.includes("/device") && UserType !== "Customer" && (
                        <div>
                            <label className='w-full font-semibold text-[13px]'>Device Title</label>
                            <select
                                name="status"
                                className="w-full p-2 mt-2 text-[12px] border rounded-md"
                                value={rule.deviceId}
                                onChange={(e) => setRule({...rule , deviceId:e.target.value , deviceName:e.target.selectedOptions[0].text})}
                                >
                                {devices.length > 0 && devices.map((device) =>(
                                    <option key={device._id} value={device._id}>{device.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                    <label className='w-full font-semibold text-[13px]'>Choose Image</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        className="w-full p-2 mt-2 text-[12px] border rounded-md"
                    />
                    </div>
                    <div>
                    <label className='w-full font-semibold text-[13px]'>Send Email</label>
                    <select
                        name="status"
                        value={rule.emailStatus}
                        onChange={(e) => setRule({...rule , emailStatus:e.target.value})}
                        className="w-full p-2 mt-2 text-[12px] border rounded-md"
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
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

export default RulePopup
