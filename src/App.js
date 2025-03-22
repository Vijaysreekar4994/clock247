import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [dateTime, setDateTime] = useState(new Date());
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  }).replace(/(\w+), (\d+) (\w+) (\d+)/, '$2 $3 $4, $1')
  const wakeLockRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    requestWakeLock();
    return () => {
      clearInterval(timer);
      releaseWakeLock();
    };
  }, []);

  // Request Wake Lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock activated');

        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released');
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);
      } else {
        console.log('Wake Lock API not supported');
      }
    } catch (err) {
      console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
    }
  };

  // Handle visibility change
  const handleVisibilityChange = async () => {
    if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    }
  };

  // Release Wake Lock
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  return (
    <div className="App">
      <div className="date-time-container">
        <div className="time">{dateTime.toLocaleTimeString()}</div>
        <div className="date">{formattedDate}</div>
      </div>
    </div>
  );
}

export default App;
