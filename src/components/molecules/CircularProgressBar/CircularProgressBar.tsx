import React, { useState, useEffect } from "react";
import "./circularProgressBar.scss";

interface CircularProgressBarProps {
  CurrentValue: number;
  StartValue: number;
  EndValue: number;
  LowValue: number;
  Units: string;
  InnerColor: string;
  TextColor: string;
  Icon: string;
  Title: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  CurrentValue,
  StartValue,
  EndValue,
  LowValue,
  Units,
  InnerColor,
  TextColor,
  Icon,
  Title,
}) => {
  const [ShowCurrentValue, setCurrentValue] = useState<number>(0);
  const [BarColor, setBarColor] = useState("#e74c3c");
  const [DashOffSet, setDashOffSet] = useState(0);
  const IntervalTime: number = 30; // milliseconds

  useEffect(() => {
    setCurrentValue(StartValue); // Initialize the progress value
  }, [StartValue]);

  useEffect(() => {
    CalCulateScal(StartValue, EndValue, CurrentValue);
  }, [StartValue, EndValue, CurrentValue]);

  useEffect(() => {
    HandelScaleValue(CurrentValue); // Handle progress updates
  }, [CurrentValue]);

  const HandelScaleValue = (targetValue: number) => {
    const Steps = Math.ceil(Math.abs(targetValue - ShowCurrentValue));
    const Increment = (targetValue - ShowCurrentValue) / Steps;

    let localValue = ShowCurrentValue;

    const IntervalId: number = setInterval(() => {
      localValue += Increment;

      if (Math.abs(localValue - targetValue) < 0.001) {
        setCurrentValue(targetValue);
        clearInterval(IntervalId);
      } else {
        setCurrentValue(localValue);
      }
    }, IntervalTime);
  };

  const CalDashOffValue = (scaleValue: number) => {
    const percentage = scaleValue / 100;
    const DashOffCal = Math.floor(480 - 480 * percentage);
    setDashOffSet(DashOffCal);
  };

  const UpdateBarColor = (value: number) => {
    let color: string;
    if (value > LowValue) {
      color = "#2ecc71"; // Green
    } else {
      color = "#e74c3c"; // Red
    } 
    setBarColor(color);
  };

  const CalCulateScal = (Start: number, End: number, value: number) => {
    const Range = 100 / (End - Start);
    const div = (value - Start) * Range;
    UpdateBarColor(value);
    CalDashOffValue(div);
  };

  return (
    <div className="progress-bar">
      <div
        className="outer"
        style={{
          boxShadow: `3px 3px 5px -1px #000000,
            -3px -3px 5px -1px #000000`,
        }}
      >
        <div
          className="inner"
          style={{ backgroundColor: InnerColor, border: InnerColor }}
        >
          <div>{Icon ? <img src={Icon} className="icon" /> : " "}</div>
          <div
            className="title"
            style={{ color: TextColor ? TextColor : "#ffffff" }}
          >
            {Title}
          </div>
          <div
            className="current-value"
            style={{ color: TextColor ? TextColor : "#ffffff" }}
          >
            {ShowCurrentValue
              ? ShowCurrentValue - Math.floor(ShowCurrentValue) === 0
                ? parseInt(ShowCurrentValue.toFixed(0)) < 10
                  ? "0" + ShowCurrentValue.toFixed(0)
                  : ShowCurrentValue.toFixed(0)
                : ShowCurrentValue.toFixed(1)
              : "0"}
            {Units ? Units : null}
          </div>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="180px"
        height="180px"
        className="c_svg"
      >
        <circle
          cx="90"
          cy="90"
          r="80"
          strokeLinecap="round"
          strokeDasharray="480"
          style={
            {
              "--BarColor": BarColor,
              "--DashOffSet": DashOffSet,
            } as React.CSSProperties
          }
        />
      </svg>
    </div>
  );
};

export default CircularProgressBar;
