import api from "./api";

export const getContactos = () => api.get("/contactos");
export const getContacto = (id) => api.get(`/contactos/${id}`);
export const crearContacto = (data) => api.post("/contactos", data);
export const actualizarContacto = (id, data) => api.put(`/contactos/${id}`, data);
export const eliminarContacto = (id) => api.delete(`/contactos/${id}`);
