import fs from "fs";
import path from "path";

const dataFile = path.resolve("cotizaciones.json");

const cotizacionesDefault = [
  {
    id: 1,
    referencia: "COT-2026-001",
    cliente: "Empresa Soluciones SA",
    monto: 85000,
    estado: "en revisión",
    responsable: "Laura Gomez",
    fechaCreacion: "2026-07-28",
    fechaValidez: "2026-08-15",
    items: [
      { nombre: "Implementación CRM", cantidad: 1, precioUnitario: 65000 },
      { nombre: "Soporte mensual", cantidad: 3, precioUnitario: 6667 },
    ],
    notas: "Cotización para paquete de software y consultoría.",
  },
  {
    id: 2,
    referencia: "COT-2026-002",
    cliente: "Servicios Integrales MX",
    monto: 45000,
    estado: "aprobada",
    responsable: "Carlos Ruiz",
    fechaCreacion: "2026-07-21",
    fechaValidez: "2026-08-05",
    items: [
      { nombre: "Integración API", cantidad: 1, precioUnitario: 30000 },
      { nombre: "Capacitación", cantidad: 2, precioUnitario: 7500 },
    ],
    notas: "Cotización aprobada para proyecto de integración de datos.",
  },
];

let cotizaciones = [];
let nextId = 1;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      cotizaciones = JSON.parse(fileData);
      if (cotizaciones.length > 0) {
        nextId = Math.max(...cotizaciones.map((item) => item.id)) + 1;
      }
    } else {
      cotizaciones = [...cotizacionesDefault];
      nextId = cotizaciones.length + 1;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo cotizaciones.json:", error);
    cotizaciones = [...cotizacionesDefault];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(cotizaciones, null, 2));
  } catch (error) {
    console.error("Error guardando cotizaciones.json:", error);
  }
}

loadData();

export function findAll() {
  return cotizaciones;
}

export function findById(id) {
  return cotizaciones.find((item) => item.id === Number(id));
}

export function create(data) {
  const item = { id: nextId++, ...data };
  cotizaciones.push(item);
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
  const index = cotizaciones.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  cotizaciones.splice(index, 1);
  saveData();
  return true;
}
