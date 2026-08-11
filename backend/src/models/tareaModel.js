import fs from "fs";
import path from "path";

const dataFile = path.resolve("tareas.json");

const tareasDefault = [
  {
    id: 1,
    titulo: "Seguimiento con cliente VIP",
    descripcion: "Llamar a la empresa para revisar propuesta y cierre.",
    asignadoA: "Laura Gomez",
    estado: "pendiente",
    prioridad: "alta",
    fechaVencimiento: "2026-08-10",
    creadoEl: "2026-08-01T09:00:00.000Z",
    notas: "Asegurarse de enviar material adicional antes de la llamada.",
  },
  {
    id: 2,
    titulo: "Actualizar catálogo de productos",
    descripcion: "Incorporar nuevos servicios de software al catálogo.",
    asignadoA: "Carlos Ruiz",
    estado: "en progreso",
    prioridad: "media",
    fechaVencimiento: "2026-08-14",
    creadoEl: "2026-07-30T12:15:00.000Z",
    notas: "Coordinar con diseño para los precios actualizados.",
  },
];

let tareas = [];
let nextId = 1;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      tareas = JSON.parse(fileData);
      if (tareas.length > 0) {
        nextId = Math.max(...tareas.map((item) => item.id)) + 1;
      }
    } else {
      tareas = [...tareasDefault];
      nextId = tareas.length + 1;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo tareas.json:", error);
    tareas = [...tareasDefault];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(tareas, null, 2));
  } catch (error) {
    console.error("Error guardando tareas.json:", error);
  }
}

loadData();

export function findAll() {
  return tareas;
}

export function findById(id) {
  return tareas.find((item) => item.id === Number(id));
}

export function create(data) {
  const item = { id: nextId++, ...data };
  tareas.push(item);
  saveData();
  return item;
}

export function update(id, data) {
  const item = findById(id);
  if (!item) return null;
  Object.assign(item, data);
  saveData();
  return item;
}

export function remove(id) {
  const index = tareas.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  tareas.splice(index, 1);
  saveData();
  return true;
}
