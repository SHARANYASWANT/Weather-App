import React, { useState, useEffect } from 'react';
import './Body.css';
import { CiLocationOn } from 'react-icons/ci';

const API_KEY = '12777de3df0d29b6e98de86384637be7'; 
const Body = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);

  const fetchWeatherData = async (city) => {
    try {
      
      const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const currentWeatherData = await currentWeatherResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastResponse.json();

      const { lat, lon } = currentWeatherData.coord;
      const uvResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      const uvData = await uvResponse.json();

      setWeatherData({ currentWeather: currentWeatherData, forecast: forecastData });
      setUvIndex(uvData.current.uvi);  
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const handleSearch = (event) => {
    setCity(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchWeatherData(city);
    }
  };

  useEffect(() => {
    fetchWeatherData('Chennai');
  }, []);

  if (!weatherData) return <div>Loading...</div>;

  const { currentWeather, forecast } = weatherData;
  const currentTemp = currentWeather.main.temp;
  const feelsLike = currentWeather.main.feels_like;
  const precipitation = currentWeather.rain?.['1h'] || 0; 
  const visibility = (currentWeather.visibility / 1000).toFixed(1); 
  const humidity = currentWeather.main.humidity;
  const windSpeed = currentWeather.wind.speed;
  const windGust = currentWeather.wind.gust;
  const hourlyForecast = forecast.list.slice(0, 5); 
  const dailyForecast = forecast.list.filter((_, index) => index % 8 === 0); 
  return (
    <div className='container'>
      <div className="location-bar">
        <div className="input-wrapper">
          <CiLocationOn className='icon' />
          <input
            type="text"
            value={city}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            placeholder="Search city..."
          />
        </div>
      </div>

      <div className="current-weather">
        <h1>{Math.round(currentTemp)}°</h1>
        <p className="weather-condition">{currentWeather.weather[0].main}</p>
        <p className="weather-description">
          {currentWeather.weather[0].description.charAt(0).toUpperCase() + currentWeather.weather[0].description.slice(1)}
        </p>
      </div>

      <div className="weather-stats">
        <div className="stat-box">
          <h3>Feels Like</h3>
          <p>{Math.round(feelsLike)}°</p>
          <p>Humidity makes it feel warmer</p>
        </div>
        <div className="stat-box">
          <h3>Precipitation</h3>
          <p>{precipitation} mm</p>
          <p>Last 1 hour</p>
        </div>
        <div className="stat-box">
          <h3>Visibility</h3>
          <p>{visibility} km</p>
        </div>
        <div className="stat-box">
          <h3>Humidity</h3>
          <p>{humidity}%</p>
          <p>The dew point is {currentWeather.main.temp - ((100 - humidity) / 5)}°C</p>
        </div>
      </div>

      <div className="forecast hourly-forecast">
        <h3>Hourly Forecast</h3>
        <div className="forecast-row">
          {hourlyForecast.map((hour, index) => (
            <div className="forecast-item" key={index}>
              <p>{new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p>{Math.round(hour.main.temp)}°</p>
              <p>{hour.weather[0].main === 'Rain' ? '🌧️' : '🌤️'}</p> 
            </div>
          ))}
        </div>
      </div>

      <div className="forecast ten-day-forecast">
        <h3>Daily Forecast</h3>
        <div className="forecast-row">
          {dailyForecast.map((day, index) => (
            <div className="forecast-item" key={index}>
              <p>{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p>{Math.round(day.main.temp)}°</p>
              <p>{day.weather[0].main === 'Rain' ? '🌧️' : '🌤️'}</p> 
            </div>
          ))}
        </div>
      </div>

      <div className="extra-info">
        <div className="info-box">
          <h3>UV Index</h3>
          <p>{uvIndex < 3 ? 'Low' : uvIndex < 6 ? 'Moderate' : 'High'}</p> 
        </div>
        <div className="info-box">
          <h3>Wind</h3>
          <p>{windSpeed} MPH</p>
          <p>Gusts: {windGust ? `${windGust} MPH` : 'No gusts'}</p>
        </div>
      </div>
    </div>
  );
};

export default Body;
