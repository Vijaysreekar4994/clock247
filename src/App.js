import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  getFormattedTime,
  getFormattedDate,
  // getFormattedAlarmTime,
  requestWakeLock,
  releaseWakeLock,
  // requestFullScreen,
} from './useAlarmUtils';
import { saveAlarms, loadAlarms } from './localStorageServices';

const alarmSounds = [
  { label: 'Beep', value: 'beep.mp3' },
  { label: 'Chime', value: 'chime.mp3' },
  { label: 'Ring', value: 'ring.mp3' },
];

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [inputTime, setInputTime] = useState('');
  const [alarmNote, setAlarmNote] = useState('');
  // const [editingIndex, setEditingIndex] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [specificDate, setSpecificDate] = useState('');
  const [selectedSound, setSelectedSound] = useState(alarmSounds[0].value);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState(localStorage.getItem('alarmNote') || '');
  const [showNotes, setShowNotes] = useState(true);

  const alarmStartTimeRef = useRef(null);
  const alarmAudioRef = useRef(null);
  const wakeLockRef = useRef(null);
  const currentAlarmRef = useRef(null);

  const time = getFormattedTime(dateTime);
  // const timeWithSeconds = dateTime.toLocaleTimeString();
  const date = getFormattedDate(dateTime);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // const handleEditAlarm = (index) => {
  //   const alarm = alarms[index];
  //   setInputTime(`${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`);
  //   setSelectedDays(alarm.days || []);
  //   setSpecificDate(alarm.date || '');
  //   setSelectedSound(alarm.sound || alarmSounds[0].value);
  //   setAlarmNote(alarm.note || '');
  //   setEditingIndex(index);
  //   setIsModalOpen(true);
  // };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const el = document.documentElement;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;

    if (!document.fullscreenElement && request) {
      request.call(el).catch(err => console.warn('❌ Fullscreen error:', err.message));
    } else if (document.fullscreenElement && exit) {
      exit.call(document).catch(err => console.warn('❌ Exit fullscreen error:', err.message));
    }
  };

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNoteText(value);
    localStorage.setItem('alarmNote', value);
  };

  const toggleNotesView = () => {
    setShowNotes(prev => !prev);
  };

  const handleVisibilityChange = async () => {
    if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    }
  };
  // console.log(alarms)
  const stopAlarm = (isManual = true) => {
    console.log('⏹ Alarm stopped');
    setIsAlarmActive(false);

    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }

    if (window.__alarmResetTimeout) clearTimeout(window.__alarmResetTimeout);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();

    const alarmToDelete = currentAlarmRef.current;

    let updatedAlarms = alarms.filter(a => {
      const isSameAsRinging = alarmToDelete &&
        a.hour === alarmToDelete.hour &&
        a.minute === alarmToDelete.minute &&
        a.date === alarmToDelete.date &&
        JSON.stringify(a.days) === JSON.stringify(alarmToDelete.days);

      const isNonRepeating = (!a.days || a.days.length === 0);
      const isOneTimeAlarm = isSameAsRinging && isNonRepeating;

      const hasNoDays = !a.days || a.days.length === 0;
      const hasNoDate = !a.date || a.date === "";
      const isOneTime = hasNoDays && hasNoDate;

      const isExpiredOneTime = isOneTime &&
        (a.hour < nowHour || (a.hour === nowHour && a.minute < nowMinute));

      const isExpiredTodayDate = a.date === todayStr &&
        (a.hour < nowHour || (a.hour === nowHour && a.minute < nowMinute));

      // Delete if it's expired one-time or expired today-date alarm or the exact ringing one-time alarm
      return !(isExpiredOneTime || isExpiredTodayDate || isOneTimeAlarm);
    });

    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);

    currentAlarmRef.current = null;

    if (isManual) {
      const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      alarmStartTimeRef.current = now;
      window.__alarmResetTimeout = setTimeout(() => {
        alarmStartTimeRef.current = null;
      }, delay);
    } else {
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
      note: alarmNote.trim()
    };

    const updatedAlarms = [...alarms, newAlarm];
    // if (editingIndex !== null) {
    //   updatedAlarms[editingIndex] = newAlarm;
    // } else {
    //   updatedAlarms.push(newAlarm);
    // }

    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
    setInputTime('');
    setSelectedDays([]);
    setSpecificDate('');
    setSelectedSound(alarmSounds[0].value);
    setAlarmNote('');
    // setEditingIndex(null);
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
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();

    const stored = loadAlarms();
    const cleaned = stored.filter(a => {
      const hasNoDays = !a.days || a.days.length === 0;
      const hasNoDate = !a.date || a.date === '';
      const isOneTime = hasNoDays && hasNoDate;

      const isExpiredOneTime = isOneTime &&
        (a.hour < nowHour || (a.hour === nowHour && a.minute < nowMinute));

      const isExpiredTodayDate = a.date === todayStr &&
        (a.hour < nowHour || (a.hour === nowHour && a.minute < nowMinute));

      return !(isExpiredOneTime || isExpiredTodayDate);
    });

    setAlarms(cleaned);
    saveAlarms(cleaned);

    return () => releaseWakeLock(wakeLockRef, handleVisibilityChange);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDateTime(now);

      if (!isAlarmActive && !alarmStartTimeRef.current) {
        const triggeredAlarm = alarms.find(alarm => isAlarmMatch(alarm, now));
        if (triggeredAlarm) {
          currentAlarmRef.current = triggeredAlarm;
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
      <div className='content'>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Create Alarm</h2>
              <input
                type="time"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
              />
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                disabled={selectedDays.length > 0}
              />
              <div className='day-selection'>
                {weekdays.map(day => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      disabled={specificDate !== ''}
                    />
                    {day}
                  </label>
                ))}
              </div>
              <input
                type="text"
                placeholder="Optional note"
                value={alarmNote}
                onChange={(e) => setAlarmNote(e.target.value)}
              />
              <select value={selectedSound} onChange={(e) => setSelectedSound(e.target.value)}>
                {alarmSounds.map(sound => (
                  <option key={sound.value} value={sound.value}>{sound.label}</option>
                ))}
              </select>
              <div className="modal-buttons">
                <button onClick={() => {
                  addAlarm();
                  setIsModalOpen(false);
                }}>
                  Save Alarm
                </button>
                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
        }

        <div className="container-1" >
          <div className='date-time-container'>
            <div className="time">{time}</div>
            <div className="date">{date}</div>
          </div>
          <div className='add-alarm-view'>
            <button className='add-alarm-button' onClick={() => setIsModalOpen(true)}>Add Alarm</button>
          </div>
        </div>

        <div className="container-2">
          <div className='left-pane'>
            <h1>Upcoming alarms</h1>
            <div className='saved-alarms-view'>
              {alarms.length > 0 ? (
                alarms.map((alarm, index) => (
                  <div className='saved-alarm' key={index}>
                    <span style={{ fontSize: '40px' }}>
                      {alarm.hour.toString().padStart(2, '0')}:{alarm.minute.toString().padStart(2, '0')}
                    </span>
                    <h2 className='saved-alarm-info'>
                      {alarm.days.length !== 0 && (
                        <>
                          Repeat: {alarm.days.join(', ')}
                          <br />
                        </>
                      )}
                      {alarm.date && (
                        <>
                          Date: {alarm.date}
                          <br />
                        </>
                      )}
                      {alarm.note && (
                        <>
                          Note: {alarm.note}<br />
                        </>
                      )}
                      {/* Sound: {alarm.sound}<br /> */}
                    </h2>
                    {/* Alarm: {alarm.hour.toString().padStart(2, '0')}:{alarm.minute.toString().padStart(2, '0')} |
                      Days: {alarm.days.join(', ')} |
                      Date: {alarm.date || 'N/A'} |
                      Sound: {alarm.sound} */}
                    <div className='alarm-action-buttons-view'>
                      <button className='delete-alarm-button' onClick={() => deleteAlarm(index)}><span>&#10060;</span></button>
                      {/* <button className='edit-alarm-button' onClick={() => handleEditAlarm(index)}><span>✏️</span></button> */}
                    </div>

                  </div>
                ))
              ) : (
                <div>No alarms set</div>
              )}
            </div>
          </div>
          <div className="right-pane">
            <div className="notes-section">
              <div className="notes-header">
                <h1>Notes</h1>
                <button onClick={toggleNotesView}>{showNotes ? 'Hide' : 'Show'}</button>
              </div>
              {showNotes && (
                <textarea
                  className="notes-textarea"
                  value={noteText}
                  onChange={handleNoteChange}
                  placeholder="Type your notes here..."
                />
              )}
            </div>
          </div>
        </div>

        {
          isAlarmActive && (
            <div className="alarm-ring">
              ⏰ Alarm Ringing!
              <br />
              <br />
              <button className='stop-alarm-button' onClick={stopAlarm}>Stop Alarm</button>
            </div>
          )
        }
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            padding: '10px',
            border: 'none',
            borderRadius: '6px',
            background: 'transparent',
            color: '#ccc',
            fontSize: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            cursor: 'pointer'
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          ⛶
        </button>
      </div>
    </div >
  );
}

export default App;
