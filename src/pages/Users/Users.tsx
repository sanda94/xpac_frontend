import React, { useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useTheme } from '../../context/Theme/ThemeContext';
import { DataTable, PageHeader } from '../../components/molecules';
import { Images } from '../../constants';
import Swal from 'sweetalert2';
import { useToast } from '../../context/Alert/AlertContext';
import axios from 'axios';
import { useBaseUrl } from '../../context/BaseUrl/BaseUrlContext';
import { useNavigate } from 'react-router-dom';

type User = {
  _id:string,
  fullName:string,
  emailAddress:string,
  phoneNumber:number,
  address:string,
  organization:string,
  status:string,
  userType:string,
  imageUrl:string
}

const Users: React.FC = () => {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const { colors , theme } = useTheme();
  const navigate = useNavigate();
  const { notify } = useToast();
  const {baseUrl} = useBaseUrl();
  const UserType = savedUserData.userType;
  const Token = savedUserData.accessToken;
  const [isOpenForm, setIsFormOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<{
    fullName: string;
    emailAddress: string;
    phoneNumber: string;
    address: string;
    organization: string;
    userType: string;
    status: string;
    image: File | null;
    password: string;
  }>({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    address: '',
    organization: '',
    userType: 'Customer',
    status: 'Active',
    image: null,
    password: ""
  });

  useEffect(() => {
    if(!Token){
      navigate("/");
    }else{
      FetchData();
    }
  },[Token]);

  const FetchData = async() => {
    try {
      const response = await axios.get(
        `${baseUrl}/users/all`,{
          headers: {
            token: `Bearer ${Token}`,
          },
        });
      if(response.data.status){
          setUserData(response.data.users);
      }else{
        notify(response.data.error.message , 'error');
      }
    } catch (error) {
      console.log(error);
      notify("An unexpected error occurred. Please try again later.", "error");
    }
  }

  console.log(userData);
  const openForm = () => {
    setIsFormOpen(!isOpenForm);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isTeleValid = (phoneNumber:string) => {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phoneNumber);

  }

  const HandleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      setNewUser((prevUser) => ({
        ...prevUser,
        image: files[0],
      }));
    }
  };

  const GeneratePassword = () => {
    const timestamp = Date.now();
    const password = timestamp.toString().slice(-5);
    return password;
  }

  const ImageUpload = async() => {
    if(newUser.image === null){
      return null;
    }
    const data = {
      file:newUser.image
    }
    console.log(newUser);
    console.log(data);
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

  const RegisterUser = async() => {
    try {
      const password = GeneratePassword();
      const ImageUrl = await ImageUpload();
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0];

      const data = {
        fullName:newUser.fullName,
        emailAddress: newUser.emailAddress,
        address:newUser.address,
        phoneNumber:newUser.phoneNumber,
        organization:newUser.organization,
        status:newUser.status,
        userType:newUser.userType,
        imageUrl:ImageUrl !== null ? `http://localhost:3300/uploads/${ImageUrl}`: null,
        password:password,
        dateCreated:date,
        timeCreated:time,
        dateUpdated:date,
        timeUpdated:time
      }
      const response = await axios.post(`${baseUrl}/users/register`, data , {
        headers:{
          token: `Bearer ${Token}`
        }
      })

      if(response.data.status){
        Swal.fire({
          title: "",
          text: "User Create Successfully!",
          icon: "success",
          showCancelButton: false,
          confirmButtonColor:theme === 'dark' ? "#86D293" : '#73EC8B',
          background:colors.primary[400],
          iconColor:"#06D001",
          confirmButtonText: "Ok",
          color:colors.grey[100],
          allowOutsideClick: false
        })
        FetchData()
        setIsFormOpen(false);
      }
    } catch (error:any) {
      console.log(error);
      notify(error.response.data.error.message, "error"); 
    }
  }

  const updateStatus = (id: string, newStatus: string) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to update user status?",
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
          const response = await axios.put(`${baseUrl}/users/update/${id}` , data , {
            headers:{
              token:`Bearer ${Token}`
            }
          })
          console.log(response);
          if(response.data.status){
            Swal.fire({
              title: "",
              text: "User Status Updated Successfully!",
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
        } catch (error:any) {
          console.log(error);
          notify(error.response.data.error.message, "error"); 
        }
      }
  });
  };

  const handleSubmit = () => {
    if(!newUser.fullName || !newUser.emailAddress || !newUser.address || !newUser.phoneNumber){
      notify('Fill all required field before click Add User button' , 'error');
      return;
    }else if (!isValidEmail(newUser.emailAddress)) {
      notify('Please enter a valid Email Address.', 'warning');
      return;
    }else if (!isTeleValid(newUser.phoneNumber)) {
      notify('Please enter a valid Phone Number.', 'warning');
      return;
    }else{ 
    Swal.fire({
      title: "",
      text: "Are you sure to Create New User?",
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
          RegisterUser();  
        }
    })
  }
  };

  const columns: GridColDef[] = [
    {
      field: "profile",
      headerName: "Profile",
      maxWidth:300,
      minWidth:150,
      renderCell: (params: any) => {
        return (
          <div className="flex items-center w-full h-full space-x-3">
            <img
              className="w-[40px] h-[40px] object-cover rounded-full"
              src={
                params.row.imageUrl
                  ? params.row.imageUrl
                  : Images.unknownUser
              }
              alt="Profile"
            />
            <span>{params.row.fullName}</span>
          </div>
        );
      },
    },
    {
      field: "emailAddress",
      type: "string",
      headerName: "Email Address",
      minWidth:150
    },
    {
      field: "phoneNumber",
      type: "string",
      headerName: "Phone Number",
      minWidth:150
    },
    {
      field: "address",
      type: "string",
      headerName: "Address",
      minWidth:150
    },
    {
      field: "organization",
      type: "string",
      headerName: "Organization",
      minWidth:150
    },
    {
      field: "userType",
      type: "string",
      headerName: "User Type",
      minWidth:150
    },
    {
      field: "status",
      headerName: "Status",
      minWidth:150,
      renderCell: (params: any) => {
        const isActive = params.row.status === "Active";
        return (
          <div className='flex items-center justify-center w-full h-full'>
            <button
              onClick={() => updateStatus(params.row._id, isActive ? "Inactive" : "Active")}
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
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-10 lg:justify-start">
        <PageHeader title="USERS MANAGEMENT" subTitle="This is The Users Management Page." />
        {UserType === 'Admin' ? (
          <button 
            onClick={openForm} 
            className={`bg-orange-400 px-4 py-3 rounded-md text-[12px] hover:bg-orange-300 duration-300 transition-colors`}
          >
            Add New User
          </button>
        ) : null}
      </div>
      {userData.length > 0 ? (
        <div className="min-h-[100vh] mt-5 overflow-y-auto">
          <DataTable slug="users" statusChange={updateStatus} columns={columns} rows={userData} fetchData={FetchData} />
        </div>
      ) : (
        <p style={{color:colors.grey[100]}} className='mt-10 text-lg font-semibold'>No Data Available...</p>
      )}

      {isOpenForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-50">
          <div className="w-full p-6 bg-white rounded-lg h-auto sm:max-h-[90vh] overflow-y-auto shadow-lg lg:w-2/3">
            <h2 className="mb-4 text-lg font-bold text-center text-black">Add New User</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
              <label className='w-full font-semibold text-[13px]'>Full Name <strong className='text-red-500 text-[12px]'>*</strong></label>
              <input
                type="text"
                name="fullName"
                onChange={(e) => setNewUser({...newUser , fullName:e.target.value})}
                placeholder="Full Name"
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              />
              </div>
              <div>
              <label className='w-full font-semibold text-[13px]'>Choose Image</label>
              <input
                type="file"
                name="image"
                onChange={HandleFileChange}
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              />
              </div>
              <div>
              <label className='w-full font-semibold text-[13px]'>Email Address <strong className='text-red-500 text-[12px]'>*</strong></label>
              <input
                type="email"
                name="emailAddress"
                onChange={(e) => setNewUser({...newUser , emailAddress:e.target.value})}
                placeholder="Email Address"
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              />
              </div>
              <div>
              <label className='w-full font-semibold text-[13px]'>Phone Number <strong className='text-red-500 text-[12px]'>*</strong></label>
              <input
                type="text"
                name="phoneNumber"
                onChange={(e) => setNewUser({...newUser , phoneNumber:e.target.value})}
                placeholder="Phone Number"
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              />
              </div>
              <div>
              <label className='w-full font-semibold text-[13px]'>Organization</label>
              <input
                type="text"
                name="organization"
                onChange={(e) => setNewUser({...newUser , organization:e.target.value})}
                placeholder="Organization"
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              />
              </div>
              <div className='md:col-span-2'>
              <label className='w-full font-semibold text-[13px]'>Address <strong className='text-red-500 text-[12px]'>*</strong></label>
              <textarea
                name="address"
                placeholder="Address"
                onChange={(e) => setNewUser({...newUser , address:e.target.value})}
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              />
              </div>
              <div>
              <label className='w-full font-semibold text-[13px]'>Status <strong className='text-red-500 text-[12px]'>*</strong></label>
              <select
                name="status"
                onChange={(e) => setNewUser({...newUser , status:e.target.value})}
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              </div>
              <div>
              <label className='w-full font-semibold text-[13px]'>User Type <strong className='text-red-500 text-[12px]'>*</strong></label>
              <select
                name="userType"
                onChange={(e) => setNewUser({...newUser , userType:e.target.value})}
                className="w-full p-2 mt-2 text-[12px] border rounded-md"
              >
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Customer">Customer</option>
              </select>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                className="px-4 py-3 text-[12px] w-full bg-gray-400 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-3 w-full text-[12px] text-white bg-blue-400 hover:bg-blue-300 transition-colors duration-300 rounded-lg"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
