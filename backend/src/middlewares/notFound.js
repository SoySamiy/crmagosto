export function notFound(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.originalUrl}` });
}
