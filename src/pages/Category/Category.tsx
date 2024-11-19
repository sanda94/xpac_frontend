import React, {useState , useEffect} from 'react';
import { DataTable , PageHeader } from '../../components/molecules';
import { useTheme } from '../../context/Theme/ThemeContext';
import { useBaseUrl } from '../../context/BaseUrl/BaseUrlContext';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { useToast } from '../../context/Alert/AlertContext';
import Swal from 'sweetalert2';

// Define columns for Devices page
const columns: GridColDef[] = [
    {
      field: 'category',
      headerName: 'Category',
      width: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
    }
  ];  

const Category:React.FC = () => {
    const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const Token = savedUserData.accessToken;
    const UserType = savedUserData.userType;
    const { colors , theme } = useTheme();
    const [isFormOpen , setIsFormOpen] = useState<boolean>(false);
    const { baseUrl } = useBaseUrl();
    const navigate = useNavigate();
    const { notify } = useToast();
    const [categoryData , setCategoryData] = useState<{
        _id:string,
        category:string,
        description:string
    }[]>([])
    const [category , setCategory] = useState<{
        category:string,
        description:string
    }>({
        category:"",
        description:""
    });
    const [isLoading , setLoading] = useState<boolean>(true); 

    useEffect(() => {
        if(!Token){
          navigate("/");
        }else{
          FetchData();
        }
      },[Token]);

      const FetchData = async() => {
        try {
            const response = await axios.get(`${baseUrl}/categories/all`,{
                headers: {
                    token: `Bearer ${Token}`,
                  },
            });
            if(response.data.status){
                setCategoryData(response.data.categories);
            }else{
              console.log(response.data.error.message);
            }
        } catch (error:any) {
          console.log(error);
          notify(error.response.data.error.message, "error"); 
        }finally{
          setLoading(false);
        }
      }

      const CreateCategory = async() => {
        const data ={
            category:category.category,
            description:category.description
        }

        try {
            const response = await axios.post(
              `${baseUrl}/categories/create`, data,
              {
                headers:{
                  token: `Bearer ${Token}`,
                }
              }
            )
      
            if(response.data.status){
              Swal.fire({
                title: "",
                text: "New Category Created Successfully!",
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
              setIsFormOpen(false);
            }
          } catch (error:any) {
            console.log(error);
            notify(error.response.data.error.message, "error"); 
          }
      }

    const HandleSubmit = () => {
        if(!category.category){
            notify('Add category before click save button' , 'info');
            return;
          }
          if(!category.description){
            notify('Add description before click save button' , 'info');
            return;
          }
          Swal.fire({
            title: "",
            text: "Are you sure you want to Create New Category?",
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
              CreateCategory();
            }
        });
    }

    const statusChange = () => {

    }
  
  return (
    <div className='z-[100]'>
      <div className="flex items-center justify-between gap-10 lg:justify-start">
        <PageHeader title="CATEGORIES MANAGEMENT" subTitle="This is The Categories Management Page." />
        {UserType === "Admin" && !isLoading && <button 
          onClick={() => setIsFormOpen(true)} 
          className={`bg-orange-400 px-4 py-3 text-[12px] rounded-md hover:bg-orange-300 duration-300 transition-colors`}
        >
          Add New Category
        </button>}
      </div>
      {isLoading ? (
        <div style={{color:colors.grey[100]}} className='mt-10 text-lg font-semibold'>Loading...</div>
      ) : (
        <div>
          {categoryData.length > 0 ? (
            <div className="min-h-[75vh] mt-5 overflow-y-auto">
              <DataTable 
                slug="categories" 
                columns={columns} 
                rows={categoryData}
                statusChange={statusChange}
                fetchData={FetchData} 
              />
            </div>
          ) : (
            <p style={{color:colors.grey[100]}} className='mt-10 text-lg font-semibold'>No Data Available...</p>
          )}
       </div>
    )}

      {/* Popup Form for Adding New Rule */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-50">
          <div className="w-full p-8 bg-white rounded-lg lg:w-2/3">
            <h2 className="mb-4 text-lg font-bold text-center text-black">Add New Category</h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>  
                <label className='w-full font-semibold text-[13px]'>Category</label>
              <input
                type="text"
                name="category"
                placeholder='Category'
                onChange={(e) => setCategory({...category , category:e.target.value})}
                className="w-full p-2 mt-2 border text-[12px] rounded-md"
              />
              </div>
              <div>  
                <label className='w-full font-semibold text-[13px]'>Description</label>
              <input
                type="text"
                name="description"
                placeholder='Description'
                onChange={(e) => setCategory({...category , description:e.target.value})}
                className="w-full p-2 mt-2 border text-[12px] rounded-md"
              />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                className="px-4 py-3 bg-gray-300 text-[12px] w-full rounded-md hover:bg-gray-400"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-3 text-white text-[12px] w-full bg-blue-500 rounded-md hover:bg-blue-600"
                onClick={HandleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Category