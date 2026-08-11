import fs from "fs";
import path from "path";

const dataFile = path.resolve("negociaciones.json");

const negociacionesDefault = [
  {
    id: 1,
    nombre: "Automatización de cotizaciones",
    tipoPersona: "moral",
    clienteNombre: "Gómez Industrial S.A. de C.V.",
    valor: 185000,
    etapa: "negociacion",
    probabilidad: 80,
    vendedor: "Laura Gomez",
    fechaCierre: "2026-07-12T12:00:00.000Z",
    notas: "Pendiente firma de anexo de servicio.",
    creadoEl: "2026-06-10T08:20:00.000Z",
  },
  {
    id: 2,
    nombre: "Contrato de soporte extendido",
    tipoPersona: "moral",
    clienteNombre: "TechNexus México",
    valor: 96000,
    etapa: "propuesta",
    probabilidad: 65,
    vendedor: "Carlos Ruiz",
    fechaCierre: "2026-07-05T09:00:00.000Z",
    notas: "Revisar alcance de soporte para 24/7.",
    creadoEl: "2026-06-18T10:15:00.000Z",
  },
  {
    id: 3,
    nombre: "Implementación inicial CRM",
    tipoPersona: "fisica",
    clienteNombre: "Juan Perez",
    valor: 32000,
    etapa: "seguimiento",
    probabilidad: 50,
    vendedor: "Laura Gomez",
    fechaCierre: "2026-07-20T14:00:00.000Z",
    notas: "Coordinacion de demo con el equipo el viernes.",
    creadoEl: "2026-06-22T15:55:00.000Z",
  },
  {
    id: 4,
    nombre: "Renovación de licencia anual",
    tipoPersona: "moral",
    clienteNombre: "Consultoría Verde S.A. de C.V.",
    valor: 185000,
    etapa: "fidelizado",
    probabilidad: 95,
    vendedor: "Laura Gomez",
    fechaCierre: "2026-06-30T11:30:00.000Z",
    notas: "Contrato vigente, se espera renovación sin cambios.",
    creadoEl: "2026-05-03T09:20:00.000Z",
  },
  {
    id: 5,
    nombre: "Evaluación de paquete de capacitación",
    tipoPersona: "fisica",
    clienteNombre: "Pedro Sanchez",
    valor: 22000,
    etapa: "contacto_inicial",
    probabilidad: 30,
    vendedor: "Carlos Ruiz",
    fechaCierre: "2026-07-28T10:00:00.000Z",
    notas: "Enviar propuesta detallada y plan de sesiones.",
    creadoEl: "2026-06-24T16:20:00.000Z",
  },
];

let negociaciones = [];
let nextId = 1;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      negociaciones = JSON.parse(fileData);
      if (negociaciones.length > 0) {
        nextId = Math.max(...negociaciones.map((item) => item.id)) + 1;
      }
    } else {
      negociaciones = [...negociacionesDefault];
      nextId = negociaciones.length + 1;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo negociaciones.json:", error);
    negociaciones = [...negociacionesDefault];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(negociaciones, null, 2));
  } catch (error) {
    console.error("Error escribiendo negociaciones.json:", error);
  }
}

loadData();

export function findAll() {
  return negociaciones;
}

export function findById(id) {
  return negociaciones.find((item) => item.id === Number(id));
}

export function create(data) {
  const newItem = { id: nextId++, ...data };
  negociaciones.push(newItem);
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
  const index = negociaciones.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  negociaciones.splice(index, 1);
  saveData();
  return true;
}
