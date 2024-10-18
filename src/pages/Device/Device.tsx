import React, { useState , useEffect } from 'react';
import { PageHeader } from '../../components/molecules';
import { useTheme } from '../../context/Theme/ThemeContext';
import { CircularProgressBar, Circle, LineChart , DataTable } from '../../components/molecules';
import { Images } from '../../constants';
import * as XLSX from 'xlsx';
import { GridColDef } from '@mui/x-data-grid';
import { IoMdClose } from "react-icons/io";
import Swal from 'sweetalert2';
import { useBaseUrl } from '../../context/BaseUrl/BaseUrlContext';
import axios from 'axios';
import { useToast } from '../../context/Alert/AlertContext';
import { useNavigate, useParams } from 'react-router-dom';

type Device = {
  _id:string,
  title:string,
  category:string,
  assignProduct:string,
  location:string,
  unitWeight:string,
  minItems:string,
  minBatteryPercentage:string,
  status:string,
  minBatteryVoltage:string,
  imageUrl:string,
  refilingStatus:string,
  description:string,
  message:string,
  dateCreated: string,
  timeCreated: string,
  dateUpdated:string,
  timeUpdated:string,
}

type User = {
  _id:string,
  fullName:string,
}

type Rule = {
  _id:string,
  userId:string,
  userName:string,
  deviceId:string,
  deviceName:string,
  imageUrl:string,
  emailStatus:string,
  dateCreated:string,
  //timeCreated:string,
  dateUpdated:string,
  //timeUpdated:string,
}

type Category = {
  category:string
}

type Location = {
  location:string
}

// ---------- Table Columns ----------
const columns:GridColDef[] = [
  {
    field: 'image',
    headerName: 'Image',
    width: 100,
    renderCell: (params: any) => {
      return (
        <div className="flex items-center justify-center w-full h-full space-x-3">
          <img
            className="w-[40px] h-[40px] object-cover rounded-full"
            src={params.row.imageUrl
              ? params.row.imageUrl
              : Images.unknownRule}
            alt="Device Image"
          />
        </div>
      );
    },
  },
  {
    field: "userId",
    type: "string",
    headerName: "User Id",
    width: 200,
  },
  {
    field: 'userName',
    headerName: 'User Name',
    width: 200,
  },
  {
    field: "emailStatus",
    type: "string",
    headerName: "Email Status",
    width: 100,
  },
];

// ---------- Linechart test data for different time ranges ----------
const dataLineChart = {
  current:{name: 'Now', uv: 400, pv: 240, amt: 240},
  day: [
    { name: '12 AM', uv: 400, pv: 240, amt: 240 },
    { name: '3 AM', uv: 300, pv: 138, amt: 210 },
    { name: '6 AM', uv: 500, pv: 480, amt: 320 },
    { name: '9 AM', uv: 700, pv: 680, amt: 390 },
    { name: '12 PM', uv: 900, pv: 840, amt: 420 },
    { name: '3 PM', uv: 650, pv: 480, amt: 350 },
    { name: '6 PM', uv: 450, pv: 320, amt: 260 },
    { name: '9 PM', uv: 300, pv: 150, amt: 180 },
  ],
  week: [
    { name: 'Mon', uv: 1400, pv: 1200, amt: 1200 },
    { name: 'Tue', uv: 1800, pv: 1700, amt: 1500 },
    { name: 'Wed', uv: 2200, pv: 1900, amt: 1700 },
    { name: 'Thu', uv: 1600, pv: 1400, amt: 1400 },
    { name: 'Fri', uv: 2500, pv: 2200, amt: 2000 },
    { name: 'Sat', uv: 2900, pv: 2600, amt: 2300 },
    { name: 'Sun', uv: 3200, pv: 2900, amt: 2700 },
  ],
  month: [
    { name: 'Week 1', uv: 5000, pv: 4000, amt: 4500 },
    { name: 'Week 2', uv: 7000, pv: 6000, amt: 5800 },
    { name: 'Week 3', uv: 8000, pv: 6800, amt: 6500 },
    { name: 'Week 4', uv: 9500, pv: 7500, amt: 7200 },
  ],
  threeMonths: [
    { name: 'Month 1', uv: 21000, pv: 19000, amt: 19500 },
    { name: 'Month 2', uv: 23000, pv: 21000, amt: 21500 },
    { name: 'Month 3', uv: 25000, pv: 23000, amt: 22500 },
  ],
  sixMonths: [
    { name: 'Month 1', uv: 31000, pv: 28000, amt: 29000 },
    { name: 'Month 2', uv: 35000, pv: 32000, amt: 31000 },
    { name: 'Month 3', uv: 37000, pv: 34000, amt: 35000 },
    { name: 'Month 4', uv: 40000, pv: 38000, amt: 37000 },
    { name: 'Month 5', uv: 42000, pv: 39000, amt: 41000 },
    { name: 'Month 6', uv: 45000, pv: 42000, amt: 43000 },
  ],
  year: [
    { name: 'Jan', uv: 50000, pv: 46000, amt: 47000 },
    { name: 'Feb', uv: 52000, pv: 49000, amt: 48000 },
    { name: 'Mar', uv: 55000, pv: 51000, amt: 50000 },
    { name: 'Apr', uv: 58000, pv: 53000, amt: 52000 },
    { name: 'May', uv: 60000, pv: 55000, amt: 54000 },
    { name: 'Jun', uv: 63000, pv: 58000, amt: 57000 },
    { name: 'Jul', uv: 66000, pv: 61000, amt: 60000 },
    { name: 'Aug', uv: 70000, pv: 64000, amt: 63000 },
    { name: 'Sep', uv: 72000, pv: 67000, amt: 65000 },
    { name: 'Oct', uv: 75000, pv: 70000, amt: 68000 },
    { name: 'Nov', uv: 77000, pv: 72000, amt: 70000 },
    { name: 'Dec', uv: 80000, pv: 75000, amt: 73000 },
  ],
};

