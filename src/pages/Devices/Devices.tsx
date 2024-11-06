import React, { useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useTheme } from '../../context/Theme/ThemeContext';
import { DataTable, PageHeader } from '../../components/molecules';
import { Images } from '../../constants';
import Swal from 'sweetalert2';
import { useToast } from '../../context/Alert/AlertContext';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../../context/BaseUrl/BaseUrlContext';
import axios from 'axios';

type Device = {
  _id:string,
  title:string,
  category: string;
  imageUrl: File | null;
  location:string;
  unitWeight:string;
  assignProduct: string;
  minItems: string;
  minBatteryPercentage: string;
  minBatteryVoltage: string;
  status: string;
  refilingStatus:string;
  description: string;
  message: string;
}

interface FormData {
  title: string;
  category: string;
  image: File | null;
  assignProduct: string;
  location:string;
  unitWeight:string;
  minItemsCount: string;
  minBatteryPercentage: string;
  minBatteryVoltage: string;
  status: string;
  description: string;
  message: string;
}

type Category = {
  category:string
}

type Location = {
  location:string
}

const Devices: React.FC = () => {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const UserType = savedUserData.userType;
  const Token = savedUserData.accessToken;
  const UserId = savedUserData.userId;
  const { baseUrl } = useBaseUrl();
  const { colors, theme } = useTheme();
  const [deviceData, setDeviceData] = useState<Device[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const { notify } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category:'Category 1',
    image:null,
    assignProduct:'',
    location:'',
    unitWeight:'',
    minItemsCount: '',
    minBatteryPercentage:'',
    minBatteryVoltage:'',
    status:'Active',
    description: '',
    message:'',
  });
  const [categories , setCategories] = useState<Category[]>([])
  const [locations , setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if(!Token){
      navigate("/");
    }else{
      FetchData();
      GetCategories();
      GetLocations();
    }
  },[Token]);

  const FetchData = async() => {
    try {
      const url = UserType === "Customer" ? `${baseUrl}/device/all/${UserId}` :  `${baseUrl}/device/all`;
      const response = await axios.get(
        url,{
          headers: {
            token: `Bearer ${Token}`,
          },
        });
      if(response.data.status){
          setDeviceData(response.data.devices);
      }else{
        notify(response.data.error.message , 'error');
      }
    } catch (error) {
      console.log(error);
      notify("An unexpected error occurred. Please try again later.", "error");
    }
  }

  const GetCategories = async() => {
    try {
      const response = await axios.get(
        `${baseUrl}/categories/all`,{
          headers: {
            token: `Bearer ${Token}`,
          },
        });
      if(response.data.status){
          setCategories(response.data.categories);
      }else{
        notify(response.data.error.message , 'error');
      }
    } catch (error) {
      console.log(error);
      notify("An unexpected error occurred. Please try again later.", "error");
    }
  };

  const GetLocations = async() => {
    try {
      const response = await axios.get(
        `${baseUrl}/locations/all`,{
          headers: {
            token: `Bearer ${Token}`,
          },
        });
      if(response.data.status){
        setLocations(response.data.locations);
      }else{
        notify(response.data.error.message , 'error');
      }
    } catch (error) {
      console.log(error);
      notify("An unexpected error occurred. Please try again later.", "error");
    }
  }

  const HandleStatus = async(id: string, newStatus: string) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to update device status?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: theme === 'dark' ? "#86D293" : '#73EC8B',
      cancelButtonColor: theme === 'dark' ? "#B8001F" : "#C7253E",
      background: colors.primary[400],
      iconColor: colors.blueAccent[400],
      confirmButtonText: "Ok",
      color: colors.grey[100],
      allowOutsideClick: false
  }).then(async(result) => {
      if (result.isConfirmed) {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];
        const data = {
          status:newStatus,
          dateUpdated:date,
          timeUpdated:time
        }
        console.log("data" , data) ;
        try {
          const response = await axios.put(`${baseUrl}/device/update/${id}` , data , {
            headers:{
              token:`Bearer ${Token}`
            }
          })
          console.log(response);
          if(response.data.status){
            Swal.fire({
              title: "",
              text: "Device Status Updated Successfully!",
              icon: "success",
              showCancelButton: false,
              confirmButtonColor: theme === 'dark' ? "#86D293" : '#73EC8B',
              background: colors.primary[400],
              iconColor: "#06D001",
              confirmButtonText: "Ok",
              color: colors.grey[100],
              allowOutsideClick: false
            });
            FetchData()
          }
        } catch (error) {
          console.log(error);
          notify("An unexpected error occurred. Please try again later.", "error"); 
        }
      }
  });
  }

  const HandleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      setFormData((prevUser) => ({
        ...prevUser,
        image: files[0],
      }));
    }
  };

  const isNumberValid = (number: string) => {
    const numberRegex = /^\d+$/;
    return numberRegex.test(number);
  };

  const handleFormSubmit = () => {

    // Validate minCounts
   if (!isNumberValid(formData.minItemsCount)) {
        notify('Please enter a valid Minimum Items Count.', 'warning');
        return;
    }
    if (!isNumberValid(formData.minBatteryPercentage)) {
      notify('Please enter a valid Minimum Battery Percentage.', 'warning');
      return;
  }
  if (!isNumberValid(formData.minBatteryVoltage)) {
    notify('Please enter a valid Minimum Battery Voltage.', 'warning');
    return;
}
    Swal.fire({
        title: "",
        text: "Are you sure you want to Create New Device?",
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
          CreateDevice();
        }
    });
};

