import { Router } from "express";
import clientesRoutes from "./clientesRoutes.js";
import contactosRoutes from "./contactosRoutes.js";

const router = Router();

router.use("/clientes", clientesRoutes);
router.use("/contactos", contactosRoutes);

export default router;
