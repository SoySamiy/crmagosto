import { Router } from "express";
import clientesRoutes from "./clientesRoutes.js";
import contactosRoutes from "./contactosRoutes.js";
import companiasRoutes from "./companiasRoutes.js";
import productosRoutes from "./productosRoutes.js";
import pedidosRoutes from "./pedidosRoutes.js";
import negociacionesRoutes from "./negociacionesRoutes.js";
import usuariosRoutes from "./usuariosRoutes.js";
import tareasRoutes from "./tareasRoutes.js";
import cotizacionesRoutes from "./cotizacionesRoutes.js";
import analiticaRoutes from "./analiticaRoutes.js";

const router = Router();

router.use("/clientes", clientesRoutes);
router.use("/contactos", contactosRoutes);
router.use("/companias", companiasRoutes);
router.use("/productos", productosRoutes);
router.use("/pedidos", pedidosRoutes);
router.use("/negociaciones", negociacionesRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/tareas", tareasRoutes);
router.use("/cotizaciones", cotizacionesRoutes);
router.use("/analitica", analiticaRoutes);

export default router;
