import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("Dhaka");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const API_KEY = "9e1821ba6331bac1494ae736070dd050";
  const ZOOM = 6; // good zoom for country/city level

  // Convert latitude & longitude to tile X/Y
  const lonToTileX = (lon, zoom) =>
    Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));

  const latToTileY = (lat, zoom) => {
    const rad = (lat * Math.PI) / 180;
    return Math.floor(
      ((1 -
        Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) /
        2) *
        Math.pow(2, zoom)
    );
  };

  const fetchWeather = async (cityName) => {
    try {
      setError("");

      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.cod !== 200) {
        setError("City not found");
        return;
      }

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData.list.slice(0, 8));
    } catch {
      setError("Failed to fetch weather");
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  // Tile coordinates
  let tileX, tileY;
  if (weather) {
    tileX = lonToTileX(weather.coord.lon, ZOOM);
    tileY = latToTileY(weather.coord.lat, ZOOM);
  }

  return (
    <div className="app">
      {/* SEARCH */}
      <div className="search">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
        />
        <button onClick={() => fetchWeather(city)}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <>
          {/* WEATHER DASHBOARD */}
          <div className="dashboard">
            <div className="left">
              <h2>{weather.name}, {weather.sys.country}</h2>
              <h1>{Math.round(weather.main.temp)}°C</h1>
              <p className="desc">{weather.weather[0].description}</p>

              <div className="details">
                <p>💨 Wind: {weather.wind.speed} m/s</p>
                <p>💧 Humidity: {weather.main.humidity}%</p>
                <p>🌡️ Feels like: {weather.main.feels_like}°C</p>
                <p>👁️ Visibility: {(weather.visibility / 1000).toFixed(1)} km</p>
              </div>
            </div>

            <div className="right">
              <h3>Hourly Forecast</h3>
              <div className="hourly">
                {forecast.map((item, index) => (
                  <div className="hour-card" key={index}>
                    <p>
                      {new Date(item.dt_txt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                      alt=""
                    />
                    <p>{Math.round(item.main.temp)}°C</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAP LAYERS */}
          <div className="map-section">
            <div className="map-card">
              <h4>☁️ Clouds</h4>
              <img
                src={`https://tile.openweathermap.org/map/clouds_new/${ZOOM}/${tileX}/${tileY}.png?appid=${API_KEY}`}
                alt="Clouds"
              />
            </div>

            <div className="map-card">
              <h4>🌧️ Precipitation</h4>
              <img
                src={`https://tile.openweathermap.org/map/precipitation_new/${ZOOM}/${tileX}/${tileY}.png?appid=${API_KEY}`}
                alt="Precipitation"
              />
            </div>

            <div className="map-card">
              <h4>🌡️ Temperature</h4>
              <img
                src={`https://tile.openweathermap.org/map/temp_new/${ZOOM}/${tileX}/${tileY}.png?appid=${API_KEY}`}
                alt="Temperature"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
