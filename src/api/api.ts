import axios from "axios"

const api = axios.create({
  // Agregamos el prefijo /api/v1 que definieron en el Backend
  baseURL: "http://localhost:8080/api/v1" 
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api;