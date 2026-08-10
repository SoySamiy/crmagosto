import { Router } from "express";

export function crudRoutesFactory(controller) {
  const router = Router();

  router.get("/", controller.listar);
  router.get("/:id", controller.obtener);
  router.post("/", controller.crear);
  router.put("/:id", controller.actualizar);
  router.delete("/:id", controller.eliminar);

  return router;
}
