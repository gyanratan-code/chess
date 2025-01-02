import React, { useState, useEffect, useRef } from "react";

interface ClockProps {
  totalTime: number; // expected in seconds
  increment?: number; // in seconds
  stop?: boolean;
}

const Clock: React.FC<ClockProps> = ({ totalTime, stop=false, increment = 0 }) => {
  const initialTime = {
    minute: Math.floor(totalTime / 60),
    second: totalTime % 60,
    milis: 0,
  };

  interface TimeFormat {
    minute: number;
    second: number;
    milis: number;
  }

  const [time, setTime] = useState<TimeFormat>(initialTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addTime = (seconds: number, times: TimeFormat): TimeFormat => {
    let newSeconds = times.second + seconds;
    let newMinutes = times.minute;
    if (newSeconds >= 60) {
      newMinutes += Math.floor(newSeconds / 60);
      newSeconds %= 60;
    }
    return { minute: newMinutes, second: newSeconds, milis: times.milis };
  };

  const subtractTime = (miliseconds: number, times: TimeFormat): TimeFormat => {
    let totalTimeInMillis = times.minute * 60000 + times.second * 1000 + times.milis - miliseconds;
    if (totalTimeInMillis < 0) {
      totalTimeInMillis = 0;
    }
    const helper = totalTimeInMillis % 60000;
    return {
      minute: Math.floor(totalTimeInMillis / 60000),
      second: Math.floor(helper / 1000),
      milis: Math.round(helper % 1000),
    };
  };

  useEffect(() => {
    if (stop) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTime((prevTime) => addTime(increment, prevTime));
    } else {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => subtractTime(10, prevTime));
      }, 10);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stop]);

  return (
    <div className="clock-container">
      <div className="clock">
        {time.minute.toString().padStart(2, "0")}:
        {time.second.toString().padStart(2, "0")}
        {time.minute === 0 && time.second < 30
          ? `.${(time.milis/10).toString().padStart(2, "0")}`
          : ""}
      </div>
    </div>
  );
};

export default Clock;
