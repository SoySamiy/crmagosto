import api from "./api";

export const getProductos = () => api.get("/productos");
export const getProducto = (id) => api.get(`/productos/${id}`);
export const crearProducto = (data) => api.post("/productos", data);
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data);
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
