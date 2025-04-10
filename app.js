import express from "express";
import { config } from "dotenv";
import { fetchWeatherApi } from "openmeteo";
import path from "path";
import axios from "axios";

config();
const app = express();
const PORT = process.env.PORT || 5000;
const KEY = process.env.KEY;
const URL = process.env.URL;
const URLLATLONG = process.env.URLLATLONG;
const urlForecast = "https://api.open-meteo.com/v1/forecast";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const params = {
    latitude: 28.6519,
    longitude: 77.2315,
    daily: ["uv_index_max", "weathercode"],
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "apparent_temperature",
    ],
    forecast_days: 1,
  };
  try {
    const responses = await fetchWeatherApi(urlForecast, params);
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();
    const current = response.current();
    const daily = response.daily();

    const categorizeUV = (uv) => {
      if (uv <= 2) return "Low";
      if (uv <= 5) return "Medium";
      if (uv <= 7) return "High";
      if (uv <= 10) return "Very High";
      return "Extreme";
    };

    const categorizeWeather = (weather)=>{
      switch (weather) {
        case 0: return "Clear Sky";
        case 1: return "Mainly clear";
        case 2: return "Partly cloudy";
        case 3: return "Overcast";
        case 45:
        case 48: return "Fog";
        case 51:
        case 53:
        case 55: return "Light drizzle";
        case 56:
        case 57: return "Freezing drizzle";
        case 61:
        case 63:
        case 65: return "Rain";
        case 66:
        case 67: return "Freezing rain";
        case 71:
        case 73:
        case 75: return "Snow fall";
        case 77: return "Snow grains";
        case 80:
        case 81:
        case 82: return "Rain showers";
        case 85:
        case 86: return "Snow Showers";
        case 95: return "Thunderstorm";
        case 96:
        case 99: return "Thunderstorm with hail";
        default: return "Unknown";
      }
    }

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature: current.variables(0).value().toFixed(2),
        humidity: current.variables(1).value(),
        wind: current.variables(2).value().toFixed(2),
        apparentTemperature: current.variables(3).value().toFixed(2),
      },
      daily: {
        uv: categorizeUV(daily.variables(0).valuesArray()),
        type : categorizeWeather(daily.variables(1).valuesArray()[0])
      },
    };

    res.render("weather", { weather: weatherData });
  } catch (error) {
    console.error("Error fetching default weather data:", error);
    res.render("weather", {
      weather: {
        city: "Unknown",
        temperature: "N/A",
        humidity: "N/A",
        windSpeed: "N/A",
        icon: "https://openweathermap.org/img/wn/10d@2x.png",
      },
    });
  }
});

app.get("/api/city", async (req, res) => {
  const response = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${req.query.name}&count=5&language=en&format=json`
  );
  const data = response.data;

  console.log(data);
  res.json(data);
});

app.post("/api/v1/weather", async (req, res) => {
  try {
    const { city } = req.body;
    const response = await axios.get(
      `${URL}?q=${city}&appid=${KEY}&units=metric`
    );
    const data = response.data;
    console.log(data);

    res.json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.post("/api/v1/latweather", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const response = await axios.get(
      `${URL}?lat=${latitude}&lon=${longitude}&appid=${KEY}&units=metric`
    );
    const data = response.data;
    console.log(data);

    res.json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
