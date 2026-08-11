import api from "./api";

export const getPedidos = () => api.get("/pedidos");
export const getPedido = (id) => api.get(`/pedidos/${id}`);
export const crearPedido = (data) => api.post("/pedidos", data);
export const actualizarPedido = (id, data) => api.put(`/pedidos/${id}`, data);
export const eliminarPedido = (id) => api.delete(`/pedidos/${id}`);
