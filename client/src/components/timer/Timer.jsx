import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./Timer.css"

const Timer = ({
  initialMinutes = 0,
  initialSeconds = 0,
  isRunning,
  onStop,
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

    
  useEffect(() => {
    let timerInterval = null;

    if (isRunning) {
      timerInterval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(timerInterval);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [isRunning, minutes, seconds]);

  // Notify the parent of the current time when timer stops
  useEffect(() => {
    if (!isRunning) {
      onStop({ minutes, seconds });
    }
  }, [isRunning, minutes, seconds, onStop]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  return (
    <div className="timer-display">
      {formatTime(minutes)}:{formatTime(seconds)}
    </div>
  );
};

export default Timer;

Timer.propTypes = {
  initialMinutes: PropTypes.number,
  initialSeconds: PropTypes.number,
  isRunning: PropTypes.bool,
  onStop: PropTypes.func,
};
