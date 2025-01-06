import React from 'react';
import CircularProgressBar from '../CircularProgressBar/CircularProgressBar';
import { useNavigate } from 'react-router-dom';
import { TbBattery , TbBattery1 , TbBattery2 , TbBattery3 , TbBattery4 } from "react-icons/tb";

interface SummaryCardProps {
  id:string,
  deviceTitle: string;
  itemCount: number;
  minCount: number;
  unitWeight: number;
  location: string;
  status: string;
  batteryPercentage: number;
  poNumber: string;
  description: string;
  message:string;
  isDrag:boolean
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  id,
  deviceTitle,
  itemCount,
  minCount,
  unitWeight,
  location,
  status,
  batteryPercentage,
  poNumber,
  description,
  message,
  isDrag
}) => {
  const navigate = useNavigate();

  const handelNavigate = (id:string) => {
    navigate(`/device/${id}`)
  } 
  return (
    <div
      style={{ zIndex: 999, pointerEvents: isDrag ? 'none' : 'auto', opacity: isDrag ? 0.6 : 1 }}
      className={`p-6 rounded-lg z-30 md:max-w-[480px] lg:max-w-[480px] sm:max-w-[95%] md:h-[450px] relative md:min-h-[450px] w-full overflow-hidden 
        ${ status === "Inactive" ? "bg-red-100" : "bg-green-100"}`}
    >
      
      <h2 
        className="text-xl font-bold text-gray-800 cursor-default"
      >
        {deviceTitle}
      </h2>
      <div className="grid gap-4 mt-4 cursor-default md:grid-cols-2">
        <div className="col-span-1">
        <p>
            <span 
                className="font-semibold"
                data-tooltip-id="unitWeightTooltip"
                data-tooltip-content={`Weight of each unit in ${unitWeight} kg`}>Min Items Count: <span className='font-normal'>{minCount ? minCount : 0}</span></span>
          </p>
          <p>
            <span 
                className="font-semibold"
                data-tooltip-id="unitWeightTooltip"
                data-tooltip-content={`Weight of each unit in ${unitWeight} kg`}>Unit Weight: <span className='font-normal'>{unitWeight ? unitWeight : 0}</span></span>
          </p>
          <p>
            <span 
                className="font-semibold" 
                data-tooltip-id="locationTooltip"
                data-tooltip-content={`Location: ${location}`}>Location: <span className='font-normal'>{location}</span></span> 
          </p>
          <div className="flex flex-row items-center justify-start gap-5 mt-5 md:gap-1">
            <span
              className={`px-4 py-3 md:px-3 md:py-3 w-full text-[12px] text-black cursor-default transition-colors duration-300 text-center mdLw-auto rounded-lg ${
                status === 'Active' ? 'bg-green-300 text-black' : 'bg-red-300 text-black'
              }`}
              data-tooltip-id="statusTooltip"
              data-tooltip-content={`Status: ${status}`}
            >
              {status}
            </span> 
            <button 
               onClick={() => handelNavigate(id)}
               style={{ zIndex: 10000 }} 
               onMouseDown={(e) => e.stopPropagation()} 
               draggable={false}
               className={`
                  z-50 px-4 py-3 w-full text-[12px] text-black bg-orange-300 transition-colors duration-300 rounded-lg 
                  ${!isDrag ? "cursor-pointer hover:bg-orange-200" : ""}
                `}
            >
              More
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center col-span-1" 
            data-tooltip-id="itemCountTooltip"
            data-tooltip-content={`Item Count: ${itemCount}`}>
          <CircularProgressBar
            CurrentValue={String(itemCount) === "NaN" ? 0 : itemCount}
            StartValue={0}
            EndValue={itemCount > 100 ? itemCount : 100}
            LowValue={Number(minCount)}
            Units=""
            InnerColor="#F78F5E"
            TextColor="#1f2937"
            Icon=""
            Title="Item Count"
          />
        </div>
      </div>
      <div className='mb-5 cursor-default lg:mb-2'>
      <p>
            <span 
                className="font-semibold"
            >PO Number: <span className='font-normal'>{poNumber !== "" ? poNumber : "None"}</span></span>
          </p>
      </div>
      <div className="mb-5 cursor-default lg:mb-2">
        <p className="font-semibold">Description:</p>
        <p 
          className="overflow-hidden line-clamp-2 text-ellipsis"
          style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
        >
          {description}
        </p>
      </div>
      <div className="mb-5 cursor-default lg:mb-2">
        <p className="" style={{ maxHeight: '60px' }}>
          <strong className='font-semibold'>Message:</strong> {message}
        </p>
      </div>
      <div className="absolute flex items-center gap-2 cursor-default bottom-2 right-6">
        <span className='text-4xl'>{
          batteryPercentage === 0 ? <TbBattery /> :
          batteryPercentage > 0 && batteryPercentage <= 40 ? <TbBattery1 /> :
          batteryPercentage > 40 && batteryPercentage <= 60 ? <TbBattery2 /> :
          batteryPercentage > 60 && batteryPercentage <= 80 ? <TbBattery3 /> :
          batteryPercentage > 80 && batteryPercentage <= 1000 ? <TbBattery4 /> :
          null
        }</span>
        <span
          className={`text-lg font-semibold ${
            batteryPercentage === 0
              ? 'text-red-600'
              : batteryPercentage > 0 && batteryPercentage <= 20
              ? 'text-red-600'
              : batteryPercentage > 20 && batteryPercentage <= 50
              ? 'text-orange-600'
              : batteryPercentage > 50 && batteryPercentage < 75
              ? 'text-yellow-500'
              : batteryPercentage >= 75 && batteryPercentage <= 100
              ? 'text-green-600'
              : ''
          }`}
          data-tooltip-id="batteryTooltip"
          data-tooltip-content={`${batteryPercentage}% Battery Remaining`}
        >
          {batteryPercentage}%
        </span>
      </div>
    </div>
  );
};

export default SummaryCard;
