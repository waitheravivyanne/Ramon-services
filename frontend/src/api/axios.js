import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        console.log(
            "API REQUEST:",
            config.method?.toUpperCase(),
            config.url,
            "JWT:",
            token ? "ATTACHED" : "MISSING"
        );

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

export default api;