import api from "./api";

export function getUsuarios() {
  return api.get("/usuarios");
}

export function getUsuario(id) {
  return api.get(`/usuarios/${id}`);
}

export function crearUsuario(data) {
  return api.post("/usuarios", data);
}

export function actualizarUsuario(id, data) {
  return api.put(`/usuarios/${id}`, data);
}

export function eliminarUsuario(id) {
  return api.delete(`/usuarios/${id}`);
}
