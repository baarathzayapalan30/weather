// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const $ = (id) => document.getElementById(id);

// Store weather information and selected units
const state = {
    weather: null,
    daily: null,
    hourly: null,

    units: {
        temperature: "celsius",
        wind: "kmh",
        precipitation: "mm"
    }
};

// =====================================
// 2. WEATHER ICONS
// =====================================

const icons = {
    0: "sunny",
    1: "partly-cloudy",
    2: "partly-cloudy",
    3: "overcast",
    45: "fog",
    48: "fog",
    51: "drizzle",
    53: "drizzle",
    55: "drizzle",
    61: "rain",
    63: "rain",
    65: "rain",
    71: "snow",
    73: "snow",
    75: "snow",
    80: "rain",
    81: "rain",
    82: "rain",
    85: "snow",
    86: "snow",
    95: "storm",
    96: "storm",
    99: "storm"
};

const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail"
};

function iconPath(code) {
    return `assets/images/icon-${icons[code] || "overcast"}.webp`;
}

// =====================================
// 3. TEMPERATURE AND UNIT CONVERSION
// =====================================

function temp(value) {
    return `${Math.round(value)}°`;
}

function displayTemperature(value) {
    return Math.round(
        state.units.temperature === "fahrenheit"
            ? value * 9 / 5 + 32
            : value
    );
}

function displayWind(value) {
    return Math.round(
        state.units.wind === "mph"
            ? value * 0.621371
            : value
    );
}

function displayRain(value) {
    const result =
        state.units.precipitation === "inch"
            ? value / 25.4
            : value;

    return result.toFixed(1).replace(/\.0$/, "");
}

// =====================================
// 4. DATE FORMATTING
// =====================================

function formatDay(date) {
    return new Intl.DateTimeFormat("en", {
        weekday: "short"
    }).format(new Date(date + "T12:00:00"));
}

function formatDate(date) {
    return new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(new Date(date + "T12:00:00"));
}

function setMessage(text) {
    $("message").textContent = text;
}

// =====================================
// 5. DISPLAY WEATHER INFORMATION
// =====================================

function render() {

    const w = state.weather;
    const d = state.daily;
    const h = state.hourly;

    if (!w || !d || !h) return;

    const u = state.units;
    const code = w.current.weather_code;

    // Current location
    $("locationName").textContent = w.location;

    // Current date
    $("currentDate").textContent =
        formatDate(w.current.time.slice(0, 10));

    // Current temperature
    $("currentTemp").textContent =
        temp(displayTemperature(w.current.temperature_2m));

    // Weather icon
    $("currentIcon").src = iconPath(code);
    $("currentIcon").alt = descriptions[code] || "Weather";

    // Weather details
    $("feelsLike").textContent =
        temp(displayTemperature(w.current.apparent_temperature));

    $("humidity").textContent =
        `${Math.round(w.current.relative_humidity_2m)}%`;

    $("wind").textContent =
        `${displayWind(w.current.wind_speed_10m)} ${u.wind === "mph" ? "mph" : "km/h"}`;

    $("precipitation").textContent =
        `${displayRain(w.current.precipitation)} ${u.precipitation === "inch" ? "in" : "mm"}`;

    // =================================
    // 6. 7-DAY WEATHER FORECAST
    // =================================

    $("dailyForecast").innerHTML =
        d.time.slice(0, 7).map((date, i) => {

            const weatherCode = d.weather_code[i];

            return `
                <article class="day-card">

                    <div class="day-name">
                        ${i === 0 ? "Today" : formatDay(date)}
                    </div>

                    <img
                        src="${iconPath(weatherCode)}"
                        alt="${descriptions[weatherCode] || "Weather"}"
                    >

                    <div class="temps">

                        <span>
                            ${temp(displayTemperature(d.temperature_2m_max[i]))}
                        </span>

                        <span>
                            ${temp(displayTemperature(d.temperature_2m_min[i]))}
                        </span>

                    </div>

                </article>
            `;

        }).join("");

    // =================================
    // 7. HOURLY DAY SELECTOR
    // =================================

    const select = $("daySelect");
    const previous = select.value;

    select.innerHTML =
        d.time.slice(0, 7).map((date, i) => {

            return `
                <option value="${date}">
                    ${i === 0 ? "Today" : formatDay(date)}
                </option>
            `;

        }).join("");

    if (d.time.includes(previous)) {
        select.value = previous;
    }

    renderHourly();

    $("weatherContent").hidden = false;
}

