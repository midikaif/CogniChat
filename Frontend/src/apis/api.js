import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:3000" : "/",

  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if(error.response && (error.response.status === 401 || error.response.status === 403)) {

        if(window.location.pathname !== '/login'){
            // window.location.href = '/login';
        }
    }
    return Promise.reject(error);
})


export default api;
