import fs from "fs";
import path from "path";

const dataFile = path.resolve("companias.json");

const compañiasDefault = [
  {
    id: 1,
    nombre: "Gómez Industrial S.A. de C.V.",
    email: "contacto@gomezindustrial.com",
    telefono: "555-0201",
    tipoPersona: "moral",
    sector: "Manufactura",
    rfc: "GOS180501ABC",
    empleados: 120,
    direccion: "Av. Industria 120, Parque Industrial, Guadalajara",
    estado: "activo",
    etapa: "renovacion",
    origen: "Prospecto inbound",
    asignadoA: "Laura Gómez",
    valorAnual: 1250000,
    valor: 1250000,
    ultimoContacto: "2026-06-22T10:15:00.000Z",
    notas: "Cliente estratégico con renovación anual prevista.",
    creadoEl: "2025-09-12T09:15:00.000Z",
  },
  {
    id: 2,
    nombre: "TechNexus México",
    email: "ventas@technexus.mx",
    telefono: "555-0202",
    tipoPersona: "moral",
    sector: "Tecnología",
    rfc: "TNX200304XYZ",
    empleados: 54,
    direccion: "Blvd. Tecnológico 34, Ciudad de México",
    estado: "activo",
    etapa: "expansion",
    origen: "Campaña digital",
    asignadoA: "Carlos Ruiz",
    valorAnual: 760000,
    valor: 760000,
    ultimoContacto: "2026-06-18T14:30:00.000Z",
    notas: "Apuesta por soluciones SaaS y compras recurrentes.",
    creadoEl: "2026-01-18T11:40:00.000Z",
  },
  {
    id: 3,
    nombre: "Distribuciones del Valle S.A.",
    email: "logistica@distvalle.com",
    telefono: "555-0203",
    tipoPersona: "moral",
    sector: "Logística",
    rfc: "DVA190315LMN",
    empleados: 88,
    direccion: "Camino Real 220, Estado de México",
    estado: "prospecto",
    etapa: "evaluacion",
    origen: "Referido",
    asignadoA: "Laura Gómez",
    valorAnual: 420000,
    valor: 420000,
    ultimoContacto: "2026-06-25T09:45:00.000Z",
    notas: "Interesados en automatización de procesos comerciales.",
    creadoEl: "2026-04-04T13:20:00.000Z",
  },
  {
    id: 4,
    nombre: "Consultoría Verde S.A. de C.V.",
    email: "info@consultoriaverde.mx",
    telefono: "555-0204",
    tipoPersona: "moral",
    sector: "Servicios",
    rfc: "COV210608FGH",
    empleados: 32,
    direccion: "Av. Reforma 180, Ciudad de México",
    estado: "activo",
    etapa: "negociacion",
    origen: "Evento presencial",
    asignadoA: "Carlos Ruiz",
    valorAnual: 310000,
    valor: 310000,
    ultimoContacto: "2026-06-20T16:10:00.000Z",
    notas: "Recientemente renovaron contrato de soporte técnico.",
    creadoEl: "2025-12-02T10:05:00.000Z",
  },
];

let companias = [];
let nextId = 1;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      companias = JSON.parse(fileData);
      if (companias.length > 0) {
        nextId = Math.max(...companias.map((item) => item.id)) + 1;
      }
    } else {
      companias = [...compañiasDefault];
      nextId = companias.length + 1;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo companias.json:", error);
    companias = [...compañiasDefault];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(companias, null, 2));
  } catch (error) {
    console.error("Error escribiendo companias.json:", error);
  }
}

loadData();

export function findAll() {
  return companias;
}

export function findById(id) {
  return companias.find((item) => item.id === Number(id));
}

export function create(data) {
  const newItem = { id: nextId++, ...data };
  companias.push(newItem);
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
  const index = companias.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  companias.splice(index, 1);
  saveData();
  return true;
}
