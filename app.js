import express from "express"
import { config } from "dotenv"
import path from "path"

config()
const app = express()
const PORT = process.env.PORT || 5000
const KEY=process.env.KEY
const URL=process.env.URL

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(process.cwd(), "public")))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    let city
    let temp
    let hum
    let wind 

    const weatherData = {
        city: city || "New Delhi",
        temperature: temp || "22°C",
        humidity: hum || "50%",
        windSpeed: wind || "10 km/hr"
    };
    res.render("weather", { weather: weatherData });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
