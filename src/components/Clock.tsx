import React, { useEffect, useRef } from "react";
import '@/styles/clock.css';

interface ClockProps {
  time: number; // expected in milliseconds
  setTime:React.Dispatch<React.SetStateAction<number>>;
  stop: boolean;
  increment?: number; // in seconds
  className?: string;
}
const Clock: React.FC<ClockProps> = ({ time, setTime, stop, increment = 0, className }) => {

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addTime = (miliseconds: number,prevTime:number): number => {
    return prevTime + miliseconds;
  };

  const decreaseTime = (miliseconds: number, prevTime:number): number =>{
    if(prevTime-miliseconds<0) return 0;
    else return prevTime-miliseconds;
  }

  useEffect(() => {
    if (stop) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTime((prevTime) => addTime(increment, prevTime));
    } else {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => decreaseTime(100,prevTime));
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stop]);

  return (
    <div className={`clock-container ${className}`}>
      <div className="clock">
        {Math.floor(time / 60000).toString().padStart(2, "0")}:
        {Math.floor((time % 60000) / 1000).toString().padStart(2, "0")}
        { (time <30*1000)
          ? `:${Math.round((time % 1000) / 100).toString().padStart(2, "0")}`
          : ""}
      </div>
    </div>
  );
};

export default Clock;
