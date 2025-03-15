let icon = document.getElementById("searchicon");
let inp = document.getElementById("search-box");
let image = document.getElementById("picture");
let loc = document.getElementById("location");

async function fetchWeather(city) {
  try {
    const response = await fetch(`/api/v1/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    showError();
  }
}

async function fetchWeatherByLocation(lat, lon) {
  try {
    const response = await fetch(`/api/v1/latweather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error("Location error:", error);
    showError();
  }
}

function updateUI(data) {
  document.getElementById("byline").innerText = data.weather[0].description;
  document.getElementById("city").innerText = data.name;
  document.getElementById("temp").innerText = `${data.main.temp}°C`;
  document.getElementById("humid").innerText = `${data.main.humidity}%`;
  document.getElementById("speed").innerText = `${data.wind.speed} km/hr`;

  let iconCode = data.weather[0].icon;
  let imgUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.getElementById("picture").src = imgUrl;
}

function showError() {
  document.getElementById("byline").innerText = "Error!";
  document.getElementById("city").innerText = "Error!";
  document.getElementById("temp").innerText = "N/A";
  document.getElementById("humid").innerText = "N/A";
  document.getElementById("speed").innerText = "N/A";
  image.src = "./images/error.png";
}

icon.addEventListener("click", () => {
  let search = inp.value.trim();
  if (search) fetchWeather(search);
});

inp.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    let search = inp.value.trim();
    if (search) fetchWeather(search);
  }
});

loc.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => fetchWeatherByLocation(position.coords.latitude, position.coords.longitude),
    () => showError()
  );
});