// =====================================
// 8. HOURLY WEATHER FORECAST
// =====================================

function renderHourly() {

    const date =
        $("daySelect").value || state.daily.time[0];

    const indices = state.hourly.time
        .map((time, i) =>
            time.slice(0, 10) === date ? i : -1
        )
        .filter(i => i >= 0);

    $("hourlyForecast").innerHTML =
        indices
            .filter(i =>
                Number(state.hourly.time[i].slice(11, 13)) >= 6
            )
            .map(i => {

                const hour = new Date(
                    state.hourly.time[i]
                ).toLocaleTimeString("en", {
                    hour: "numeric",
                    hour12: true
                });

                const code = state.hourly.weather_code[i];

                return `
                    <article class="hour-card">

                        <img
                            src="${iconPath(code)}"
                            alt="${descriptions[code] || "Weather"}"
                        >

                        <span class="hour">
                            ${hour}
                        </span>

                        <span class="hour-temp">
                            ${temp(displayTemperature(state.hourly.temperature_2m[i]))}
                        </span>

                    </article>
                `;

            }).join("") || "<p>No hourly forecast available.</p>";
}

// =====================================
// 9. SEARCH CITY AND FETCH WEATHER API
// =====================================

async function searchCity(city) {

    setMessage("Searching for weather...");

    $("searchButton").disabled = true;

    try {

        // Get city coordinates
        const geo = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geo.ok) {
            throw new Error("Could not search for that location.");
        }

        const places = await geo.json();

        if (!places.results?.length) {
            throw new Error("City not found. Check the spelling and try again.");
        }

        const place = places.results[0];

        // Get weather information
        const params = new URLSearchParams({

            latitude: place.latitude,

            longitude: place.longitude,

            current:
                "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",

            hourly:
                "temperature_2m,weather_code",

            daily:
                "weather_code,temperature_2m_max,temperature_2m_min",

            timezone: "auto",

            forecast_days: "7"

        });

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params}`
        );

        if (!response.ok) {
            throw new Error("Weather data is temporarily unavailable.");
        }

        const data = await response.json();

        // Save API data
        state.weather = {

            location: [
                place.name,
                place.admin1,
                place.country
            ]
                .filter(Boolean)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(", "),

            current: data.current

        };

        state.daily = data.daily;
        state.hourly = data.hourly;

        // Display weather
        render();

        setMessage(
            `Showing the latest forecast for ${state.weather.location}.`
        );

    } catch (error) {

        $("weatherContent").hidden = true;

        setMessage(
            error.message || "Something went wrong. Please try again."
        );

    } finally {

        $("searchButton").disabled = false;

    }
}

// =====================================
// 10. SEARCH FORM EVENT
// =====================================

$("searchForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const city = $("cityInput").value.trim();

    if (city) {
        searchCity(city);
    }

});

// =====================================
// 11. CHANGE HOURLY FORECAST DAY
// =====================================

$("daySelect").addEventListener("change", function() {

    renderHourly();

});

// =====================================
// 12. UNIT DROPDOWN
// =====================================

$("unitButton").addEventListener("click", function() {

    const menu = $("unitMenu");

    menu.hidden = !menu.hidden;

    $("unitButton").setAttribute(
        "aria-expanded",
        String(!menu.hidden)
    );

});

// =====================================
// 13. APPLY UNIT CHANGES
// =====================================

$("applyUnits").addEventListener("click", function() {

    document.querySelectorAll(
        'input[name="temperature"], input[name="wind"], input[name="precipitation"]'
    ).forEach(input => {

        if (input.checked) {

            state.units[input.name] = input.value;

        }

    });

    $("unitMenu").hidden = true;

    $("unitButton").setAttribute("aria-expanded", "false");

    render();

});

// =====================================
// 14. CLOSE DROPDOWN WHEN CLICKING OUTSIDE
// =====================================

document.addEventListener("click", function(e) {

    if (
        !$("unitMenu").contains(e.target) &&
        !$("unitButton").contains(e.target)
    ) {

        $("unitMenu").hidden = true;

        $("unitButton").setAttribute(
            "aria-expanded",
            "false"
        );

    }

});

// =====================================
// 15. DEFAULT CITY
// =====================================

searchCity("Puducherry");