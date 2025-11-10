#!/usr/bin/env node
// Simple CLI weather app using Open-Meteo (no API key required)

const city = process.argv.slice(2).join(' ').trim();

if (!city) {
  console.error('Usage: node index.js "City Name"');
  process.exit(1);
}

const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

(async () => {
  try {
    // 1) Geocoding: city -> lat/lon (Open-Meteo geocoding, no key)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`;
    const geo = await fetchJson(geoUrl);

    if (!geo.results || geo.results.length === 0) {
      console.error(`City not found: "${city}"`);
      process.exit(2);
    }

    const place = geo.results[0];
    const name = place.name || city;
    const country = place.country || '';
    const lat = place.latitude;
    const lon = place.longitude;

    // 2) Fetch current weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&timezone=auto`;
    const weatherData = await fetchJson(weatherUrl);

    const cw = weatherData.current_weather;
    if (!cw) {
      console.error('Current weather data not available.');
      process.exit(3);
    }

    const temp = Math.round(cw.temperature);
    const code = cw.weathercode;
    const desc = WEATHER_CODE_MAP[code] || `Weather code ${code}`;

    console.log(`Weather in ${name}${country ? ', ' + country : ''}: ${temp}°C, ${desc}`);
  } catch (err) {
    console.error('Error:', err?.message || err);
    process.exit(1);
  }
})();