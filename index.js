const https = require('https');

// Get city name from command line arguments
const city = process.argv[2];

if (!city) {
  console.error('Please provide a city name: node index.js "London"');
  process.exit(1);
}

// Function to get coordinates from city name using geocoding
function getCoordinates(cityName) {
  return new Promise((resolve, reject) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results.results && results.results.length > 0) {
            const location = results.results[0];
            resolve({ latitude: location.latitude, longitude: location.longitude });
          } else {
            reject(new Error('City not found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Function to fetch weather data
function getWeather(latitude, longitude) {
  return new Promise((resolve, reject) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const weatherData = JSON.parse(data);
          resolve(weatherData.current);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Function to interpret weather code
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    61: 'Slight rain',
    80: 'Slight rain showers',
    95: 'Thunderstorm'
  };
  return weatherCodes[code] || 'Unknown';
}

// Main function
async function main() {
  try {
    console.log(`Fetching weather for ${city}...`);
    const coords = await getCoordinates(city);
    const weather = await getWeather(coords.latitude, coords.longitude);
    const description = getWeatherDescription(weather.weather_code);
    
    console.log(`Weather in ${city}: ${weather.temperature_2m}°C, ${description}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();