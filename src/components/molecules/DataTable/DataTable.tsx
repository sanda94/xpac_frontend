import React, { useState } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import "./dataTable.scss";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTheme } from '../../../context/Theme/ThemeContext';
import RulePopup from '../Rule/Rule';
import CategoryPopup from '../Category/Category';
import LocationPopup from '../Location/Location';
import axios from 'axios';
import { useBaseUrl } from '../../../context/BaseUrl/BaseUrlContext';
import { useToast } from '../../../context/Alert/AlertContext';

type Props = {
  columns: GridColDef[];
  rows: Object[];
  slug: string;
  statusChange: (id: string, newStatus: string) => void;
  fetchData: () =>  void;
};

// ---------- Rule Data Interface ----------
interface RuleData {
  _id: string,
  deviceId:string,
  userId:string,
  userName:string,
  deviceName:string,
  imageUrl:string,
  emailStatus: string
};

interface CategoryData {
  _id:string,
  category:string,
  description:string
};

interface LocationData {
  _id:string,
  location:string,
  description:string
};

const DataTable: React.FC<Props> = (props: Props) => {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const UserType = savedUserData.userType;
  const Token = savedUserData.accessToken;
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedRuleData, setSelectedRuleData] = useState<RuleData | null>(null);
  const [selectCategorydata , setSelectCategoryData] = useState<CategoryData | null>(null);
  const [selectLocationData , setSelectLocationData] =  useState<LocationData | null>(null) 
  const {theme , colors} = useTheme();
  const { baseUrl } = useBaseUrl();
  const { notify } = useToast();

  const openPopup = (rowData:any) => {
    setIsFormOpen(true);
    if (props.slug === "rules") {
      setSelectedRuleData(rowData);
    } else if (props.slug === "categories") {
      setSelectCategoryData(rowData);
    } else if (props.slug === "locations") {
      setSelectLocationData(rowData);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleDelete = (id: any, imageUrl: any , slug:string) => {
    Swal.fire({
      title: "",
      text: "Are you sure you want to delete data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor:theme === 'dark' ? "#86D293" : '#73EC8B',
      cancelButtonColor: theme === 'dark' ? "#B8001F" : "#C7253E" ,
      background:colors.primary[400],
      iconColor:"#FF0000",
      confirmButtonText: "Ok",
      color:colors.grey[100],
      allowOutsideClick: false
  }).then((result) => {
      if(result.isConfirmed){
        DeleteData(id , imageUrl , slug);
      }
  })
    console.log(id , imageUrl);
  };

  const DeleteImage = async(url:string) => {
    if(url === null || url === undefined){
      return;
    }
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
      notify(error.response.data.error.message, "error"); 
    }
  }

  const DeleteData = async(id:string , imageUrl:string , slug:string) => {
    try {
      if(imageUrl){
        DeleteImage(imageUrl);
      }
     const response = await  axios.delete(`${baseUrl}/${slug}/delete/${id}`,{
      headers: {
        token: `Bearer ${Token}`,
      },
     });
      if(response.data.status){
        Swal.fire({
          title: "",
          text: "Delete Successfully!",
          icon: "success",
          showCancelButton: false,
          confirmButtonColor:theme === 'dark' ? "#86D293" : '#73EC8B',
          background:colors.primary[400],
          iconColor:"#06D001",
          confirmButtonText: "Ok",
          color:colors.grey[100],
          allowOutsideClick: false
        });
        props.fetchData();
      }else{
        Swal.fire({
          title: "",
          text: "Delete Failed!",
          icon: "error",
          showCancelButton: false,
          confirmButtonColor:theme === 'dark' ? "#86D293" : '#73EC8B',
          background:colors.primary[400],
          iconColor:"#06D001",
          confirmButtonText: "Ok",
          color:colors.grey[100],
          allowOutsideClick: false
        });
      }
    } catch (error:any) {
      console.log(error);
      notify(error.response.data.error.message, "error"); 
    }
  }

  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Action",
    minWidth:100,
    maxWidth:105,
    flex:1,
    renderCell: (params) => {
      return (
        <div className="action">
          {props.slug !== "rules" && props.slug !== "categories" && props.slug !== "locations" ? (
            <Link to={`/${props.slug}/${params.row._id}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="icon view w-[20px] h-[20px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </Link>
          ) : UserType === "Admin" ? (
            <div className="edit" onClick={() => openPopup(params.row)}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="icon w-[20px] h-[20px]">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
          ) : null}
          {UserType === "Admin" ? (
            <div
              className="delete"
              onClick={() =>
                handleDelete(params.row._id, params.row.imageUrl ? params.row.imageUrl : "" , props.slug)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="icon w-[20px] h-[20px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </div>
          ) : null}
        </div>
      );
    },
  };

  return (
    <div className="z-0 dataTable">
     <DataGrid
    className="dataGrid"
    rows={props.rows}
    getRowId={(row) => row._id}
    columns={[
        ...props.columns.map((column) => ({
            ...column,
            flex: 1, // Apply flex to make columns responsive
        })),
        ...(props.slug === "rules" && UserType !== "Admin" ? [] : [actionColumn]),
    ]}
    initialState={{
        pagination: {
            paginationModel: {
                pageSize: 10,
            },
        },
        filter: {
            filterModel: {
                items: [],
                quickFilterValues: [""],
            },
        },
    }}
    slots={{ toolbar: GridToolbar }}
    slotProps={{
        toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
            printOptions: { disableToolbarButton: true },
        },
    }}
    pageSizeOptions={[5]}
    disableRowSelectionOnClick
    disableDensitySelector
    style={{ minHeight: "500px" }}
/>

      {isFormOpen && props.slug === "rules" && (
          <RulePopup 
            ruleData={selectedRuleData} 
            onClose={() => closeForm()} 
            fetchData={props.fetchData}
          />
      )}
      {isFormOpen && props.slug === "categories" && (
          <CategoryPopup 
            categoryData={selectCategorydata} 
            onClose={() => closeForm()} 
            fetchData={props.fetchData}
          />
      )}
      {isFormOpen && props.slug === "locations" && (
          <LocationPopup 
            locationData={selectLocationData} 
            onClose={() => closeForm()} 
            fetchData={props.fetchData}
          />
      )}
    </div>
  );
};

export default DataTable;
