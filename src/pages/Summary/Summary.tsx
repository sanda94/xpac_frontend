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
import DownloadExcel from '../../helper/DownloadXcel';

type DeviceData = {
  id: string;
  ruleId:string;
  deviceTitle: string;
  assignedProduct:string,
  category:string;
  itemCount: number;
  minItemCount: number;
  minBatteryPercentage: string;
  minBatteryVoltage:string;
  unitWeight: number;
  location: string;
  offSet: string;
  calibrationValue: string;
  status: string;
  batteryPercentage: number;
  batteryVoltage:number;
  itemCountDecreaseBy: number;
  itemCountIncreaseBy: number;
  totalWeight:number;
  refilingStatus: string;
  description: string;
  message: string;
  dateCreated:string;
  timeCreated:string;
}

// SortableItem component using dnd-kit
interface SortableItemProps {
  id: string;
  datas: DeviceData;
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
  const [filteredData, setFilteredData] = useState<DeviceData[]>([]); // State for filtered data
  const [isDragEnabled, setIsDragEnabled] = useState<boolean>(false); // State for enabling/disabling drag-and-drop
  const [isLoading , setLoading] = useState<boolean>(true);

  useEffect(() => {
    if(!Token){
      navigate("/");
    }
  },[]);

  useEffect(() => {
    FetchData();

    const intervalId = setInterval(() => {
      FetchData();
    }, 600000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  },[])

  const FetchData = async() => {
    let Url:string;
    let Header:object;
    if(UserType === "Customer" || UserType === "Moderator"){
      Url = `${baseUrl}/device/all/summary/user`;
      Header = {
        token:`Bearer ${Token}`,
        user: UserId
      }
    }else{
      Url = `${baseUrl}/device/all/summary/${UserId}`;
      Header = {
        token:`Bearer ${Token}`,
      }
    }
    try {
      const response = await axios.get(Url,{
        headers: Header
      });
      console.log("Url:" , Url);
      console.log("Responsee Data: ",response.data);
      if(response.data.status){
        const devices: DeviceData[] = response.data.devices.map((device:any) => ({
          ruleId:device.ruleId,
          id: device._id,
          deviceTitle: device.title,
          category:device.category,
          assignedProduct:device.assignedProduct,
          itemCount: Number(device?.deviceData?.itemCount),
          minItemCount: Number(device.minItems),
          unitWeight: Number(device.unitWeight),
          minBatteryPercentage: device.minBatteryPercentage,
          minBatteryVoltage: device.minBatteryVoltage,
          batteryPercentage: Number(device?.deviceData?.batteryPercentage),
          batteryVoltage: Number(device?.deviceData?.batteryVoltage),
          itemCountDecreaseBy: Number(device?.deviceData?.itemCountDecreaseBy),
          itemCountIncreaseBy: Number(device?.deviceData?.itemCountIncreaseBy),
          totalWeight: Number(device?.deviceData?.totalWeight),
          location: device.location,
          offSet: device.offSet,
          calibrationValue: device.calibrationValue,
          status: device.status,
          refilingStatus: device.refilingStatus,
          description: device.description,
          message: device.message,
          dateCreated:device?.deviceData?.dateCreated,
          timeCreated:device?.deviceData?.timeCreated
        }));
        setDeviceData(devices);
      }else{
        notify(response.data.error.message , 'error');
      }
    } catch (error:any) {
      console.log(error);
      notify(error.response.data.error.message, "error"); 
    }finally{
      setLoading(false);
    }
  };

  const saveOrder = async(order:any) => {
    try {
      const data = {
        userId: UserId,
        orderList:order
      }

      const response = await axios.post(`${baseUrl}/dnd/create-or-update` , data , {
        headers:{
          token: `Bearer ${Token}`
        }
      });

      if(response.data.status){
        console.log(response.data.success.message);
      }
    } catch (error:any) {
      console.log(error);
      notify(error.response.data.error.message, "error"); 
    }
  }    

  const SortableItem: React.FC<SortableItemProps> = ({ id, datas }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className='z-0'>
        <SummaryCard
          id={datas.id}
          deviceTitle={datas.deviceTitle ?? 'Unknown Device'}
          itemCount={datas.itemCount ?? 0}
          minCount={datas.minItemCount ?? 0}
          unitWeight={datas.unitWeight ?? 0}
          location={datas.location ?? 'Unknown Location'}
          status={datas.status ?? 'Unknown'}
          batteryPercentage={datas.batteryPercentage ?? 0}
          refilingStatus={datas.refilingStatus ?? 'None'}
          description={datas.description ?? 'No description available'}
          message={datas.message ?? "None"}
          isDrag={isDragEnabled}
        />
      </div>
    );
  };
  
  // Save the deviceData order to localStorage when it changes
const saveOrderToLocalStorage = async(data: DeviceData[]) => {
  const validData = data.filter((device) => device !== undefined); // Filter out undefined values
  const order = validData.map((device) => device.ruleId);
  await saveOrder(order);
};


  // Handler for drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFilteredData((items) => {
        const oldIndex = items.findIndex((item) => item.ruleId === active.id);
        const newIndex = items.findIndex((item) => item.ruleId === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveOrderToLocalStorage(newItems); 
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

  const downloadExcelFile = async() => {
    if (deviceData.length === 0) {
      notify("No data available to download.", "warning");
      return;
    }
  
    const data = deviceData.map((device) => ({
      id: device.id,
      title: device.deviceTitle,
      category: device.category,
      assignProduct: device.assignedProduct,
      location: device.location,
      unitWeight: device.unitWeight,
      minItems: device.minItemCount,
      batteryPercentage: device.batteryPercentage,
      batteryVoltage: device.batteryVoltage,
      totalWeight: device.totalWeight,
      itemCount: device.itemCount !== undefined ? device.itemCount : 0,
      itemCountIncreaseBy: device.itemCountIncreaseBy,
      itemCountDecreaseBy: device.itemCountDecreaseBy,   
      status: device.status,
      refilingStatus: device.refilingStatus,
      dateCreated:device.dateCreated,
      timeCreated:device.timeCreated
    }));

    const type = "all_devices_data";
    const baseUrl = "http://localhost:3300/api";

    await DownloadExcel({data , type , baseUrl})    
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
    {isLoading ? (
      <div style={{color:colors.grey[100]}} className='mt-10 text-lg font-semibold'>Loading...</div>
    ) : (  
    <div>
      {filteredData.length > 0 ? (
        isDragEnabled ? (
         // Update the SortableContext to use ruleId instead of id
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredData.map((item) => item.ruleId)} strategy={verticalListSortingStrategy}>
            <div className={`flex flex-wrap w-full min-h-[100vh] gap-5 overflow-y-auto z-0 
              ${filteredData.length >= 3 ? "lg:justify-start md:justify-center" : filteredData.length < 3 ? "lg:justify-start" : ""}`}>
              {filteredData.map((d) => (
                <div key={d.ruleId} className="z-0 mt-4 sm:w-full md:w-auto">
                  <SortableItem id={d.ruleId} datas={d} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        ) : (
          <div className={`flex flex-wrap w-full min-h-[100vh] gap-5 overflow-y-auto z-0 
            ${filteredData.length >= 3 ? "lg:justify-start md:justify-center" : filteredData.length < 3 ? "lg:justify-start" : ""}`}>
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
        <div style={{color:colors.grey[100]}} className='mt-10 text-lg font-semibold'>No devices found...</div>
      )}
    </div>
    )}
    </div>
  );
};

export default Summary;
