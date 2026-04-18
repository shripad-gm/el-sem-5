import api from "./axios";

export const getCities = () => api.get("/geo/cities");
export const getZones = (cityId) =>
  api.get(`/geo/zones?cityId=${cityId}`);
export const getLocalities = (zoneId) =>
  api.get(`/geo/localities?zoneId=${zoneId}`);
