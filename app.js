import express from "express";
import { config } from "dotenv";
import path from "path";

config();
const app = express();
const PORT = process.env.PORT || 5000;
const KEY = process.env.KEY;
const URL = process.env.URL;

app.use(express.static(path.join(process.cwd(), "public")));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const response = await fetch(`${URL}?q=New Delhi&appid=${KEY}&units=metric`);
    const data = await response.json();

    const weatherData = {
      byline: data.weather[0].description,
      city: data.name,
      temperature: `${data.main.temp}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} km/hr`,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, // Dynamic icon
    };

    res.render("weather", { weather: weatherData });
  } catch (error) {
    console.error("Error fetching default weather data:", error);
    res.render("weather", {
      weather: {
        byline: "Error fetching weather",
        city: "Unknown",
        temperature: "N/A",
        humidity: "N/A",
        windSpeed: "N/A",
        icon: "https://openweathermap.org/img/wn/10d@2x.png",
      },
    });
  }
});

app.get("/api/v1/weather", async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: "City is required" });

    const response = await fetch(`${URL}?q=${city}&appid=${KEY}&units=metric`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/v1/latweather", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Latitude and Longitude are required" });

    const response = await fetch(`${URL}?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});