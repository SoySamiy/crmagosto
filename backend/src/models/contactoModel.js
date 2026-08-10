import fs from "fs";
import path from "path";

// Ruta donde se guardará el archivo físico en tu disco duro
const dataFile = path.resolve("contactos.json");

// Datos iniciales por defecto (los que traía tu proyecto)
const contactosDefault = [
  {
    id: 1,
    nombre: "Laura Gómez",
    email: "laura.gomez@crm.com",
    telefono: "555-0191",
    puesto: "Senior Account Manager",
    departamento: "Ventas",
    creadoEl: "2025-01-15T09:00:00.000Z",
  },
  {
    id: 2,
    nombre: "Carlos Ruiz",
    email: "carlos.ruiz@crm.com",
    telefono: "555-0192",
    puesto: "Customer Success Specialist",
    departamento: "Soporte",
    creadoEl: "2025-02-20T10:30:00.000Z",
  },
];

let contactos = [];
let nextId = 1;

// 1. Función para cargar los datos desde el archivo json
function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      contactos = JSON.parse(fileData);
      
      // Ajustamos el ID para que los nuevos sigan la secuencia correcta
      if (contactos.length > 0) {
        nextId = Math.max(...contactos.map(c => c.id)) + 1;
      }
    } else {
      // Si el archivo no existe, usamos los valores por defecto y lo creamos
      contactos = [...contactosDefault];
      nextId = 3;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo el archivo contactos.json:", error);
    contactos = [...contactosDefault];
  }
}

// 2. Función para guardar los datos físicamente en el archivo json
function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(contactos, null, 2));
  } catch (error) {
    console.error("Error escribiendo en el archivo contactos.json:", error);
  }
}

// Inicializamos cargando los datos al arrancar el backend
loadData();

// --- TUS MISMAS FUNCIONES DEL CONTROLADOR (Pero ahora con persistencia) ---

export function findAll() {
  return contactos;
}

export function findById(id) {
  return contactos.find((c) => c.id === Number(id));
}

export function create(data) {
  const contacto = { id: nextId++, ...data };
  contactos.push(contacto);
  saveData(); // <--- GUARDA EN EL DISCO DURO
  return contacto;
}

export function update(id, data) {
  const contacto = findById(id);
  if (!contacto) return null;
  Object.assign(contacto, data);
  saveData(); // <--- GUARDA EN EL DISCO DURO
  return contacto;
}

export function remove(id) {
  const index = contactos.findIndex((c) => c.id === Number(id));
  if (index === -1) return false;
  contactos.splice(index, 1);
  saveData(); // <--- GUARDA EN EL DISCO DURO
  return true;
}