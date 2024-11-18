// Importing necessary React hooks and dependencies
import React, { useEffect, useRef, useState } from "react";
import "./Weather.css"; // CSS for styling the weather app
import search_icon from "../assets/search.png"; 
import clear_icon from "../assets/clear.png"; 
import cloud_icon from "../assets/cloud.png"; 
import drizzle_icon from "../assets/drizzle.png"; 
import humidity_icon from "../assets/humidity.png"; 
import rain_icon from "../assets/rain.png"; 
import snow_icon from "../assets/snow.png"; 
import wind_icon from "../assets/wind.png"; 
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const Weather = () => {
  // Reference to the input field for the city search
  const inputRef = useRef();

  // State to hold today's weather data
  const [weatherData, setWeatherData] = useState(null);

  // State to hold forecast data for the next 5 days
  const [forecastData, setForecastData] = useState([]);

  // Mapping of weather conditions to corresponding icons
  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  // Function to show a notification if the city name is invalid
  const notify = () => {
    toast.error("Please enter a valid location name!", {
      style: {
        background: "#ffcccc",
        color: "#ff0000",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "8px",
        padding: "10px",
      },
      icon: "⚠️",
    });
  };

  // Function to fetch weather and forecast data for a given city
  const search = async (city) => {
    if (city === "") {
      notify();
      return;
    }

    try {
      // Fetch current weather data for the specified city
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const response = await fetch(url);
      const data = await response.json();
      const icon = allIcons[data.weather[0].icon] || clear_icon;

      // Update state with the fetched weather data
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: `${data.name}, ${data.sys.country}`,
        icon: icon,
      });

      // Fetch 5-day forecast data for the specified city
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      // Extract daily forecasts by filtering every 8th data point (3-hour intervals)
      const dailyForecast = forecastData.list.filter(
        (item, index) => index % 8 === 0 // One forecast every 3 hours (0 3 6 9 12 15 18 21)
      );
      const forecastWithoutToday = dailyForecast.slice(1, 6); // Exclude today's forecast and take the next 5 days

      // Update state with formatted forecast data
      setForecastData(
        forecastWithoutToday.map((item) => ({
          date: new Date(item.dt * 1000).toLocaleDateString(),
          temperature: Math.floor(item.main.temp),
          icon: allIcons[item.weather[0].icon] || clear_icon,
        }))
      );
    } catch (error) {
      // Handle errors during data fetch
      setWeatherData(null);
      toast.error("Error in fetching weather data!");
    }
  };

  // Handle "Enter" key press to trigger a search
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      search(inputRef.current.value);
    }
  };

  // Clear input field and reset weather data
  const handleClear = () => {
    inputRef.current.value = ""; // Clear the input field
    setWeatherData(null); // Clear today's weather data
    setForecastData([]); // Clear forecast data
  };

  // Default weather data for "Danville" when the component first renders
  useEffect(() => {
    search("Danville");
  }, []);

  return (
    <div className="weather">
      {/* Search bar for entering city name */}
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search (City, State, Country)"
          onKeyDown={handleKeyDown} // Search when "Enter" is pressed
        />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current.value)} // Search when search icon is clicked
        />
        <button className="clear-btn" onClick={handleClear}>
          Reset
        </button>
      </div>

      {/* Display today's weather data if available */}
      {weatherData ? (
        <>
          <div className="today-label">Today</div>
          <img
            src={weatherData.icon}
            alt="Weather Icon"
            className="weather-icon"
          />
          <p className="temperature">{weatherData.temperature}°C</p>
          <p className="location">{weatherData.location}</p>
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity Icon" />
              <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind Icon" />
              <div>
                <p>{weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p></p> // Placeholder when no data is available
      )}

      {/* Render forecast data for the next 5 days */}
      <div className="carousel">
        {forecastData.length > 0 ? (
          forecastData.map((forecast, index) => (
            <div key={index} className="weather-card">
              <img
                src={forecast.icon}
                alt="Forecast Icon"
                className="weather-icon"
              />
              <p className="temperature">{forecast.temperature}°C</p>
              <p className="date">{forecast.date}</p>
            </div>
          ))
        ) : (
          <p></p> // Placeholder when no forecast data is available
        )}
      </div>

      {/* Toast notifications container */}
      <ToastContainer />
    </div>
  );
};

export default Weather;
