import api from "./api";

export function getCotizaciones() {
  return api.get("/cotizaciones");
}

export function getCotizacion(id) {
  return api.get(`/cotizaciones/${id}`);
}

export function crearCotizacion(data) {
  return api.post("/cotizaciones", data);
}

export function actualizarCotizacion(id, data) {
  return api.put(`/cotizaciones/${id}`, data);
}

export function eliminarCotizacion(id) {
  return api.delete(`/cotizaciones/${id}`);
}
