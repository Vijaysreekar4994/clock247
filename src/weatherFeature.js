import React, { useEffect, useState } from 'react';
import weatherCodeMap from './weatherCodes';
// import './WeatherFeature.css';
import { LuRefreshCw } from "react-icons/lu";


const WeatherFeature = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [coords, setCoords] = useState({ lat: 49.0435, lon: 2.1213 });
  const [locationName, setLocationName] = useState('');
  const [indiaTime, setIndiaTime] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weathercode&timezone=auto`

      const response = await fetch(url);
      const data = await response.json();

      if (data.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weathercode
        });
      } else {
        setError('Weather data unavailable');
      }
    } catch (err) {
      setError('Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationName = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lon}`);
      const data = await response.json();
      if (data && data.address) {
        const { city, town, village, state } = data.address;
        setLocationName(city || town || village || state || 'Unknown');
      }
    } catch (err) {
      console.warn('Failed to fetch location name');
    }
  };

  const updateIndiaTime = () => {
    const india = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
    setIndiaTime(india);
  };

  useEffect(() => {
    fetchWeather();
    fetchLocationName();
    updateIndiaTime();
    const interval = setInterval(() => {
      fetchWeather();
      updateIndiaTime();
    }, 60 * 60 * 1000); // hourly refresh
    return () => clearInterval(interval);
  }, [coords]);


  const handleWeatherClick = () => {
    setShowModal(true);
  };

  const handleCoordChange = (e) => {
    const { name, value } = e.target;
    setCoords((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="weather-box" onClick={handleWeatherClick} >Loading weather...</div>;
  if (error) return <div className="weather-box" onClick={handleWeatherClick}>{error}</div>;

  return (
    <>
      <div className="weather-box">
        <div onClick={handleWeatherClick}>
          <span className='text2'>{weather.temp}&deg;C</span>
        </div>
        <div>
          <span className='text4'>{weatherCodeMap[weather.code]}
            <button onClick={() => { fetchWeather(); fetchLocationName()}} className="weather-refresh-button">
              <LuRefreshCw />
            </button>
          </span><br /><br />
          <span className='text4'>{locationName}</span>
          <br /><br />
        </div>
          <span className='text2'>🇮🇳 {indiaTime}</span>
      </div>
       {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Set Coordinates</h3>
            <input type="number" step="0.0001" name="lat" value={coords.lat} onChange={handleCoordChange} placeholder="Latitude" />
            <input type="number" step="0.0001" name="lon" value={coords.lon} onChange={handleCoordChange} placeholder="Longitude" />
            <div className="modal-buttons">
              <button 
              type='save' onClick={() => { fetchWeather(); fetchLocationName(); setShowModal(false); }}>Save & Close</button>
              <button onClick={() => window.open('https://open-meteo.com/en/docs', '_blank')}>Open API Docs</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherFeature;
