import express from "express";
import { config } from "dotenv";
import path from "path";
import axios from "axios";

config();
const app = express();
const PORT = process.env.PORT || 5000;
const KEY = process.env.KEY;
const URL = process.env.URL;
const URLLATLONG= process.env.URLLATLONG;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `${URL}?q=New Delhi&appid=${KEY}&units=metric`
    );
    const data = response.data;

    const weatherData = {
      city: data.name,
      temperature: `${data.main.temp}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} km/hr`,
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
      },
    });
  }
});

app.post("/api/v1/weather", async (req, res) => {
  try {
    const { city } = req.body;
    const response = await axios.get(
      `${URL}?q=${city}&appid=${KEY}&units=metric`
    );
    const data = response.data;

    const weatherData = {
      city: data.name,
      temperature: `${data.main.temp}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} km/hr`,
      weather: data.weather,
    };
    console.log(weatherData);

    res.json(weatherData);
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

    const weatherData = {
      city: data.name,
      temperature: `${data.main.temp}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} km/hr`,
      weather: data.weather,
    };
    console.log(weatherData);

    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
