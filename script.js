// Klucz API
const API_KEY = "ecca60406186f934bb352146cc8d8584";

// Referencje do elementów HTML
const cityInput = document.getElementById("city-input");
const weatherButton = document.getElementById("get-weather");
const weatherResult = document.getElementById("weather-result");

function getCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=7ded80d91f2b280ec979100cc8bbba94`;
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("Odpowiedź XMLHttpRequest (bieżąca pogoda):", data); 
            displayCurrentWeather(data);
        } else {
            console.error("Błąd XMLHttpRequest:", xhr.status, xhr.statusText);
            weatherResult.innerHTML = `<p>Couldn't load the weather. Please try again.</p>`;
        }
    };

    xhr.onerror = function () {
        console.error("XMLHttpRequest Error");
    };

    xhr.send();
}


function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=7ded80d91f2b280ec979100cc8bbba94`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log("Odpowiedź Fetch API (prognoza 5-dniowa):", data); 
            displayForecast(data);
        })
        .catch((error) => {
            console.error("Fetch API Error:", error);
            weatherResult.innerHTML = `<p>An error occured. Please try again.</p>`;
        });
}


function displayCurrentWeather(data) {
    const { name, main, weather, dt } = data; 
    const icon = weather[0].icon; 
    const description = weather[0].description;
    const currentTime = new Date(dt * 1000).toLocaleTimeString(); 
    const html = `
        <div class="weather-card">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
            <h2>Current weather for: ${name}</h2>
            <p>Time: ${currentTime}</p>
            <p>Temperature: ${main.temp}°C</p>
            <p>Description: ${description}</p>
        </div>
    `;
    weatherResult.innerHTML = html;
}



function displayForecast(data) {
    const dailyForecasts = {};

    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item; 
        }
    });

    const forecastHTML = Object.values(dailyForecasts)
        .slice(0, 5)
        .map((item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            const time = new Date(item.dt * 1000).toLocaleTimeString();
            const icon = item.weather[0].icon; 
            const description = item.weather[0].description

            return `
                <div class="weather-card">
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
                    <h4>${date} ${time}</h4>
                    <p>Temperature: ${item.main.temp}°C</p>
                    <p>Description: ${description}</p>
                </div>
            `;
        })
        .join("");

    weatherResult.innerHTML += `<h3>5-day forecast:</h3>${forecastHTML}`;
}

weatherButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city === "") {
        weatherResult.innerHTML = "<p>Please enter a city name!</p>";
        return;
    }

    weatherResult.innerHTML = "<p>Loading...</p>";
    getCurrentWeather(city);
    getForecast(city);
});
