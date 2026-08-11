import api from "./api";

export const getCompanias = () => api.get("/companias");
export const getCompania = (id) => api.get(`/companias/${id}`);
export const crearCompania = (data) => api.post("/companias", data);
export const actualizarCompania = (id, data) => api.put(`/companias/${id}`, data);
export const eliminarCompania = (id) => api.delete(`/companias/${id}`);
