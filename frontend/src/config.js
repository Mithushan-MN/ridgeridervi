// src/config.js

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const config = {
  API_URL: isLocalhost 
    ? 'http://localhost:5000/api' 
    : 'https://videostorage-98fm.vercel.app/api',
};

export default config;