const ImageUpload = async() => {
  if(formData.image === null){
    return null;
  }
  const data = {
    file:formData.image
  }
  try {
    const response = await axios.post(`${baseUrl}/files/save`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: `Bearer ${Token}`,
      },
    });
    return response.data.fileName;
  } catch (error) {
    console.log(error);
  }
}

const CreateDevice = async() => {
  try {
    const ImageUrl = await ImageUpload();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

  const data = {
    title:formData.title,
    category:formData.category,
    assignProduct:formData.assignProduct,
    location:formData.location,
    unitWeight:formData.unitWeight,
    minItems:formData.minItemsCount,
    minBatteryPercentage:formData.minBatteryPercentage,
    minBatteryVoltage:formData.minBatteryVoltage,
    status:formData.status,
    imageUrl:ImageUrl !== null ? `http://localhost:3300/uploads/${ImageUrl}` : null,
    refilingStatus:"None",
    description:formData.description,
    message:formData.message,
    dateCreated:date,
    timeCreated:time,
    dateUpdated:date,
    timeUpdated:time
  }
  const response = await axios.post(`${baseUrl}/device/create`, data , {
    headers:{
      token: `Bearer ${Token}`
    }
  })

  if(response.data.status){
      Swal.fire({
        title: "",
        text: "New Device Created Successfully!",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: theme === 'dark' ? "#86D293" : '#73EC8B',
        background: colors.primary[400],
        iconColor: "#06D001",
        confirmButtonText: "Ok",
        color: colors.grey[100],
        allowOutsideClick: false
      });
      FetchData()
      setIsFormOpen(false);
  }
  } catch (error:any) {
    console.log(error);
    notify(error.response.data.error.message, "error"); 
  }
}

