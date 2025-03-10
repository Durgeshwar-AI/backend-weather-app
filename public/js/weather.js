import axios from "axios";

let icon = document.getElementById("searchicon");
let inp = document.getElementById("search-box");
let search;
icon.addEventListener("click", function () {
  search = inp.value;
  const weather = async () => {
    const response = await axios.post("/", {
      city: search,
    });
  };
});
inp.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    search = inp.value;
    const weather = async () => {
      const response = await axios.post("/", {
        city: search,
      });
    };
  }
});

function execute() {
  let image = document.getElementById("picture");
  let status = data.weather[0].main;
  if (status === "Clouds") {
    image.src = "./images/cloudy.png";
  } else if (status === "Rain") {
    image.src = "./images/rainy.png";
  } else if (status === "Clear") {
    image.src = "./images/clear.png";
  } else if (status === "Snow") {
    image.src = "./images/snowy.png";
  } else if (status === "Sunny") {
    image.src = "./images/sunny.png";
  } else if (status === "Thunderstorm") {
    image.src = "./images/thunderstrom.png";
  } else if (status === "Drizzle") {
    image.src = "./images/drizzle.png";
  } else if (status === "Mist" || status === "Haze" || status === "Fog") {
    image.src = "./images/mist.png";
  }
}
const loc = document.getElementById("location");
loc.addEventListener("click", async () => {
  const result = navigator.geolocation.getCurrentPosition(done, undone);
});
async function done(position) {
  const r = await curpos(position.coords.latitude, position.coords.longitude);
}
function undone() {
  console.log("Error");
  document.getElementById("heading").remove();
  let cont = document.getElementById("container");
  cont.innerHTML = `
    <h2>Error</h2>
    <p>some error occured</p>
    <button id="refresh" onclick="location.reload()" style="height:fit-content; background-color:alice-blue; text-weight="bold">Click to refresh</button>
    `;
}
async function curpos(lat, long) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}&units=metric`
  );
  data = await response.json();
  console.log(data);
  a = data[0].name;
  console.log(a);
  const res = await fetch(`${baseUrl}?q=${a}&appid=${key}&units=metric`);
  data = await res.json();
  console.log(data);
  execute();
}
