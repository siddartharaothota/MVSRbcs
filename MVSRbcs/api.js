import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.0.119:4000",
});

export default API;