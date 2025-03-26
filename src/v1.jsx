// Version 1
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
    getFormattedTime,
    getFormattedDate,
    getFormattedAlarmTime,
    requestWakeLock,
    releaseWakeLock,
} from './useAlarmUtils';

function App() {
    const [dateTime, setDateTime] = useState(new Date());
    const [alarmTime, setAlarmTime] = useState(() => {
        const alarm = new Date();
        alarm.setSeconds(alarm.getSeconds() + 10);
        return alarm;
    });
    const [alarmTriggered, setAlarmTriggered] = useState(false);
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const alarmStartTimeRef = useRef(null);
    const alarmDurationTimeoutRef = useRef(null);
    const wakeLockRef = useRef(null);

    const time = getFormattedTime(dateTime);
    const date = getFormattedDate(dateTime);
    const alarmTimeStr = getFormattedAlarmTime(alarmTime);

    const handleVisibilityChange = async () => {
        if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
    };

    const stopAlarm = () => {
        if (alarmDurationTimeoutRef.current) {
            clearTimeout(alarmDurationTimeoutRef.current);
            alarmDurationTimeoutRef.current = null;
        }
        console.log('⏹ Alarm stopped');
        setAlarmTriggered(false);
        setIsAlarmActive(false);
        const newAlarm = new Date();
        newAlarm.setSeconds(newAlarm.getSeconds() + 10);
        setAlarmTime(newAlarm);
        alarmStartTimeRef.current = null;
    };

    useEffect(() => {
        requestWakeLock(wakeLockRef, handleVisibilityChange);
        return () => {
            releaseWakeLock(wakeLockRef, handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setDateTime(now);

            if (!alarmTriggered && Math.abs(now - alarmTime) < 1000) {
                console.log('⏰ Alarm ringing!');
                setAlarmTriggered(true);
                setIsAlarmActive(true);
                alarmStartTimeRef.current = new Date();
            }

            if (alarmTriggered && alarmStartTimeRef.current) {
                const elapsed = now - alarmStartTimeRef.current;
                if (elapsed >= 10000) { // 10 seconds
                    console.log('⏰ Alarm auto-stopped after 10 seconds');
                    stopAlarm();
                }
            }
        }, 1000);

        return () => {
            clearInterval(timer);
            if (alarmDurationTimeoutRef.current) {
                clearTimeout(alarmDurationTimeoutRef.current);
            }
        };
    }, [alarmTime, alarmTriggered]);

    return (
        <div className="App">
            <div className="date-time-container">
                <div className="time">{time}</div>
                <div className="date">{date}</div>
            </div>

            <div className="alarm-container">
                <div>Next Alarm: {alarmTimeStr}</div>
                {isAlarmActive && (
                    <button onClick={stopAlarm}>Stop Alarm</button>
                )}
            </div>
        </div>
    );
}

export default App;
