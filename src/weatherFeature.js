import React, { useEffect, useState } from 'react';
// import weatherCodeMap from './weatherCodes';
// import './WeatherFeature.css';
import { LuRefreshCw } from "react-icons/lu";
// import { ReactComponent as IndiaFlag } from "./assets/in.svg"
import weatherIconMap from './weatherIcons';



const WeatherFeature = (props) => {
  const { classes } = props
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [coords, setCoords] = useState({ lat: 49.0435, lon: 2.1213 });
  const [locationName, setLocationName] = useState('');
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weathercode,apparent_temperature,is_day&timezone=auto`

      const response = await fetch(url);
      const data = await response.json();
      if (data.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          icon: weatherIconMap[data.current.is_day ? 'day' : 'night'][data.current.weathercode],
          isDay: data.current.is_day === 1
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

  useEffect(() => {
    fetchWeather();
    fetchLocationName();
    const interval = setInterval(() => {
      fetchWeather();
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [coords]);


  const handleWeatherClick = () => {
    setShowModal(true);
  };

  const handleCoordChange = (e) => {
    const { name, value } = e.target;
    setCoords((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="weather-box" >Loading weather...</div>;
  if (error) return <div className="weather-box" >{error}
    <button onClick={() => { fetchWeather(); fetchLocationName() }} className={classes.weatherRefreshButton || ''}>
      <LuRefreshCw />
    </button>
  </div>;

  return (
    <>
      <div className={classes.widgetBig}>
        <span className={classes.weatherIcon}>{weather.icon}</span>
        <span className={classes.temperature} onClick={handleWeatherClick}>{weather.temp}&deg;C</span>
        <button onClick={() => { fetchWeather(); fetchLocationName() }} className={classes.weatherRefreshButton || ''}>
          <LuRefreshCw />
        </button>
        <br />
        <span className={classes.feelsLike}>Feels like {weather.feelsLike}&deg;C</span>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Set Coordinates</h3>
            <input type="number" step="0.0001" name="lat" value={coords.lat} onChange={handleCoordChange} placeholder="Latitude" />
            <input type="number" step="0.0001" name="lon" value={coords.lon} onChange={handleCoordChange} placeholder="Longitude" />
            <br />
            <h3>{locationName}</h3>
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