type TimeRange = 'day' | 'week' | 'month' | 'threeMonths' | 'sixMonths' | 'year';

const Device: React.FC = () => {
  const { theme , colors } = useTheme();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [showEditDetails, setShowEditDetails] = useState<boolean>(false);
  const [isOpenForm , setIsOpenForm] = useState<boolean>(false);
  const [deviceData, setDeviceData] = useState<Device>({
    _id:"",
    title:"",
    category:"",
    assignProduct:"",
    location:"",
    unitWeight:"",
    minItems:"",
    minBatteryPercentage:"",
    status:"",
    minBatteryVoltage:"",
    imageUrl:"",
    refilingStatus:"",
    description:"",
    message:"",
    dateCreated: "",
    timeCreated: "",
    dateUpdated:"",
    timeUpdated:"",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { baseUrl } = useBaseUrl();
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const Token = savedUserData.accessToken;
  const [isOpen, setIsOpen] = useState(false);
  const { notify} = useToast();
  const navigate =  useNavigate();
  const {deviceId} = useParams();
  const [newDevice , setNewDevice] = useState<{
    _id:string,
    title:string,
    category:string,
    assignProduct:string,
    location:string,
    unitWeight:string,
    minItems:string,
    minBatteryPercentage:string,
    status:string,
    minBatteryVoltage:string,
    imageUrl:string,
    refilingStatus:string,
    description:string,
    message:string,
  }>({
    _id:"",
    title:"",
    category:"",
    assignProduct:"",
    unitWeight:"",
    location:"",
    minItems:"",
    minBatteryPercentage:"",
    status:"",
    minBatteryVoltage:"",
    imageUrl:"",
    refilingStatus:"",
    description:"",
    message:"",
  });
  const [users , setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule , setNewRule] = useState<{
    userId:string,
    userName:string,
    image:File| null,
    emailStatus:string
  }>({
    userId:"",
    userName:"",
    image:null,
    emailStatus:""
  })
  const [deviceDetails , setDeviceDetails] = useState<{
    batteryVoltage:number,
    batteryPercentage:number,
    totalWeight:number,
    itemCount:number
  }>({
    batteryPercentage:0,
    batteryVoltage:0,
    totalWeight:0,
    itemCount:0
  })
  const [categories , setCategories] = useState<Category[]>([])
  const [locations , setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if(!Token){
      navigate("/");
    }else{
      FetchData();
      FetchDeviceDetails();
      GetLocations();
      GetCategories();
    }
  },[Token]);

  const FetchData = async() => {
    try {
      const [usersResponse, rulesResponse , deviceResponse , deviceDetailsResponse] = await Promise.all([
        axios.get(`${baseUrl}/users/all`, {
          headers: {
            token: `Bearer ${Token}`,
          },
        }),
        axios.get(`${baseUrl}/rules/all/device/${deviceId}`, {
          headers: {
            token: `Bearer ${Token}`,
          },
        }),
        axios.get(
          `${baseUrl}/device/one/${deviceId}`,{
            headers: {
              token: `Bearer ${Token}`,
            },
          }),
        axios.get(`${baseUrl}/weighingdata/get-data/${deviceId}`, {
          headers: {
            token: `Bearer ${Token}`,
          },
        })
      ]);
      if(usersResponse.data.status && rulesResponse.data.status && deviceResponse.data.status &&deviceDetailsResponse.data.status){
        setUsers(usersResponse.data.users);
        setRules(rulesResponse.data.rules);  
        setDeviceData(deviceResponse.data.device);
          setNewDevice({
            ...newDevice,
             _id:deviceResponse.data.device._id,
            title:deviceResponse.data.device.title,
            category:deviceResponse.data.device.category,
            assignProduct:deviceResponse.data.device.assignProduct,
            unitWeight:deviceResponse.data.device.unitWeight,
            location:deviceResponse.data.device.location,
            minItems:deviceResponse.data.device.minItems,
            minBatteryPercentage:deviceResponse.data.device.minBatteryPercentage,
            status:deviceResponse.data.device.status,
            minBatteryVoltage:deviceResponse.data.device.minBatteryVoltage,
            imageUrl:deviceResponse.data.device.imageUrl,
            refilingStatus:deviceResponse.data.device.refilingStatus,
            description:deviceResponse.data.device.description,
            message:deviceResponse.data.device.message,
          });
      }else{
        notify(deviceResponse.data.error.message , 'error');
      }
    } catch (error) {
      console.log(error);
      notify("An unexpected error occurred. Please try again later.", "error");
    }
  }

  const FetchDeviceDetails = async() => {
    try {
      const response = await axios.get(`${baseUrl}/weighingdata/get-data/${deviceId}`, {
          headers: {
            token: `Bearer ${Token}`,
          },
        });
        if(response.data.status){
          if (response.data.data && response.data.data.length > 0) {
            const deviceDetail = response.data.data[0];
            setDeviceDetails({
              batteryVoltage: Number(deviceDetail.batteryVoltage),
              batteryPercentage: Number(deviceDetail.batteryPercentage),
              itemCount: Number(deviceDetail.itemCount),
              totalWeight: Number(deviceDetail.totalWeight),
            });
          }
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

  console.log(deviceDetails);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Handle time range change
  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRange(e.target.value as TimeRange);
  };

  // Handle file input change for image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  // Function to handle downloading the Excel file
  const downloadExcelFile = () => {
    const dataToExport = dataLineChart[selectedRange];
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `DeviceData_${selectedRange}.xlsx`);
  };

  const downloadCurrentDetails = () => {
    // Prepare data for export
    const deviceData = [
      {
        'Battery Voltage': deviceDetails.batteryVoltage,
        'Battery Percentage': deviceDetails.batteryPercentage,
        'Total Weight': deviceDetails.totalWeight,
        'Item Count': deviceDetails.itemCount,
      },
    ];
  
    // Create a new workbook and add the device data
    const worksheet = XLSX.utils.json_to_sheet(deviceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Device Details');
  
    // Convert the workbook to binary data
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Create a blob from the binary data
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
    // Create a link and trigger a download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'device_details.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle form submission
  const handleSubmit = () => {
    Swal.fire({
      title: "",
      text: "Are you sure to update device?",
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
        UpdateDevice();
       }
    })
  };

  const Icons = {
    voltageMeter:"https://img.icons8.com/?size=100&id=1737&format=png&color=000000",
    battery:"https://img.icons8.com/?size=100&id=78183&format=png&color=000000",
    itemCount:"https://img.icons8.com/?size=100&id=89779&format=png&color=000000",
    totalWeight:"https://img.icons8.com/?size=100&id=18699&format=png&color=000000"
  }

  const statusChange = () => {

  }

  const handleSubmitCreate = () => {
    if(!newRule.userName){
      notify('Choose User before click save button' , 'warning');
      return;
    }
    if(!newRule.emailStatus){
      notify('Choose Email Status before click save button' , 'warning');
      return;
    }
    Swal.fire({
      title: "",
      text: "Are you sure to Create New Rule?",
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
         CreateNewRule();
        }
    })
  }

  const DeleteImage = async(url:string) => {
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    try {
      console.log(fileName);
      await axios.delete(`${baseUrl}/files/delete/${fileName}`,{
        headers: {
          token: `Bearer ${Token}`,
        },
      })
    } catch (error) {
      console.log(error);
    }
  }

  const ImageUpload = async() => {
    if(imageFile === null){
      return null;
    }
    if(newDevice.imageUrl !== null){
     await DeleteImage(newDevice.imageUrl);
    }
    const data = {
      file:imageFile
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

  const UpdateDevice  = async() => {
    const ImageUrl = await ImageUpload();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const data = {
      title:newDevice.title,
      category:newDevice.category,
      assignProduct:newDevice.assignProduct,
      location:newDevice.location,
      unitWeight:newDevice.unitWeight,
      minItems:newDevice.minItems,
      minBatteryPercentage:newDevice.minBatteryPercentage,
      status:newDevice.status,
      minBatteryVoltage:newDevice.minBatteryVoltage,
      imageUrl:ImageUrl !== null ? `http://localhost:3300/uploads/${ImageUrl}`: newDevice.imageUrl,
      refilingStatus:newDevice.refilingStatus,
      description:newDevice.description,
      message:newDevice.message,
      dateUpdated:date,
      timeUpdated:time,
    }

    try {
      const response = await axios.put(`${baseUrl}/device/update/${newDevice._id}`, data , {
        headers:{
          token:`Bearer ${Token}`
        }
      });
      if(response.data.status){
        Swal.fire({
          title: "",
          text: "Device Update Successfully!",
          icon: "success",
          showCancelButton: false,
          confirmButtonColor:theme === 'dark' ? "#86D293" : '#73EC8B',
          background:colors.primary[400],
          iconColor:"#06D001",
          confirmButtonText: "Ok",
          color:colors.grey[100],
          allowOutsideClick: false
        });
        FetchData();
        setShowEditDetails(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const CreateNewRule = async() => {
    const ImageUrl = await ImageUpload();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const data ={
      deviceId:deviceId,
      deviceName:deviceData.title,
      imageUrl:ImageUrl !== null ? `http://localhost:3300/uploads/${ImageUrl}` : null,
      userId:newRule.userId,
      userName:newRule.userName,
      emailStatus:newRule.emailStatus,
      dateCreated:date,
      timeCreated:time,
      dateUpdated:date,
      timeUpdated:time,
    }

    try {
      const response = await axios.post(
        `${baseUrl}/rules/create`, data,
        {
          headers:{
            token: `Bearer ${Token}`,
          }
        }
      )

      if(response.data.status){
        Swal.fire({
          title: "",
          text: "New Rule Created Successfully!",
          icon: "success",
          showCancelButton: false,
          confirmButtonColor: theme === 'dark' ? "#86D293" : '#73EC8B',
          background: colors.primary[400],
          iconColor: "#06D001",
          confirmButtonText: "Ok",
          color: colors.grey[100],
          allowOutsideClick: false
        });
       FetchData();
        setIsOpenForm(false);
      }
    } catch (error) {
      console.log(error);
      notify("An unexpected error occurred. Please try again later.", "error"); 
    }
  }

  return (
    <div className="">
      {/* Page Header */}
      <PageHeader title="Device" subTitle="This is the Device Details Page." />
      <div className={`overflow-y-auto w-full mt-5 p-6 rounded-lg ${theme === 'dark' ? 'bg-white' : 'bg-gray-200'}`}>
      <div className={`grid gap-6 lg:grid-cols-3 min-h-[100vh] w-full`}>
        {/* Device Details Section */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-start w-full gap-5 lg:items-start lg:flex-row lg:col-span-3">
            <img
                src={deviceData.imageUrl === null ? Images.unknownDevice : deviceData.imageUrl}
                alt={deviceData.title}
                onClick={togglePopup}
                className="object-cover w-[25%] cursor-pointer h-auto p-8 mb-4 rounded-lg bg-slate-300"
              />
             <div>
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">{deviceData.title}</h2>
                <p className="mb-2 text-gray-600">{deviceData.description}</p>
                <p className="text-gray-600"><strong>Assigned Product:</strong> {deviceData.assignProduct ? deviceData.assignProduct : "None"}</p>
                <p className="text-gray-600"><strong>Location:</strong> {deviceData.location ? deviceData.location : "None"}</p>
                <p className="text-gray-600"><strong>Unit Weight:</strong> {deviceData.unitWeight ? `${deviceData.unitWeight}g` : "0g"}</p>
                <p className="text-gray-600"><strong>Minimum Items Count:</strong> {deviceData.minItems ? deviceData.minItems : "0"}</p>
                <p className="text-gray-600"><strong>Minimum Battery Percentage:</strong> {deviceData.minBatteryPercentage ? deviceData.minBatteryPercentage : "0"}%</p>
                <p className="text-gray-600"><strong>Minimum Battery Voltage:</strong> {deviceData.minBatteryVoltage ? deviceData.minBatteryVoltage : "0"}V</p>
                <p className="text-gray-600"><strong>Category:</strong> {deviceData.category ? deviceData.category : "None"}</p>
                <p className="text-gray-600"><strong>Active Status:</strong> {deviceData.status ? deviceData.status : "None"}</p>
                <p className="text-gray-600"><strong>Refiling Status:</strong> {deviceData.refilingStatus ? deviceData.refilingStatus :"None"}</p>
                <p className="text-gray-600"><strong>Message:</strong> {deviceData.message ? deviceData.message : "None"}</p>
                <p className="text-gray-600"><strong>Created On:</strong> {deviceData.dateCreated} at {deviceData.timeCreated}</p>
                <p className="text-gray-600"><strong>Last Updated:</strong> {deviceData.dateUpdated} at {deviceData.timeUpdated}</p>
                <div className='flex items-center justify-start gap-8'>
                <button
                  className="w-full px-4 py-3 mt-5 transition-colors duration-300 text-[12px] bg-green-300 rounded-md lg:w-auto hover:bg-green-200"
                  onClick={() => setShowEditDetails(true)}
                >
                  Edit Details
                </button>
                <button
                  onClick={downloadCurrentDetails}
                  className="w-full px-4 py-3 mt-5 transition-colors text-[12px] duration-300 bg-orange-300 rounded-md lg:w-auto hover:bg-orange-200"
                >
                  Download Current
                </button>
                </div>
             </div>
            </div>
          </div>

          {/* Circular Progress Bars */}
        { deviceDetails && deviceDetails.batteryPercentage !== 0 && deviceDetails.batteryVoltage !== 0 && deviceDetails.itemCount !== 0 && deviceDetails.totalWeight !== 0 && (<div className="flex flex-col items-center justify-center w-full gap-5 mt-6 mb-6 md:grid md:grid-cols-2 xl:grid-cols-4">
          {/* Battery Percentage */}
         <div className='flex items-center justify-center w-full h-full'>
         <CircularProgressBar
            CurrentValue={deviceDetails.batteryPercentage}
            StartValue={0}
            EndValue={100}
            LowValue={20}
            HighValue={75}
            Units="%"
            InnerColor="#F78F5E"
            TextColor="#000000"
            Icon={Icons.battery}
            Title="Battery Percentage"
          />
         </div>
         <div className='flex items-center justify-center w-full h-full'>
            {/* Battery Voltage */}
            <CircularProgressBar
              CurrentValue={deviceDetails.batteryVoltage}
              StartValue={0}
              EndValue={100}
              LowValue={10}
              HighValue={25}
              Units="V"
              InnerColor="#F78F5E"
              TextColor="#000000"
              Icon={Icons.voltageMeter}
              Title="Battery Voltage"
            />
         </div>
         <div className='flex items-center justify-center w-full h-full'>
          {/* Item Count */}
          <CircularProgressBar
            CurrentValue={deviceDetails.itemCount}
            StartValue={0}
            EndValue={100}
            LowValue={10}
            HighValue={80}
            Units=""
            InnerColor="#F78F5E"
            TextColor="#000000"
            Icon={Icons.itemCount}
            Title="Item Count"
          />
         </div>
         <div className='flex items-center justify-center w-full h-full'>
            {/* Total Weight */}
            <Circle
              title="Total Weight"
              value={`${deviceDetails.totalWeight} g`}
              unVal={String(deviceDetails.totalWeight)}
              bgColor="#F78F5E"
              icon={Icons.totalWeight}
            />
         </div>
        </div>)}
          {/* Line Chart */}
          <div className="mt-6">
           <div className='flex items-center justify-start gap-8 lg:pl-10'>
            <div className="mb-4">
                <select
                  value={selectedRange}
                  onChange={handleRangeChange}
                  className="px-4 py-3 bg-gray-200 rounded-md text-[12px] lg:min-w-[100px] w-full"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="threeMonths">3 Months</option>
                  <option value="sixMonths">6 Months</option>
                  <option value="year">1 Year</option>
                </select>
              </div>
            {/* Download Excel Button */}
            <div className="mb-4">
              <button
                onClick={downloadExcelFile}
                className="px-4 py-3 text-white text-[12px] bg-blue-500 rounded-md hover:bg-blue-700"
              >
                Download Excel 
              </button>
            </div>
           </div>
            <LineChart data={dataLineChart[selectedRange]} />
          </div>
        </div>
        </div>
        {/* Table Data */}
        <div className='col-span-1 lg:col-span-3'>
              <div className='flex flex-col items-center justify-center gap-4 p-2 md:items-start lg:justify-start'>
                <button 
                  className='bg-orange-400 px-4 py-3 w-full md:w-auto rounded-lg text-[12px] hover:bg-orange-300 duration-300 transition-colors'
                  onClick={() => setIsOpenForm(true)}  
                >Create New Rule</button>
                <div className='min-h-[50vh] mt-3 w-full overflow-y-auto overflow-x-auto'>
                  <DataTable 
                    slug="rules" 
                    columns={columns} 
                    rows={rules}
                    statusChange={statusChange}
                    fetchData={FetchData} 
                  />
                </div>
              </div>
            </div>
            </div>
      {/* Modal for Editing Details */}
      {showEditDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-full p-4 bg-black bg-opacity-50">
          <div className="w-full p-6 text-black lg:max-[90vh] md:max-h-[85vh] max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg lg:w-2/3">
            <h2 className="mb-4 text-lg font-bold text-center text-black">Edit Device Details</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Title */}
              <div>
                <label htmlFor="title" className="w-full font-semibold text-[13px]">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder='Title'
                  value={newDevice.title}
                  onChange={(e) => setNewDevice({...newDevice , title:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Assigned Product */}
              <div>
                <label htmlFor="assignProduct" className="w-full font-semibold text-[13px]">Assigned Product</label>
                <input
                  id="assignProduct"
                  name="assignProduct"
                  placeholder='Assigned Product'
                  value={newDevice.assignProduct}
                  onChange={(e) => setNewDevice({...newDevice , assignProduct:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Location */}
              <div>
                <label htmlFor="location" className="w-full font-semibold text-[13px]">Location</label>
                <select
                  name="location"
                  onChange={(e) => setNewDevice({...newDevice , location:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                >
                  <option value="None">None</option>
                  {locations.length > 0 && locations.map((l , index) => (
                    <option key={index} value={l.location}>{l.location}</option>
                  ))}
                </select>
              </div>
              {/* Assigned Product */}
              <div>
                <label htmlFor="unitWeight" className="w-full font-semibold text-[13px]">Unit Weight</label>
                <input
                  id="unitweight"
                  name="unitWeight"
                  placeholder='Unit Weight'
                  value={newDevice.unitWeight}
                  onChange={(e) => setNewDevice({...newDevice , unitWeight:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Minimum count */}
              <div>
                <label htmlFor="minItems" className="w-full font-semibold text-[13px]">Minimum Items Count</label>
                <input
                  id="minItems"
                  name="minItems"
                  placeholder='Minimum Count'
                  value={newDevice.minItems}
                  onChange={(e) => setNewDevice({...newDevice , minItems:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="minBatteryPercentage" className="w-full font-semibold text-[13px]">Minimum Battery Percentage</label>
                <input
                  id="minBatteryPercentage"
                  name="minBatteryPercentage"
                  placeholder='Minimum Battrey Percentage'
                  value={newDevice.minBatteryPercentage}
                  onChange={(e) => setNewDevice({...newDevice , minBatteryPercentage:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="minBatteryVoltage" className="w-full font-semibold text-[13px]">Minimum Battery Voltage</label>
                <input
                  id="minBatteryVoltage"
                  name="minBatteryVoltage"
                  placeholder='Minimum Battery Voltage'
                  value={newDevice.minBatteryVoltage}
                  onChange={(e) => setNewDevice({...newDevice , minBatteryVoltage:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              <div className="">
                <label htmlFor="status" className="w-full font-semibold text-[13px]">Select Device Status</label>
                <select
                  name="status"
                  value={newDevice.status}
                  onChange={(e) => setNewDevice({...newDevice , status:e.target.value})}
                  className="w-full p-2 mt-2  text-[12px] border rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

                <div className="">
                <label htmlFor="refilingStatus" className="w-full font-semibold text-[13px]">Refiling Status</label>
                  <select
                    name="refilingStatus"
                    value={newDevice.refilingStatus}
                    onChange={(e) => setNewDevice({...newDevice , refilingStatus:e.target.value})}
                    className="w-full p-2 mt-2  text-[12px] border rounded-md"
                  >
                    <option value="None">None</option>
                    <option value="Refiling Start">Refiling Started</option>
                    <option value="Refiling Done">Refiling Done</option>
                  </select>
                </div>

                <div className="">
                <label htmlFor="image" className="w-full font-semibold text-[13px]">Category</label>
                <select
                  name="category"
                  value={newDevice.category}
                  onChange={(e) => setNewDevice({...newDevice , category:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                >
                  <option value="None">None</option>
                  {categories.length > 0 && categories.map((c , index) => (
                    <option key={index} value={c.category}>{c.category}</option>
                  ))}
                </select>
              </div>
                {/* Image Upload */}
              <div className='md:col-span-2'>
                <label htmlFor="image" className="w-full font-semibold text-[13px]">Upload Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
                {/* Description */}
                <div className='md:col-span-2'>
                    <label htmlFor="description" className="w-full font-semibold text-[13px]">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder='Description'
                      value={newDevice.description}
                      onChange={(e) => setNewDevice({...newDevice , description:e.target.value})}
                      className="w-full p-2 mt-2 text-[12px] border rounded-md"
                    />
                </div>
              {/* Message */}
              <div className='md:col-span-2'>
                <label htmlFor="message" className="w-full font-semibold text-[13px]">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder='Message'
                  value={newDevice.message}
                  onChange={(e) => setNewDevice({...newDevice , message:e.target.value})}
                  className="w-full p-2 mt-2 text-[12px] border rounded-md"
                />
              </div>
              {/* Submit Button */}
              <button
                  type="button"
                  className="px-4 py-3 text-[12px] w-full bg-gray-400 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                  onClick={() => setShowEditDetails(false)}
                >
                  Cancel
                </button>
              <button type="button" onClick={handleSubmit} className="px-4 py-3 w-full text-[12px] text-white bg-blue-400 hover:bg-blue-300 transition-colors duration-300 rounded-lg">
                  Save
                </button>
            </div>
          </div>
        </div>
      )}
      {isOpenForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 mt-5 bg-black bg-opacity-50">
        <div className="w-full p-6 bg-white rounded-lg shadow-lg lg:w-2/3">
          <h2 className="mb-4 text-lg font-bold text-center text-black">Add New Rule</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className='w-full font-semibold text-[13px]'>User Name</label>
              <select
                  name="status"
                  className="w-full p-2 mt-2 border text-[12px] rounded-md"
                  value={newRule.userId}
                  onChange={(e) => setNewRule({...newRule , userId:e.target.value , userName:e.target.selectedOptions[0].text})}
                >
                  <option>None</option>
                  {users.length > 0 && users.map((user) =>(
                    <option key={user._id} value={user._id}>{user.fullName}</option>
                  ))}
                </select>
            </div>
            <div>
            <label className='w-full font-semibold text-[13px]'>Choose Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="w-full p-2 mt-2 border text-[12px] rounded-md"
            />
            </div>
            <div>
            <label className='w-full font-semibold text-[13px]'>Email Status</label>
            <select
              name="status"
              className="w-full p-2 mt-2 border text-[12px] rounded-md"
              value={newRule.emailStatus}
              onChange={(e) => setNewRule({...newRule , emailStatus:e.target.value})}
            >
              <option>None</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              className="px-4 py-3 text-[12px] w-full bg-gray-400 rounded-lg hover:bg-gray-300 transition-colors duration-300"
              onClick={() => setIsOpenForm(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-3 w-full text-[12px] text-white bg-blue-400 hover:bg-blue-300 transition-colors duration-300 rounded-lg"
              onClick={handleSubmitCreate}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-50">
          <div className="relative w-full h-auto max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-lg">
            {/* Close Button */}
            <button
              className="absolute text-gray-500 transition-colors duration-300 top-2 right-2 hover:text-red-500"
              onClick={togglePopup}
            >
              <IoMdClose size={24} />
            </button>

            {/* Image */}
            <img
              src={deviceData.imageUrl || Images.unknownDevice}
              alt="Profile"
              className="object-contain w-full max-h-[70vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Device;
