import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageHeader, SummaryCard } from '../../components/molecules';
import { useNavigate } from 'react-router-dom';
import { useBaseUrl } from '../../context/BaseUrl/BaseUrlContext';
import axios from 'axios';
import { useToast } from '../../context/Alert/AlertContext';
import { colors } from '@mui/material';
import { useTheme } from '../../context/Theme/ThemeContext';
import * as XLSX from 'xlsx';

type DeviceData = {
  id: string;
  ruleId:string;
  deviceTitle: string;
  itemCount: number;
  minItemCount: number;
  maxItemCount: number;
  unitWeight: number;
  location: string;
  status: string;
  batteryPercentage: number;
  refilingStatus: string;
  description: string;
  message: string;
}

// SortableItem component using dnd-kit
interface SortableItemProps {
  id: string;
  deviceData: DeviceData;
}

const Summary: React.FC = () => {
  const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const UserType = savedUserData.userType;
  const Token = savedUserData.accessToken;
  const UserId = savedUserData.userId;
  const {colors} = useTheme();
  const navigate = useNavigate();
  const { baseUrl } = useBaseUrl();
  const { notify } = useToast();
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State to capture search input
  const [filteredData, setFilteredData] = useState<DeviceData[]>(deviceData); // State for filtered data
  const [isDragEnabled, setIsDragEnabled] = useState<boolean>(false); // State for enabling/disabling drag-and-drop

  useEffect(() => {
    if(!Token){
      navigate("/");
    }else{
      FetchData();
    }
  },[])

  const FetchData = async() => {
    let Url:string;
    let Header:object;
    if(UserType === "Customer"){
      Url = `${baseUrl}/device/all/summary/user`;
      Header = {
        token:`Bearer ${Token}`,
        user: UserId
      }
    }else{
      Url = `${baseUrl}/device/all/summary`;
      Header = {
        token:`Bearer ${Token}`,
      }
    }
    try {
      const response = await axios.get(Url,{
        headers: Header
      });
      console.log("Url:" ,Url);
      if(response.data.status){
        const devices: DeviceData[] = response.data.devices.map((device:any) => ({
          ruleId:device.ruleId,
          id: device._id,
          deviceTitle: device.title,
          itemCount: Number(device.deviceData.itemCount),
          minItemCount: Number(device.minItems),
          unitWeight: Number(device.unitWeight),
          location: device.location,
          status: device.status,
          batteryPercentage: device.deviceData.batteryPercentage,
          refilingStatus: device.refilingStatus,
          description: device.description,
          message: device.message,
        }));
        setDeviceData(devices);
        //setFilteredData(devices);
        console.log("New Device Test: ",devices);
      }else{
        notify(response.data.error.message , 'error');
      }
    } catch (error) {
      console.log(error);
      notify("An unexpected error occurred. Please try again later.", "error");
    }
  };

  console.log("Filter Data: ",filteredData);

  // UseEffect to load data from localStorage on component mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('deviceOrder');
    console.log(savedOrder);
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder) as string[];
      const orderedData = parsedOrder
        .map((id) => deviceData.find((device) => device?.ruleId === id)) // Handle undefined values
        .filter((device): device is DeviceData => device !== undefined); // Ensure device is defined
      setDeviceData(orderedData);
      setFilteredData(orderedData); // Set filteredData when order is loaded
    }
  }, []);
  

  const SortableItem: React.FC<SortableItemProps> = ({ id, deviceData }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className='z-0'>
        <SummaryCard
          id={deviceData.id}
          deviceTitle={deviceData.deviceTitle ?? 'Unknown Device'}
          itemCount={deviceData.itemCount ?? 0}
          minCount={deviceData.minItemCount ?? 0}
          unitWeight={deviceData.unitWeight ?? 0}
          location={deviceData.location ?? 'Unknown Location'}
          status={deviceData.status ?? 'Unknown'}
          batteryPercentage={deviceData.batteryPercentage ?? 0}
          refilingStatus={deviceData.refilingStatus ?? 'None'}
          description={deviceData.description ?? 'No description available'}
          message={deviceData.message ?? "None"}
          isDrag={isDragEnabled}
        />
      </div>
    );
  };
  

  // Save the deviceData order to localStorage when it changes
  // Save the deviceData order to localStorage when it changes
