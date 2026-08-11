import fs from "fs";
import path from "path";

const dataFile = path.resolve("productos.json");

const productosDefault = [
  {
    id: 1,
    nombre: "Plataforma CRM Premium",
    categoria: "Software",
    precio: 185000,
    inventario: 24,
    unidad: "licencias",
    estado: "disponible",
    descripcion: "Sistema de gestión comercial con seguimiento de ventas y automatización.",
    creadoEl: "2025-10-10T09:00:00.000Z",
  },
  {
    id: 2,
    nombre: "Paquete de soporte técnico",
    categoria: "Servicios",
    precio: 32000,
    inventario: 100,
    unidad: "paquetes",
    estado: "disponible",
    descripcion: "Soporte mensual con atención prioritaria y monitoreo 24/7.",
    creadoEl: "2025-11-08T10:30:00.000Z",
  },
  {
    id: 3,
    nombre: "Integración API personalizada",
    categoria: "Servicio profesional",
    precio: 78000,
    inventario: 16,
    unidad: "proyectos",
    estado: "disponible",
    descripcion: "Desarrollo de conexión entre el CRM y sistemas internos de clientes.",
    creadoEl: "2026-02-12T14:20:00.000Z",
  },
  {
    id: 4,
    nombre: "Formación comercial avanzada",
    categoria: "Capacitación",
    precio: 22000,
    inventario: 0,
    unidad: "cursos",
    estado: "agotado",
    descripcion: "Programa de capacitación para equipos de ventas y gestión de clientes.",
    creadoEl: "2026-04-02T08:45:00.000Z",
  },
];

let productos = [];
let nextId = 1;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      productos = JSON.parse(fileData);
      if (productos.length > 0) {
        nextId = Math.max(...productos.map((item) => item.id)) + 1;
      }
    } else {
      productos = [...productosDefault];
      nextId = productos.length + 1;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo productos.json:", error);
    productos = [...productosDefault];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(productos, null, 2));
  } catch (error) {
    console.error("Error escribiendo productos.json:", error);
  }
}

loadData();

export function findAll() {
  return productos;
}

export function findById(id) {
  return productos.find((item) => item.id === Number(id));
}

export function create(data) {
  const newItem = { id: nextId++, ...data };
  productos.push(newItem);
  saveData();
  return newItem;
}

export function update(id, data) {
  const item = findById(id);
  if (!item) return null;
  Object.assign(item, data);
  saveData();
  return item;
}

export function remove(id) {
  const index = productos.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  productos.splice(index, 1);
  saveData();
  return true;
}
