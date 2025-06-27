import { useEffect, useState } from "react";

export const Timer = ({ onTimerEnd }) => {
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let interval;

    if (running && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (seconds === 0) {
      setRunning(false);
      onTimerEnd();
    }

    return () => clearInterval(interval);
  }, [running, seconds, onTimerEnd]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };



  return <div>{formatTime(seconds)}</div>;
};
