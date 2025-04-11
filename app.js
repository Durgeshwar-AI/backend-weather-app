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

const categorizeUV = (uv) => {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Medium";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
};

const categorizeWeather = (weather) => {
  switch (weather) {
    case 0:
      return "Clear Sky";
    case 1:
      return "Mainly clear";
    case 2:
      return "Partly cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Fog";
    case 51:
    case 53:
    case 55:
      return "Light drizzle";
    case 56:
    case 57:
      return "Freezing drizzle";
    case 61:
    case 63:
    case 65:
      return "Rain";
    case 66:
    case 67:
      return "Freezing rain";
    case 71:
    case 73:
    case 75:
      return "Snow fall";
    case 77:
      return "Snow grains";
    case 80:
    case 81:
    case 82:
      return "Rain showers";
    case 85:
    case 86:
      return "Snow Showers";
    case 95:
      return "Thunderstorm";
    case 96:
    case 99:
      return "Thunderstorm with hail";
    default:
      return "Unknown";
  }
};

function getFormattedDate(dateObj) {
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "long" });
  const year = dateObj.getFullYear();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";
  return `${day}${suffix} ${month} ${year}`;
}

function getFormattedTime(dateObj) {
  return dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

app.get("/", async (req, res) => {
  const params = {
    latitude: 28.6519,
    longitude: 77.2315,
    daily: [
      "uv_index_max",
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "relative_humidity_2m_mean",
    ],
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "apparent_temperature",
      "pressure_msl",
    ],
    hourly: ["temperature_2m", "relative_humidity_2m"],
    forecast_days: 6,
    past_days: 1,
  };

  try {
    const responses = await fetchWeatherApi(urlForecast, params);
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const current = response.current();
    const daily = response.daily();
    const hourly = response.hourly();
    const localTimestamp = (Number(current.time()) + utcOffsetSeconds) * 1000;
    const now = new Date(localTimestamp);
    const hour = now.getHours();

    const range = (start, stop, step) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    const weatherData = {
      current: {
        time: now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: current.variables(0).value().toFixed(2),
        humidity: current.variables(1).value(),
        wind: current.variables(2).value().toFixed(2),
        apparentTemperature: current.variables(3).value().toFixed(2),
        pressure: current.variables(4).value().toFixed(2),
      },
      daily: {
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval()
        ).map((t) => {
          const date = new Date((t + utcOffsetSeconds) * 1000);
          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        }),
        uv: categorizeUV(daily.variables(0).valuesArray()),
        type: categorizeWeather(daily.variables(1).valuesArray()[0]),
        max: daily.variables(2).valuesArray(),
        min: daily.variables(3).valuesArray(),
        humidity: daily.variables(4).valuesArray(),
      },
      hourly: {
        temperature: hourly
          .variables(0)
          .valuesArray()
          .slice(hour, hour + 5),
        humidity: hourly
          .variables(1)
          .valuesArray()
          .slice(hour, hour + 5),
        hour: [hour, hour + 1, hour + 2, hour + 3, hour + 4],
      },
      day: now.toLocaleString("default", { weekday: "long" }),
      date: getFormattedDate(now),
      updated: getFormattedTime(new Date()),
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

// const params = {
// 	latitude: 52.52,
// 	longitude: 13.41,
// 	daily: ["uv_index_max", "temperature_2m_max", "temperature_2m_min", "weather_code"],
// 	past_days: 1,
// };

// const url = "https://api.open-meteo.com/v1/forecast";
// const responses = await fetchWeatherApi(url, params);

// // Helper function to form time ranges
// const range = (start, stop, step) =>
// 	Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

// // Process first location. Add a for-loop for multiple locations or weather models
// const response = responses[0];

// // Attributes for timezone and location
// const utcOffsetSeconds = response.utcOffsetSeconds();
// const timezone = response.timezone();
// const timezoneAbbreviation = response.timezoneAbbreviation();
// const latitude = response.latitude();
// const longitude = response.longitude();

// const daily = response.daily();

// // Note: The order of weather variables in the URL query and the indices below need to match!
// const weatherData = {
// 	daily: {
// 		time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
// 			(t) => new Date((t + utcOffsetSeconds) * 1000)
// 		),
// 		uvIndexMax: daily.variables(0).valuesArray(),
// 		temperature2mMax: daily.variables(1).valuesArray(),
// 		temperature2mMin: daily.variables(2).valuesArray(),
// 		weatherCode: daily.variables(3).valuesArray(),
// 	},
// };

// // `weatherData` now contains a simple structure with arrays for datetime and weather data
// for (let i = 0; i < weatherData.daily.time.length; i++) {
// 	console.log(
// 		weatherData.daily.time[i].toISOString(),
// 		weatherData.daily.uvIndexMax[i],
// 		weatherData.daily.temperature2mMax[i],
// 		weatherData.daily.temperature2mMin[i],
// 		weatherData.daily.weatherCode[i]
// 	);
// }
