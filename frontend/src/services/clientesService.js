import api from "./api";

export const getClientes = () => api.get("/clientes");
export const getCliente = (id) => api.get(`/clientes/${id}`);
export const crearCliente = (data) => api.post("/clientes", data);
export const actualizarCliente = (id, data) => api.put(`/clientes/${id}`, data);
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`);
