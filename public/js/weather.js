let icon = document.getElementById("search-icon");
let inp = document.getElementById("search-input");
let loc = document.getElementById("location-icon");
let suggestions = document.getElementById("search-suggestions");

let latitude = "";
let longitude = "";

function updateDOM(data) {
  document.getElementById("place").textContent = `${data.place}`;
  document.getElementById(
    "place-temperature"
  ).textContent = `${data.current.temperature}°C`;
  document.getElementById(
    "apparent"
  ).textContent = `Feels Like ${data.current.apparentTemperature}°C`;
  document.getElementById(
    "place-max-min"
  ).textContent = `${data.daily.max[0].toFixed(
    2
  )}°C/${data.daily.min[0].toFixed(2)}°C`;
  document.getElementById("place-type").textContent = data.daily.type;

  document.getElementById("day").textContent = data.day;
  document.getElementById("date").textContent = data.date;
  document.getElementById("updated").textContent = data.updated;
  document.getElementById(
    "pressure"
  ).textContent = `${data.current.pressure} mb`;
  document.getElementById("humidity").textContent = `${data.current.humidity}%`;
  document.getElementById("uv").textContent = data.daily.uv;
  document.getElementById("wind").textContent = `${data.current.wind} km/hr`;

  // Update hourly section
  const hourlyDiv = document.getElementById("hourly");
  hourlyDiv.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const hour = data.hourly.hour[i];
    const suffix = hour >= 12 ? ":00 PM" : ":00 AM";
    const hour12 = ((hour + 11) % 12) + 1;
    const formattedHour = `${hour12}${suffix}`;
    const temp = data.hourly.temperature[i].toFixed(2);
    const hum = data.hourly.humidity[i];

    hourlyDiv.innerHTML += `
      <div class="hour">
        <p class="time">${formattedHour}</p>
        <img src="/images/thermometer.png" alt="" class="icon" />
        <p>${temp}°C</p>
        <img src="/images/humidity.png" alt="" class="icon" />
        <p>${hum}%</p>
      </div>
    `;
  }

  // Update daily section
  const dailyDiv = document.getElementById("daily");
  dailyDiv.innerHTML = "";
  for (let i = 0; i < data.daily.time.length; i++) {
    const date = data.daily.time[i];
    const humidity = Math.round(data.daily.humidity[i]);
    const max = Math.round(data.daily.max[i]);
    const min = Math.round(data.daily.min[i]);

    dailyDiv.innerHTML += `
      <div class="date">
        <h3 class="day">${date}</h3>
        <div class="area">
          <img src="/images/humidity.png" alt="" class="icon" />
          <p>${humidity}%</p>
        </div>
        <div class="area">
          <img src="/images/thermometer.png" alt="" class="icon" />
          <p>${max}°C to ${min}°C</p>
        </div>
      </div>
    `;
  }
}

async function getLocationAndUpdateWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const { data } = await axios.post("/api/v1/latweather", {
            latitude,
            longitude,
          });

          updateDOM(data);
        } catch (error) {
          console.error("Error fetching weather data:", error);
          alert("Could not fetch weather data.");
        }
      },
      () => {
        alert("Sorry, no position available.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

loc.addEventListener("click", getLocationAndUpdateWeather);

inp.addEventListener("input", async (e) => {
  const city = e.target.value.trim();
  if (city.length<3) {
    suggestions.style.display = "none";
    return;
  }
  try {
    const { data } = await axios.post(
      "/api/v1/city",
      { city },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    suggestions.style.display = "block";
    suggestions.innerHTML = "";
    data.forEach((loc) => {
      const option = document.createElement("p");
      option.textContent = `${loc.name}, ${loc.country}`;
      option.addEventListener("click", () => {
        inp.value = `${loc.name}, ${loc.country}`;
        updateWeather(loc.latitude, loc.longitude);
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
      });
      suggestions.appendChild(option);
    });
  } catch (err) {
    console.log(err);
  }
});

async function updateWeather(latitude, longitude) {
  try {
    const { data } = await axios.post("/api/v1/latweather", {
      latitude,
      longitude,
    });

    updateDOM(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Could not fetch weather data.");
  }
}
