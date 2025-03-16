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
  document.getElementById("city").innerText = `${data.name}`;
  document.getElementById("temp").innerText = `${data.main.temp} °C`;
  document.getElementById("humid").innerText = `${data.main.humidity} %`;
  document.getElementById("speed").innerText = `${data.wind.speed} Km/Hr`;
  let icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById("type").innerText = data.weather[0].main
  image.src = icon;
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
