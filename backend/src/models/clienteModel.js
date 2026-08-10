import * as contactoModel from "./contactoModel.js";
import fs from "fs";
import path from "path";

// Ruta donde se guardará el archivo físico en tu backend
const dataFile = path.resolve("clientes.json");

// Tus datos por defecto
const clientesDefault = [
  {
    id: 1,
    nombre: "Acme Corp",
    email: "contacto@acme.com",
    telefono: "555-0101",
    tipoPersona: "moral",
    tipo: "cliente_frecuente",
    etapa: "fidelizado",
    origen: "Recomendacion",
    valor: 85000,
    asignadoA: "Laura Gomez",
    notas: "Renovacion anual confirmada.",
    creadoEl: "2025-11-02T10:00:00.000Z",
    ultimoContacto: "2026-06-20T15:30:00.000Z",
  },
  {
    id: 2,
    nombre: "Juan Perez",
    email: "juan.perez@correo.com",
    telefono: "555-0102",
    tipoPersona: "fisica",
    tipo: "prospecto",
    etapa: "contacto_inicial",
    origen: "Sitio web",
    valor: 15000,
    asignadoA: "Carlos Ruiz",
    notas: "Pidio cotizacion, marcar el martes.",
    creadoEl: "2026-06-10T09:15:00.000Z",
    ultimoContacto: "2026-06-18T12:00:00.000Z",
  },
  {
    id: 3,
    nombre: "Maria Lopez",
    email: "maria.lopez@correo.com",
    telefono: "555-0103",
    tipoPersona: "fisica",
    tipo: "cliente",
    etapa: "onboarding",
    origen: "Recomendacion",
    valor: 32000,
    asignadoA: "Laura Gomez",
    notas: "Contrato firmado, en proceso de alta.",
    creadoEl: "2026-05-20T11:30:00.000Z",
    ultimoContacto: "2026-06-22T17:45:00.000Z",
  },
  {
    id: 4,
    nombre: "Grupo Industrial Norte",
    email: "contacto@gin.com",
    telefono: "555-0104",
    tipoPersona: "moral",
    tipo: "prospecto",
    etapa: "negociacion",
    origen: "Meta Ads",
    valor: 150000,
    asignadoA: "Carlos Ruiz",
    notas: "Negociando condiciones de pago.",
    creadoEl: "2026-06-01T08:00:00.000Z",
    ultimoContacto: "2026-06-23T13:10:00.000Z",
  },
  {
    id: 5,
    nombre: "Pedro Sanchez",
    email: "pedro.sanchez@correo.com",
    telefono: "555-0105",
    tipoPersona: "fisica",
    tipo: "prospecto",
    etapa: "cotizacion",
    origen: "Whatsapp",
    valor: 8000,
    asignadoA: "Laura Gomez",
    notas: "Solicito propuesta por escrito.",
    creadoEl: "2026-06-15T16:20:00.000Z",
    ultimoContacto: "2026-06-21T10:05:00.000Z",
  },
  {
    id: 6,
    nombre: "Distribuidora del Sur",
    email: "contacto@distrisur.com",
    telefono: "555-0106",
    tipoPersona: "moral",
    tipo: "ex_cliente",
    etapa: "inactivo",
    origen: "Llamada en frio",
    valor: 0,
    asignadoA: "Carlos Ruiz",
    notas: "No renovo el contrato en 2025.",
    creadoEl: "2024-03-10T09:00:00.000Z",
    ultimoContacto: "2025-12-05T14:00:00.000Z",
  },
];

let clientes = [];
let nextId = 1;

// 1. Función para cargar los datos del archivo (o crearlo si no existe)
function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      clientes = JSON.parse(fileData);
      
      // Actualiza el ID para que siga incrementando correctamente
      if (clientes.length > 0) {
        nextId = Math.max(...clientes.map(c => c.id)) + 1;
      }
    } else {
      clientes = [...clientesDefault];
      nextId = 7;
      saveData(); // Crea el archivo por primera vez
    }
  } catch (error) {
    console.error("Error leyendo archivo:", error);
    clientes = [...clientesDefault];
  }
}

// 2. Función para guardar los datos al archivo
function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(clientes, null, 2));
  } catch (error) {
    console.error("Error guardando archivo:", error);
  }
}

// Inicializamos leyendo el disco duro al arrancar
loadData();

// --- TUS MISMAS FUNCIONES (Pero ahora guardan al final) ---

export function findAll() {
  return clientes;
}

export function findById(id) {
  return clientes.find((c) => c.id === Number(id));
}

export function create(data) {
  const cliente = { id: nextId++, ...data };
  clientes.push(cliente);
  saveData(); // <--- AHORA SE GUARDA EN EL DISCO
  return cliente;
}

export function update(id, data) {
  const cliente = findById(id);
  if (!cliente) return null;
  Object.assign(cliente, data);
  saveData(); // <--- AHORA SE GUARDA EN EL DISCO
  return cliente;
}

export function remove(id) {
  const index = clientes.findIndex((c) => c.id === Number(id));
  if (index === -1) return false;
  clientes.splice(index, 1);
  saveData(); // <--- AHORA SE GUARDA EN EL DISCO
  return true;
}