import React, { useState, useEffect } from "react";
import "./circularProgressBar.scss";

interface CircularProgressBarProps {
  CurrentValue: number;
  StartValue: number;
  EndValue: number;
  LowValue: number;
  HighValue: number;
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
  HighValue,
  Units,
  InnerColor,
  TextColor,
  Icon,
  Title,
}) => {
  const [ShowCurrentValue, setCurrentValue] = useState<number>(0);
  const [BarColor, setBarColor] = useState("#e74c3c");
  const [DashOffSet, setDashOffSet] = useState(0);
console.log(CurrentValue);
  const IntervalTime: number = 30; // here use mili seconds
  //const [AnimationTime,setAnimationTime] = useState(30);

  useEffect(() => {
    setCurrentValue(StartValue);
  }, []);

  useEffect(() => {
    CalCulateScal(StartValue, EndValue, CurrentValue);
  }, []);

  useEffect(() => {
    HandelScaleValue(CurrentValue);
  }, []);

  const HandelScaleValue = (value: number) => {
    if (value === ShowCurrentValue) {
      return;
    }
    const Steps = Math.abs(value - ShowCurrentValue);
    const Increment = (value - ShowCurrentValue) / Steps;
    const IntervalId: number = setInterval(() => {
      setCurrentValue((prevValue) => {
        const NewValue = prevValue + Increment;
        console.log(NewValue);
        if (Math.abs(NewValue - value) <= Math.abs(Increment)) {
          clearInterval(IntervalId);
          return value;
        }
        return NewValue;
      });
    }, IntervalTime);

    return () => clearInterval(IntervalId);
  };

  const CalDashOffValue = (scalevalue: number) => {
    const percentage = scalevalue / 100;
    const DashOffCal = Math.floor(480 - 480 * percentage);
    setDashOffSet(DashOffCal);
  };

  const UpdateBarColor = (value: number) => {
    let color: string;

    //const MidPoint = ((LowValue +HighValue)/2 ) + LowValue;

    if (value >= HighValue) {
      // Above or equal to HighValue, set to green
      color = "#2ecc71";
    } else if (value <= LowValue && value >= EndValue) {
      // Below or equal to LowValue, set to red
      color = "#e74c3c";
    } else {
      // Calculate the ratio of ShowCurrentValue between LowValue and HighValue
      const ratio = (value - LowValue) / (HighValue - LowValue);

      // Interpolate between red and green based on the ratio
      const red = Math.floor(255 * (1 - ratio));
      const green = Math.floor(255 * ratio);
      color = `rgb(${red}, ${green}, 0)`;
    }

    setBarColor(color);
  };

  const CalCulateScal = (Start: number, End: number, value: number) => {
    const Range = 100 / (End - Start);
    const div = (value - Start) * Range;
    UpdateBarColor(div);
    CalDashOffValue(div);
  };
  //console.log(ShowCurrentValue);
  //console.log(BarColor);
  //console.log(DashOffSet);

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
