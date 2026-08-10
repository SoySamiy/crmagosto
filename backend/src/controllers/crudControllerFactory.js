export function crudControllerFactory(model) {
  return {
    listar(req, res) {
      res.json(model.findAll());
    },
    obtener(req, res) {
      const item = model.findById(req.params.id);
      if (!item) return res.status(404).json({ mensaje: "No encontrado" });
      res.json(item);
    },
    crear(req, res) {
      const item = model.create(req.body);
      res.status(201).json(item);
    },
    actualizar(req, res) {
      const item = model.update(req.params.id, req.body);
      if (!item) return res.status(404).json({ mensaje: "No encontrado" });
      res.json(item);
    },
    eliminar(req, res) {
      const eliminado = model.remove(req.params.id);
      if (!eliminado) return res.status(404).json({ mensaje: "No encontrado" });
      res.status(204).send();
    },
  };
}
