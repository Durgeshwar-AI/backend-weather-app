# Weather App with Backend

A modern, responsive weather application that provides real-time weather data and forecasts using the Open-Meteo API. The app features both frontend and backend integration, offering detailed weather information including temperature, humidity, UV index, and more.

## Features

### Current Weather Data

- Real-time temperature display
- "Feels like" temperature
- Humidity levels
- Wind speed
- Atmospheric pressure
- UV index with categorization (Low, Medium, High, Very High, Extreme)
- Weather condition descriptions (Clear Sky, Cloudy, Rain, etc.)

### Forecast Features

- 5-hour forecast with hourly temperature and humidity
- 7-day weather forecast including:
  - Daily maximum and minimum temperatures
  - Daily humidity levels
  - Date-wise weather information

### Location Features

- Default weather display for Delhi (28.6519°N, 77.2315°E)
- Search functionality for any city worldwide
- Current location detection using browser geolocation
- Automatic timezone detection and time formatting
- Reverse geocoding to show location names

## Technologies Used

### Frontend

- HTML5/CSS3
- JavaScript (ES6+)
- EJS (Embedded JavaScript templating)
- Responsive design for all device sizes
- Interactive search with suggestions

### Backend

- Node.js
- Express.js
- Open-Meteo API for weather data
- OpenStreetMap Nominatim API for reverse geocoding
- Axios for HTTP requests
- dotenv for environment variable management

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/weather-app-with-backend.git
   cd weather-app-with-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=5000
   ```

4. Start the server:

   - For development:
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

5. Access the application at `http://localhost:5000`

## Project Structure

```
├── app.js                  # Main application file
├── package.json            # Project dependencies and scripts
├── public/                 # Static assets
│   ├── css/                # Stylesheets
│   │   └── style.css       # Main stylesheet
│   ├── js/                 # Client-side JavaScript
│   │   └── main.js         # Frontend functionality
│   └── images/             # Image assets
├── views/                  # EJS templates
│   └── weather.ejs         # Main view template
└── .env                    # Environment variables
```

## API Endpoints

### GET /

- Renders the main weather page with default location (Delhi)
- Returns: HTML page with weather data

### POST /api/v1/city

- Search for cities
- Body: `{ city: "city name" }`
- Returns: Array of matching city data

### POST /api/v1/latweather

- Get weather data for specific coordinates
- Body: `{ latitude: number, longitude: number }`
- Returns: Complete weather data object

## Weather Data Structure

The application provides the following weather data structure:
```javascript
{
  place: "Location Name",
  current: {
    time: "formatted time",
    temperature: "°C",
    humidity: "%",
    wind: "km/hr",
    apparentTemperature: "°C",
    pressure: "mb"
  },
  daily: {
    time: ["dates"],
    uv: "UV category",
    type: "Weather condition",
    max: ["temperatures"],
    min: ["temperatures"],
    humidity: ["percentages"]
  },
  hourly: {
    temperature: ["values"],
    humidity: ["values"],
    hour: ["hours"]
  }
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Credits

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
- Reverse geocoding by [OpenStreetMap Nominatim](https://nominatim.org/)