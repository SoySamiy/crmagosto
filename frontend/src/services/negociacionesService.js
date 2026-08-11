import api from "./api";

export const getNegociaciones = () => api.get("/negociaciones");
export const getNegociacion = (id) => api.get(`/negociaciones/${id}`);
export const crearNegociacion = (data) => api.post("/negociaciones", data);
export const actualizarNegociacion = (id, data) => api.put(`/negociaciones/${id}`, data);
export const eliminarNegociacion = (id) => api.delete(`/negociaciones/${id}`);