const columns: GridColDef[] = [
  {
    field: '_id',
    headerName: 'Id',
    minWidth:250
  },
  {
    field: 'imageTitle',
    headerName: 'Device',
    minWidth:150,
    renderCell: (params: any) => {
      return (
        <div className="flex items-center w-full h-full space-x-3">
          <img
            className="w-[40px] h-[40px] object-cover rounded-full"
            src={params.row.imageUrl
              ? params.row.imageUrl
              : Images.unknownDevice}
            alt="Device Image"
          />
          <span>{params.row.title}</span>
        </div>
      );
    },
  },
  {
    field: 'assignProduct',
    headerName: 'Assign Product',
    minWidth:200
  },
  {
    field: 'location',
    headerName: 'Location',
    minWidth:200
  },
  {
    field: 'category',
    headerName: 'Category',
    minWidth:150
  },
  {
    field: 'unitWeight',
    headerName: 'Unit Weight (g)',
    minWidth:150,
    align:"center"
  },
  {
    field: 'minItems',
    headerName: 'Min Items Count',
    minWidth:150,
    align:"center"
  },
  {
    field: 'minBatteryPercentage',
    headerName: 'Min Battery Percentage (%)',
    minWidth:200,
    align:"center"
  },
  {
    field: 'minBatteryVoltage',
    headerName: 'Min Battery Voltage (V)',
    minWidth:165,
    align:"center"
  },
  {
    field: 'refilingStatus',
    headerName: 'Refiling Status',
    minWidth:150
  },
  {
    field: 'description',
    headerName: 'Description',
    minWidth:150
  },
  {
    field: 'message',
    headerName: 'Message',
    minWidth:150
  },{
    field: "status",
    headerName: "Active Status",
    minWidth:150,
    renderCell: (params: any) => {
      const isActive = params.row.status === "Active";
      return (
        <div className='flex items-center justify-center w-full h-full'>
          <button
            onClick={() => HandleStatus(params.row._id, isActive ? "Inactive" : "Active")}
            className={`px-3 py-2 h-[62%] min-w-[85px] w-full flex items-center text-[12px] justify-center rounded-md transition-colors duration-300 text-black ${
              isActive ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </button>
        </div>
      );
    },
  },
  // {
  //   field: 'dateCreated',
  //   headerName: 'Created At',
  //   maxWidth:200,
  //   minWidth:150
  // },
  // {
  //   field: 'dateUpdated',
  //   headerName: 'Updated At',
  //   maxWidth:200,
  //   minWidth:150
  // },
];

  return (
    <div>
      <div className="flex items-center justify-between gap-10 lg:justify-start">
        <PageHeader title="DEVICES MANAGEMENT" subTitle="This is The Devices Management Page." />
        {UserType !== "Customer" && <button
          onClick={() => setIsFormOpen(true)}
          className={`bg-orange-400 px-4 text-[12px] py-3 rounded-md hover:bg-orange-300 duration-300 transition-colors`}
        >
          Add New Device
        </button>}
      </div>
      {deviceData.length > 0 ? (
        <div className="min-h-[100vh] mt-5 overflow-y-auto">
          <DataTable
            slug="device"
            columns={columns}
            rows={deviceData}
            statusChange={HandleStatus}
            fetchData={FetchData}
          />
        </div>
      ) : (
        <p style={{ color: colors.grey[100] }} className='mt-10 text-lg font-semibold'>No Data Available...</p>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-gray-900 bg-opacity-75">
          <div className="w-full p-6 text-black lg:max-[90vh] md:max-h-[85vh] max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg lg:w-2/3">
            <h2 className="mb-6 text-2xl font-semibold text-center">Add New Device</h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
                <label htmlFor="title" className="w-full font-semibold text-[13px]  ">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  onChange={(e) => setFormData({...formData , title:e.target.value})}
                  placeholder='Title'
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Assigned Product */}
              <div>
                <label htmlFor="asignProduct" className="w-full font-semibold text-[13px]">Assigned Product</label>
                <input
                  id="asignProduct"
                  name="asignProduct"
                  placeholder='Assigned Product'
                  onChange={(e) => setFormData({...formData , assignProduct:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Location */}
              <div>
                <label htmlFor="location" className="w-full font-semibold text-[13px]">Location</label>
                <select
                  name="location"
                  onChange={(e) => setFormData({...formData , location:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                >
                  <option value="None">None</option>
                  {locations.length > 0 && locations.map((l , index) => (
                    <option key={index} value={l.location}>{l.location}</option>
                  ))}
                </select>
              </div>
              {/* Minimum count */}
              <div>
                <label htmlFor="unitWeight" className="w-full font-semibold text-[13px]">Unit Weight</label>
                <input
                  id="unitweight"
                  name="unitWeight"
                  placeholder='Unit Weight'
                  onChange={(e) => setFormData({...formData , unitWeight:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Minimum count */}
              <div>
                <label htmlFor="minItems" className="w-full font-semibold text-[13px]">Minimum Items Count</label>
                <input
                  id="minItems"
                  name="minItems"
                  placeholder='Minimum Items Count'
                  onChange={(e) => setFormData({...formData , minItemsCount:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Maximum Battery Percentage */}
              <div>
                <label htmlFor="minBattery" className="w-full font-semibold text-[13px]">Minimum Battery Percentage</label>
                <input
                  id="minBattery"
                  name="minBattery"
                  placeholder='Minimum Battery Percentage'
                  onChange={(e) => setFormData({...formData , minBatteryPercentage:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Maximum Battery Volatage */}
              <div>
                <label htmlFor="minVoltage" className="w-full font-semibold text-[13px]">Minimum Battery Voltage</label>
                <input
                  id="minVoltage"
                  name="minVoltage"
                  placeholder='Minimum Battery Voltage'
                  onChange={(e) => setFormData({...formData , minBatteryVoltage:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              <div className="">
                <label htmlFor="image" className="w-full font-semibold text-[13px]">Select Device Status</label>
                <select
                  name="status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
                <div className="">
                <label htmlFor="image" className="w-full font-semibold text-[13px]">Category</label>
                <select
                  name="category"
                  onChange={(e) => setFormData({...formData , category:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                >
                  <option value="None">None</option>
                  {categories.length > 0 && categories.map((c , index) => (
                    <option key={index} value={c.category}>{c.category}</option>
                  ))}
                </select>
              </div>
                {/* Image Upload */}
              <div>
                <label htmlFor="image" className="w-full font-semibold text-[13px]">Upload Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                  onChange={HandleFileChange}
                />
              </div>
                {/* Description */}
                <div className='md:col-span-2'>
                    <label htmlFor="description" className="w-full font-semibold text-[13px]">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      onChange={(e) => setFormData({...formData , description:e.target.value})}
                      placeholder='Description'
                      className="w-full p-2 mt-2 text-[12px] border rounded-md"
                    />
                </div>
              {/* Description */}
              <div className='md:col-span-2'>
                <label htmlFor="message" className="w-full font-semibold text-[13px]">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder='Message'
                  onChange={(e) => setFormData({...formData , message:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              <div className="flex justify-center gap-3 lg:col-span-2">
              <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-3 text-[12px] w-full bg-gray-400 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  className="px-4 py-3 w-full text-[12px] text-white bg-blue-400 hover:bg-blue-300 transition-colors duration-300 rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
