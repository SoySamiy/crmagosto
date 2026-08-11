import fs from "fs";
import path from "path";

const dataFile = path.resolve("pedidos.json");

const pedidosDefault = [
  {
    id: 1,
    productoId: 1,
    productoNombre: "Plataforma CRM Premium",
    clienteNombre: "Gómez Industrial S.A. de C.V.",
    cantidad: 2,
    total: 370000,
    estado: "en proceso",
    fechaPedido: "2026-06-15T10:00:00.000Z",
    direccionEnvio: "Av. Industria 120, Guadalajara",
    notas: "Entrega prioritaria a bodega central.",
  },
  {
    id: 2,
    productoId: 2,
    productoNombre: "Paquete de soporte técnico",
    clienteNombre: "TechNexus México",
    cantidad: 1,
    total: 32000,
    estado: "completado",
    fechaPedido: "2026-05-22T09:30:00.000Z",
    direccionEnvio: "Blvd. Tecnológico 34, CDMX",
    notas: "Soporte mensual para equipo de ventas.",
  },
  {
    id: 3,
    productoId: 3,
    productoNombre: "Integración API personalizada",
    clienteNombre: "Distribuciones del Valle S.A.",
    cantidad: 1,
    total: 78000,
    estado: "pendiente",
    fechaPedido: "2026-06-28T16:10:00.000Z",
    direccionEnvio: "Camino Real 220, Estado de México",
    notas: "Cotizacion aceptada, pendiente confirmacion de pago.",
  },
  {
    id: 4,
    productoId: 4,
    productoNombre: "Formación comercial avanzada",
    clienteNombre: "Consultoría Verde S.A. de C.V.",
    cantidad: 3,
    total: 66000,
    estado: "completado",
    fechaPedido: "2026-04-15T12:45:00.000Z",
    direccionEnvio: "Av. Reforma 180, CDMX",
    notas: "Curso programado para julio.",
  },
];

let pedidos = [];
let nextId = 1;

function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const fileData = fs.readFileSync(dataFile, "utf-8");
      pedidos = JSON.parse(fileData);
      if (pedidos.length > 0) {
        nextId = Math.max(...pedidos.map((item) => item.id)) + 1;
      }
    } else {
      pedidos = [...pedidosDefault];
      nextId = pedidos.length + 1;
      saveData();
    }
  } catch (error) {
    console.error("Error leyendo pedidos.json:", error);
    pedidos = [...pedidosDefault];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(pedidos, null, 2));
  } catch (error) {
    console.error("Error escribiendo pedidos.json:", error);
  }
}

loadData();

export function findAll() {
  return pedidos;
}

export function findById(id) {
  return pedidos.find((item) => item.id === Number(id));
}

export function create(data) {
  const newItem = { id: nextId++, ...data };
  pedidos.push(newItem);
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
  const index = pedidos.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  pedidos.splice(index, 1);
  saveData();
  return true;
}
