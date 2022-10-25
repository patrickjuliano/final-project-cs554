const axios = require('axios');
const { apiKey, apiEndpoint } = require('../config');
const validation = require('../validation');

// OpenWeather's One Call API lumps all weather data into a single response object
// This method uses the exclude parameter to reject all irrelevant data based on the desired request
const allRequests = ['current', 'minutely', 'hourly', 'daily', 'alerts']
async function makeRequest(lat, lon, req) {
  lat = validation.checkNumber(lat);
  lon = validation.checkNumber(lon);
  req = validation.checkString(req);
  req = req.toLowerCase();

  const requests = [...allRequests];
  const requestIndex = requests.indexOf(req);
  if (requestIndex < 0) throw 'Invalid request';
  requests.splice(requestIndex, 1);
  const excludeRequests = requests.join();

  console.log(`${apiEndpoint}?lat=${lat}&lon=${lon}&exclude=${excludeRequests}&appid=${apiKey}`);
  let { data } = await axios.get(`${apiEndpoint}?lat=${lat}&lon=${lon}&exclude=${excludeRequests}&appid=${apiKey}`);
  return data;
}

// Gets the current weather
async function getCurrentWeather(lat, lon) {
  lat = validation.checkNumber(lat);
  lon = validation.checkNumber(lon);

  let data = await makeRequest(lat, lon, 'current');
  return data;
}

// Gets the minute forecast for 1 hour
async function getMinutelyWeather(lat, lon) {
  lat = validation.checkNumber(lat);
  lon = validation.checkNumber(lon);

  let data = await makeRequest(lat, lon, 'minutely');
  return data;
}

// Gets the hourly forecast for 48 hours
async function getHourlyWeather(lat, lon) {
  lat = validation.checkNumber(lat);
  lon = validation.checkNumber(lon);

  let data = await makeRequest(lat, lon, 'hourly');
  return data;
}

// Gets the daily forecast for 8 days
async function getDailyWeather(lat, lon) {
  lat = validation.checkNumber(lat);
  lon = validation.checkNumber(lon);

  let data = await makeRequest(lat, lon, 'daily');
  return data;
}

// Gets national weather alerts
async function getWeatherAlerts(lat, lon) {
  lat = validation.checkNumber(lat);
  lon = validation.checkNumber(lon);

  let data = await makeRequest(lat, lon, 'alerts');
  return data;
}

async function getHistoricalWeather(lat, lon, dt) {
  lat = validation.checkNumber(lat);
  lon = validation.checkNumber(lon);
  dt = validation.checkTimestamp(dt);

  let { data } = await axios.get(`${apiEndpoint}/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${apiKey}`);
  return data;
}

module.exports = {
  getCurrentWeather,
  getMinutelyWeather,
  getHourlyWeather,
  getDailyWeather,
  getWeatherAlerts,
  getHistoricalWeather
}