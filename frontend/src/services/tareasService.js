import api from "./api";

export function getTareas() {
  return api.get("/tareas");
}

export function getTarea(id) {
  return api.get(`/tareas/${id}`);
}

export function crearTarea(data) {
  return api.post("/tareas", data);
}

export function actualizarTarea(id, data) {
  return api.put(`/tareas/${id}`, data);
}

export function eliminarTarea(id) {
  return api.delete(`/tareas/${id}`);
}
