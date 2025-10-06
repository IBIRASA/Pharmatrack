// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/accounts/", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
