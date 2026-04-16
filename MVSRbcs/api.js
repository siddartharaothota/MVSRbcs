import axios from "axios";

const API = axios.create({
  baseURL: "http://172.27.191.4:4000",
});

export default API;