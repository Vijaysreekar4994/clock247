// v2.jsx
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
    const [alarms, setAlarms] = useState([]);
    const [alarmTriggered, setAlarmTriggered] = useState(false);
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const [inputTime, setInputTime] = useState('');
    const alarmStartTimeRef = useRef(null);
    const wakeLockRef = useRef(null);

    const time = getFormattedTime(dateTime);
    const date = getFormattedDate(dateTime);

    const handleVisibilityChange = async () => {
        if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
    };

    const stopAlarm = () => {
        console.log('⏹ Alarm stopped');
        setAlarmTriggered(false);
        setIsAlarmActive(false);
        alarmStartTimeRef.current = null;
    };

    const addAlarm = () => {
        if (!inputTime) return;
        const [hour, minute] = inputTime.split(':');
        const now = new Date();
        const alarm = new Date(now);
        alarm.setHours(parseInt(hour));
        alarm.setMinutes(parseInt(minute));
        alarm.setSeconds(0);
        if (alarm < now) alarm.setDate(alarm.getDate() + 1); // schedule for next day if past
        setAlarms([...alarms, alarm]);
        setInputTime('');
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

            if (!alarmTriggered) {
                const nextAlarm = alarms.find(alarm => Math.abs(now - alarm) < 1000);
                if (nextAlarm) {
                    console.log('⏰ Alarm ringing!');
                    setAlarmTriggered(true);
                    setIsAlarmActive(true);
                    alarmStartTimeRef.current = now;
                    setAlarms(prev => prev.filter(a => a !== nextAlarm));
                }
            }

            if (alarmTriggered && alarmStartTimeRef.current) {
                const elapsed = now - alarmStartTimeRef.current;
                if (elapsed >= 60000) { // 1 minute
                    console.log('⏰ Alarm auto-stopped after 1 minute');
                    stopAlarm();
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [alarms, alarmTriggered]);

    return (
        <div className="App">
            <div className="date-time-container">
                <div className="time">{time}</div>
                <div className="date">{date}</div>
            </div>

            <div className="alarm-input">
                <input
                    type="time"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    step="60"
                />
                <button onClick={addAlarm}>Add Alarm</button>
            </div>

            <div className="alarm-list">
                {alarms.length > 0 ? (
                    alarms.map((alarm, index) => (
                        <div key={index}>Alarm set for: {getFormattedAlarmTime(alarm)}</div>
                    ))
                ) : (
                    <div>No alarms set</div>
                )}
            </div>

            {isAlarmActive && (
                <div className="alarm-ring">
                    ⏰ Alarm Ringing!
                    <br />
                    <button onClick={stopAlarm}>Stop Alarm</button>
                </div>
            )}
        </div>
    );
}

export default App;
