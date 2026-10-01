export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || "http://192.168.0.9:8000",
  endpoints: {
    health: "/health",
    services: "/services",
    barbers: "/barbers",
    hairstyles: "/hairstyles",
    appointments: "/appointments",
  },
  timeout: 15000,
};

export default API_CONFIG;
