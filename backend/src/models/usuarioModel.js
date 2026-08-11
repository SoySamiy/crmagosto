import fs from "fs";
import path from "path";

const dataFile = path.resolve("usuarios.json");

const usuariosDefault = [
  {
    id: 1,
    nombre: "Admin CRM",
    email: "admin@crm.com",
    roles: ["admin", "manager"],
    estado: "activo",
    cargo: "Administrador general",
    creadoEl: "2025-09-01T08:30:00.000Z",
    ultimaConexion: "2026-08-01T09:10:00.000Z",
    notas: "Usuario de administración con acceso completo.",
  },
  {
    id: 2,
    nombre: "Laura Gomez",
    email: "laura.gomez@crm.com",
    roles: ["ventas"],
    estado: "activo",
    cargo: "Ejecutiva de cuenta",
    creadoEl: "2026-01-20T10:20:00.000Z",
    ultimaConexion: "2026-08-05T14:12:00.000Z",
    notas: "Responsable de clientes clave y oportunidades corporativas.",
  },
];

let usuarios = [];
let nextId = 1;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      usuarios = JSON.parse(fileData);
      if (usuarios.length > 0) {
        nextId = Math.max(...usuarios.map((item) => item.id)) + 1;
      }
    } else {
      usuarios = [...usuariosDefault];
      nextId = usuarios.length + 1;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo usuarios.json:", error);
    usuarios = [...usuariosDefault];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(usuarios, null, 2));
  } catch (error) {
    console.error("Error guardando usuarios.json:", error);
  }
}

loadData();

export function findAll() {
  return usuarios;
}

export function findById(id) {
  return usuarios.find((item) => item.id === Number(id));
}

export function create(data) {
  const item = { id: nextId++, ...data };
  usuarios.push(item);
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
  const index = usuarios.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  usuarios.splice(index, 1);
  saveData();
  return true;
}
