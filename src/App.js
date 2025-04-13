import React, { useState, useEffect, useRef } from 'react';
import './styles/App.scss';
import {
  getFormattedTime,
  getFormattedDate,
  // getFormattedAlarmTime,
  requestWakeLock,
  releaseWakeLock,
  getFormattedDay,
  // requestFullScreen,
} from './useAlarmUtils';
import { saveAlarms, loadAlarms } from './localStorageServices';
import { BsFullscreen, BsFullscreenExit, BsAlarm } from "react-icons/bs";
// import { IoAlarmOutline } from "react-icons/io5";
import WeatherFeature from './weatherFeature';
import { ReactComponent as IndiaFlag } from "./assets/in.svg"
import { ReactComponent as USAFlag } from "./assets/us.svg"
import { ReactComponent as DubaiFlag } from "./assets/ae.svg"
// import CustomHouseIcon from './assets/house';


const alarmSounds = [
  { label: 'Beep', value: 'beep.mp3' },
  { label: 'Chime', value: 'chime.mp3' },
  { label: 'Ring', value: 'ring.mp3' },
];

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [indiaTime, setIndiaTime] = useState('');
  const [usaTime, setUsaTime] = useState('');
  const [dubaiTime, setDubaiTime] = useState('');
  const [alarms, setAlarms] = useState([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [inputTime, setInputTime] = useState('');
  const [alarmNote, setAlarmNote] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [specificDate, setSpecificDate] = useState('');
  const [selectedSound, setSelectedSound] = useState(alarmSounds[1].value);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState(localStorage.getItem('alarmNote') || '');
  const [showNotes, setShowNotes] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const alarmStartTimeRef = useRef(null);
  const alarmAudioRef = useRef(null);
  const wakeLockRef = useRef(null);
  const currentAlarmRef = useRef(null);

  const isToday = specificDate === new Date().toISOString().split('T')[0];
  const [hour, minute] = inputTime?.split(':')?.map(Number) || [];
  const now = new Date();
  const isPastTimeToday =
    isToday &&
    (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()));

  const time = getFormattedTime(dateTime);
  // const timeWithSeconds = dateTime.toLocaleTimeString();
  const date = getFormattedDate(dateTime);
  const day = getFormattedDay(dateTime);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleEditAlarm = (index) => {
    const alarm = alarms[index];
    setInputTime(`${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`);
    setSelectedDays(alarm.days || []);
    setSpecificDate(alarm.date || '');
    setSelectedSound(alarm.sound || alarmSounds[1].value);
    setAlarmNote(alarm.note || '');
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setInputTime('');
    setSelectedDays([]);
    setSpecificDate('');
    setSelectedSound(alarmSounds[1].value);
    setAlarmNote('');
    setEditingIndex(null);
  }

  const handleDeleteAlarm = (indexToDelete) => {
    const updatedAlarms = alarms.filter((_, index) => index !== indexToDelete);
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
    handleCloseModal()
  };

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // handleFullscreenChange effect
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

    const updatedAlarms = [...alarms];
    if (editingIndex !== null) {
      updatedAlarms[editingIndex] = newAlarm;
    } else {
      updatedAlarms.push(newAlarm);
    }

    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
    setInputTime('');
    setSelectedDays([]);
    setSpecificDate('');
    setSelectedSound(alarmSounds[1].value);
    setAlarmNote('');
    setEditingIndex(null);
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
      setIndiaTime(now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      }));
      setUsaTime(now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Chicago'
      }));
      setDubaiTime(now.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Dubai'
      }));

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

  const getRepeatLabel = (days) => {
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const weekend = ["Sat", "Sun"];
    const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const isSameSet = (a, b) =>
      a.length === b.length && a.every(day => b.includes(day));

    if (isSameSet(days, allDays)) return "Daily";
    if (isSameSet(days, weekdays)) return "Weekdays";
    if (isSameSet(days, weekend)) return "Weekend";
    return days.join(', ');
  };
    // const tempText = '88'
  return (
    <div className='App'>
      <audio ref={alarmAudioRef} preload="auto" />
      <div className='content'>
        {/* <div style={{ margin: '20px', position: 'absolute' }}>
          <CustomHouseIcon text={`${tempText}°C`} />
        </div> */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h1>{editingIndex !== null ? "Edit Alarm" : "Create Alarm"}</h1>
              <input
                type="time"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
              />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                disabled={selectedDays.length > 0}
              />
              <div className='day-selection'>
                {weekdays.map(day => (
                  <React.Fragment key={day}>
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      disabled={specificDate !== ''}
                    />
                    <label htmlFor={`day-${day}`}>{day}</label>
                  </React.Fragment>
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
                <button
                  type='save'
                  onClick={() => {
                    addAlarm();
                    setIsModalOpen(false);
                  }}
                  disabled={!inputTime || isPastTimeToday}
                >
                  {editingIndex !== null ? "Save changes" : "Save"}
                </button>
                {editingIndex !== null &&
                  <button onClick={() =>
                    handleDeleteAlarm(editingIndex)}
                    type='delete'
                  >
                    {"Delete"}
                  </button>}
                <button type='cancel' onClick={() => handleCloseModal()}>Cancel</button>
              </div>
            </div>
          </div>
        )
        }

        <div className={'container1'} >
          <div className={'timeDateContainer'}>
            <div className={'time'}>{time}</div>
            <div className={'date'}>{date}</div>
          </div>
          <div className={'temperatureWidgetContainer'}>
            <WeatherFeature />
          </div>
          <div className={'otherTimesContainer'}>
            <div className={'otherTimeWidget'}>
              <IndiaFlag className={'flagSvg1'} />
              <span className={'otherTime'}>{indiaTime}</span>
            </div>
            <div className={'otherTimeWidget'}>
              <USAFlag className={'flagSvg1'} />
              <span className={'otherTime'}>{usaTime}</span>
            </div>
            <div className={'otherTimeWidget'}>
              <DubaiFlag className={'flagSvg1'} />
              <span className={'otherTime'}>{dubaiTime}</span>
            </div>
          </div>
        </div>

        <div className="container-2">
          <div className='container-2-left-pane'>
            <div className='pane-heading-view'>
              <h1>Upcoming alarms</h1>
              <button onClick={() => setIsModalOpen(true)}>Add alarm</button>
            </div>
            <div className='saved-alarms-view'>
              {alarms.length > 0 ? (
                alarms.map((alarm, index) => (
                  <div className='saved-alarm' key={index} onClick={() => handleEditAlarm(index)}>
                    <span style={{ fontSize: '2rem' }}>
                      {alarm.hour.toString().padStart(2, '0')}:{alarm.minute.toString().padStart(2, '0')}
                    </span>
                    <h2 className='saved-alarm-info'>
                      {alarm.days.length !== 0 && (
                        <>
                          Repeat: {getRepeatLabel(alarm.days)}
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
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '1.5rem' }}>No alarms set</div>
              )}
            </div>
          </div>
          <div className="container-2-right-pane">
            <div className="notes-section">
              <div className="pane-heading-view">
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
            <div className="fullscreen-button-view">
              <div
                style={{
                  position: 'fixed',
                  bottom: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  zIndex: 9999
                }}
              >
                {viewportSize.width} × {viewportSize.height}
              </div>
              <button
                onClick={toggleFullscreen}
                className='fullscreen-button'
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {!isFullscreen ? <BsFullscreen /> : <BsFullscreenExit />}
              </button>
            </div>
          </div>
        </div>
        {
          isAlarmActive && (
            <div className="alarm-ring">
              <BsAlarm size={80} />
              <button className='stop-alarm-button' onClick={stopAlarm}>Stop Alarm</button>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                {currentAlarmRef.current && (
                  <>
                    <div style={{ fontSize: '5rem' }}>
                      {currentAlarmRef.current.hour.toString().padStart(2, '0')}:
                      {currentAlarmRef.current.minute.toString().padStart(2, '0')}
                    </div>
                    {currentAlarmRef.current.note && (
                      <div style={{ marginTop: '0.5rem', fontSize: '3rem' }}>
                        {currentAlarmRef.current.note}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        }
      </div>
    </div >
  );
}

export default App;
