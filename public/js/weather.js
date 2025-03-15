let icon = document.getElementById("searchicon");
let inp = document.getElementById("search-box");
let image = document.getElementById("picture");
let loc = document.getElementById("location");

async function fetchWeather(city) {
  try {
    const response = await axios.post("/api/v1/weather", { city });
    updateUI(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function updateUI(data) {
  document.getElementById("city").innerText = data.city;
  document.getElementById("temp").innerText = data.temperature;
  document.getElementById("humid").innerText = data.humidity;
  document.getElementById("speed").innerText = data.windSpeed;

  let status = data.weather[0].main;
  let images = {
    Clouds: "./images/cloudy.png",
    Rain: "./images/rainy.png",
    Clear: "./images/clear.png",
    Snow: "./images/snowy.png",
    Sunny: "./images/sunny.png",
    Thunderstorm: "./images/thunderstrom.png",
    Drizzle: "./images/drizzle.png",
    Mist: "./images/mist.png",
    Haze: "./images/mist.png",
    Fog: "./images/mist.png",
  };

  image.src = images[status] || "./images/default.png";
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
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      let response = await axios.post("/api/v1/latweather", { 
        latitude: position.coords.latitude, 
        longitude: position.coords.longitude 
      });
      updateUI(response.data);
    } catch (error) {
      console.error("Location error:", error);
    }
  }, () => {
    document.getElementById("heading").remove();
    document.getElementById("container").innerHTML = `
      <h2>Error</h2>
      <p>Could not fetch location.</p>
      <button onclick="location.reload()">Click to refresh</button>
    `;
  });
});