const saveOrderToLocalStorage = (data: DeviceData[]) => {
  const validData = data.filter((device) => device !== undefined); // Filter out undefined values
  const order = validData.map((device) => device.id);
  console.log("Order: ", order);
  localStorage.setItem('deviceOrder', JSON.stringify(order));
};


  // Handler for drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDeviceData((items) => {
        const oldIndex = items.findIndex((item) => item.ruleId === String(active.id));
        const newIndex = items.findIndex((item) => item.ruleId === String(over.id));
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveOrderToLocalStorage(newItems); // Save new order to localStorage
        return newItems;
      });
    }
  };  

  // Handler for search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter the data based on the search term
  useEffect(() => {
    const filtered = deviceData.filter((device) => {
      return (
        device.deviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, deviceData]);

  const downloadExcelFile = () => {
    if (deviceData.length === 0) {
      notify("No data available to download.", "warning");
      return;
    }
  
    // Map the deviceData into a format compatible with Excel
    const excelData = deviceData.map((device) => ({
      'Device Title': device.deviceTitle,
      'Item Count': device.itemCount,
      'Min Item Count': device.minItemCount,
      'Unit Weight': device.unitWeight,
      'Location': device.location,
      'Status': device.status,
      'Battery Percentage': `${device.batteryPercentage}%`,
      'Refilling Status': device.refilingStatus,
      'Description': device.description,
      'Message': device.message
    }));
  
    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
  
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
  
    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Device Summary');
  
    // Generate the Excel file and trigger download
    XLSX.writeFile(workbook, 'Device_Summary.xlsx');
  }

  return (
    <div>
      <div className='flex items-center justify-between mt-8 lg:mt-0 lg:gap-10 lg:justify-start'>
        <PageHeader title='SUMMARY' subTitle='This is The Summary Page.' />
        <button
        onClick={downloadExcelFile}
          className={`bg-orange-400 px-4 py-3 text-[12px] rounded-md hover:bg-orange-300 duration-300 transition-colors`}
        >
          Download Excel
        </button>
      </div>
      <div className="flex flex-col items-center w-full gap-4 md:justify-between md:flex-row">
  {/* Search Bar */}
  <div className="w-full mt-4 md:w-6/12 lg:w-5/12">
    <input
      type="text"
      placeholder="Search by title or location"
      className="w-full px-4 py-2 text-[12px] border border-gray-300 rounded-md"
      value={searchTerm}
      onChange={handleSearchChange}
    />
  </div>

  {/* Toggle Button for Drag and Drop */}
  <div className="w-full md:w-auto">
    <button
      className={`px-4 py-3 text-[12px] mt-0 md:mt-4 w-full md:w-auto rounded-md transition-colors duration-300 ${isDragEnabled ? 'bg-red-400 hover:bg-red-300' : 'bg-green-400 hover:bg-green-300'}`}
      onClick={() => setIsDragEnabled(!isDragEnabled)}
    >
      {isDragEnabled ? 'Disable Reordering' : 'Enable Reordering'}
    </button>
  </div>
</div>
      {filteredData.length > 0 ? (
        isDragEnabled ? (
         // Update the SortableContext to use ruleId instead of id
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredData.map((item) => item.ruleId)} strategy={verticalListSortingStrategy}>
            <div className={`flex flex-wrap w-full min-h-[100vh] gap-5 overflow-y-auto z-0 
              ${filteredData.length >= 3 ? "lg:justify-start md:justify-center" : filteredData.length < 3 ? "lg:justify-between" : ""}`}>
              {filteredData.map((d) => (
                <div key={d.ruleId} className="z-0 mt-4 sm:w-full md:w-auto">
                  <SortableItem id={d.ruleId} deviceData={d} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        ) : (
          <div className={`flex flex-wrap w-full min-h-[100vh] gap-5 overflow-y-auto z-0 
            ${filteredData.length >= 3 ? "lg:justify-start md:justify-center" : filteredData.length < 3 ? "lg:justify-between" : ""}`}>
            {filteredData.map((d) => (
              <div key={d.ruleId} className="z-0 flex justify-center w-full mt-4 md:w-auto md:justify-start">
                <SummaryCard
                  id={d.id}
                  deviceTitle={d.deviceTitle}
                  itemCount={d.itemCount}
                  minCount={d.minItemCount}
                  unitWeight={d.unitWeight}
                  location={d.location}
                  status={d.status}
                  batteryPercentage={d.batteryPercentage}
                  refilingStatus={d.refilingStatus}
                  description={d.description}
                  message={d.message}
                  isDrag={isDragEnabled}
                />
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{color:colors.grey[100]}} className='mt-5'>No devices found.</div>
      )}
    </div>
  );
};

export default Summary;
