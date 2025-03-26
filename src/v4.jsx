// v4 everything working fine 

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  getFormattedTime,
  getFormattedDate,
  getFormattedAlarmTime,
  requestWakeLock,
  releaseWakeLock,
} from './useAlarmUtils';
import { saveAlarms, loadAlarms } from './localStorageServices';

const alarmSounds = [
  { label: 'Beep', value: 'beep.mp3' },
  { label: 'Chime', value: 'chime.mp3' },
  { label: 'Ring', value: 'ring.mp3' },
];

function App() {
  const [dateTime, setDateTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [inputTime, setInputTime] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [specificDate, setSpecificDate] = useState('');
  const [selectedSound, setSelectedSound] = useState(alarmSounds[0].value);
  const alarmStartTimeRef = useRef(null);
  const alarmAudioRef = useRef(null);
  const wakeLockRef = useRef(null);

  const time = getFormattedTime(dateTime);
  const timeWithSeconds = dateTime.toLocaleTimeString();
  const date = getFormattedDate(dateTime);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleVisibilityChange = async () => {
    if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    }
  };

  const stopAlarm = (isManual = true) => {
    // if stopped manually during the current minute
    // set startTimeRef to null at the first second of next minute

    // if it stops automatically
    // set startTimeRef to null directly

    console.log('⏹ Alarm stopped');
    setIsAlarmActive(false);

    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }

    if (window.__alarmResetTimeout) clearTimeout(window.__alarmResetTimeout);

    if (isManual) {
      // if stopped manually during the current minute
      // set startTimeRef to null at the first second of next minute
      const now = new Date();
      const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      alarmStartTimeRef.current = now;

      window.__alarmResetTimeout = setTimeout(() => {
        alarmStartTimeRef.current = null;
      }, delay);
    } else {
      // if it stops automatically
      // set startTimeRef to null directly
      alarmStartTimeRef.current = null;
    }
  };

  const deleteAlarm = (indexToDelete) => {
    const updatedAlarms = alarms.filter((_, index) => index !== indexToDelete);
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
  };


  const addAlarm = () => {
    if (!inputTime) return;
    const [hour, minute] = inputTime.split(':');
    const newAlarm = {
      hour: parseInt(hour),
      minute: parseInt(minute),
      days: [...selectedDays],
      date: specificDate,
      sound: selectedSound,
    };
    const updatedAlarms = [...alarms, newAlarm];
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
    setInputTime('');
    setSelectedDays([]);
    setSpecificDate('');
    setSelectedSound(alarmSounds[0].value);
  };

  const isAlarmMatch = (alarm, now) => {
    const nowTotalMins = now.getHours() * 60 + now.getMinutes();
    const alarmTotalMins = alarm.hour * 60 + alarm.minute;
    const matchesTime = Math.abs(nowTotalMins - alarmTotalMins) < 1;
    if (!matchesTime) return false;

    const hasDays = alarm.days && alarm.days.length > 0;
    const hasDate = alarm.date && alarm.date !== '';

    const matchesDay = hasDays ? alarm.days.includes(weekdays[now.getDay()]) : true;
    const matchesDate = hasDate ? alarm.date === now.toISOString().split('T')[0] : true;

    return matchesDay && matchesDate;
  };

  useEffect(() => {
    requestWakeLock(wakeLockRef, handleVisibilityChange);
    const stored = loadAlarms();
    setAlarms(stored);
    return () => releaseWakeLock(wakeLockRef, handleVisibilityChange);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDateTime(now);

      if (!isAlarmActive && !alarmStartTimeRef.current) {
        const triggeredAlarm = alarms.find(alarm => isAlarmMatch(alarm, now));
        if (triggeredAlarm) {
          console.log('⏰ Alarm ringing!');
          setIsAlarmActive(true);
          alarmStartTimeRef.current = now;
          if (alarmAudioRef.current) {
            alarmAudioRef.current.src = process.env.PUBLIC_URL + '/' + triggeredAlarm.sound;
            alarmAudioRef.current.loop = true;
            alarmAudioRef.current.load();
            alarmAudioRef.current.play().catch(err => console.warn('Playback error:', err));
          }
        }
      }

      if (isAlarmActive && alarmStartTimeRef.current) {
        const elapsed = now - alarmStartTimeRef.current;
        if (elapsed >= 120000) {
          console.log('⏰ Alarm auto-stopped after 2 minutes');
          stopAlarm(false);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, isAlarmActive]);


  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="App">
      <audio ref={alarmAudioRef} preload="auto" />

      <div className="date-time-container">
        <div className="time">{timeWithSeconds}</div>
        <div className="date">{date}</div>
      </div>

      <div className="alarm-input">
        <input
          type="time"
          value={inputTime}
          onChange={(e) => setInputTime(e.target.value)}
        />
        <input
          type="date"
          value={specificDate}
          onChange={(e) => setSpecificDate(e.target.value)}
        />
        <div>
          {weekdays.map(day => (
            <label key={day}>
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => toggleDay(day)}
              />
              {day}
            </label>
          ))}
        </div>
        <select value={selectedSound} onChange={(e) => setSelectedSound(e.target.value)}>
          {alarmSounds.map(sound => (
            <option key={sound.value} value={sound.value}>{sound.label}</option>
          ))}
        </select>
        <button onClick={addAlarm}>Add Alarm</button>
      </div>

      <div className="alarm-list">
        {alarms.length > 0 ? (
          alarms.map((alarm, index) => (
            <div key={index}>
              Alarm: {alarm.hour.toString().padStart(2, '0')}:{alarm.minute.toString().padStart(2, '0')} |
              Days: {alarm.days.join(', ')} |
              Date: {alarm.date || 'N/A'} |
              Sound: {alarm.sound}
              <button onClick={() => deleteAlarm(index)}>Delete</button>
            </div>
          ))
        ) : (
          <div>No alarms set</div>
        )}
      </div>

      {isAlarmActive && (
        <div className="alarm-ring">
          ⏰ Alarm Ringing!
          <br />
          <button className='stop-alarm-button' onClick={stopAlarm}>Stop Alarm</button>
        </div>
      )}
    </div>
  );
}

export default App;
