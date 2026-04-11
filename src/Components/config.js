// src/config.js

const hostname = window.location.hostname;

const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168") || hostname.startsWith("10.");

export const API_BASE_URL = isLocalhost 
  ? "http://localhost:5001/api" 
  : "https://api.timelyhealth.in/api";

export const API_DOMAIN = isLocalhost 
  ? "http://localhost:5001" 
  : "https://api.timelyhealth.in";
