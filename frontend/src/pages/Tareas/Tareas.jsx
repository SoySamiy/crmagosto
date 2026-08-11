import { useEffect, useMemo, useState } from "react";
import {
  crearTarea,
  actualizarTarea,
  eliminarTarea,
  getTareas,
} from "../../services/tareasService";
import "../../styles/SectionPage.css";

const EMPTY_FORM = {
  titulo: "",
  descripcion: "",
  asignadoA: "",
  estado: "pendiente",
  prioridad: "media",
  fechaVencimiento: "",
  notas: "",
};

function formatFecha(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadTareas() {
    getTareas()
      .then((res) => setTareas(res.data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadTareas();
  }, []);

  const tareasFiltradas = useMemo(() => {
    return tareas.filter((item) => {
      const text = `${item.titulo || ""} ${item.descripcion || ""} ${item.asignadoA || ""} ${item.prioridad || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "todos" || item.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [tareas, search, estadoFiltro]);

  const summary = useMemo(() => {
    return {
      total: tareas.length,
      pendientes: tareas.filter((item) => item.estado === "pendiente").length,
      enProgreso: tareas.filter((item) => item.estado === "en progreso").length,
      completadas: tareas.filter((item) => item.estado === "completada").length,
    };
  }, [tareas]);

  function openCreateModal() {
    setEditingTarea(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingTarea(item);
    setForm({
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      asignadoA: item.asignadoA || "",
      estado: item.estado || "pendiente",
      prioridad: item.prioridad || "media",
      fechaVencimiento: item.fechaVencimiento || "",
      notas: item.notas || "",
    });
    setModalOpen(true);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      fechaVencimiento: form.fechaVencimiento || new Date().toISOString().slice(0, 10),
    };

    try {
      if (editingTarea) {
        await actualizarTarea(editingTarea.id, payload);
      } else {
        await crearTarea(payload);
      }
      setModalOpen(false);
      await loadTareas();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar la tarea "${item.titulo || "sin título"}"?`)) return;
    try {
      await eliminarTarea(item.id);
      await loadTareas();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <div>
          <h1>Tareas</h1>
          <p>Organiza las actividades y seguimiento del equipo comercial.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">task</span>
          Nueva tarea
        </button>
      </div>

      <div className="section-toolbar">
        <input
          type="search"
          placeholder="Buscar por tarea, responsable o prioridad..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos los estados" },
            { value: "pendiente", label: "Pendientes" },
            { value: "en progreso", label: "En progreso" },
            { value: "completada", label: "Completadas" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={`section-pill ${estadoFiltro === item.value ? "active" : ""}`}
              onClick={() => setEstadoFiltro(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error">Error cargando tareas: {error}</p>}

      <div className="section-summary">
        <div className="summary-card">
          <span>Total de tareas</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Pendientes</span>
          <strong>{summary.pendientes}</strong>
        </div>
        <div className="summary-card">
          <span>En progreso</span>
          <strong>{summary.enProgreso}</strong>
        </div>
        <div className="summary-card">
          <span>Completadas</span>
          <strong>{summary.completadas}</strong>
        </div>
      </div>

      <div className="table-actions">
        <span>{tareasFiltradas.length} resultados</span>
      </div>

      <div className="table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Asignado a</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Vencimiento</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareasFiltradas.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.titulo}</td>
                <td>{item.asignadoA || "Sin asignar"}</td>
                <td>{item.estado}</td>
                <td>{item.prioridad}</td>
                <td>{formatFecha(item.fechaVencimiento)}</td>
                <td>{item.notas || "-"}</td>
                <td>
                  <button type="button" className="table-action" onClick={() => openEditModal(item)}>
                    Editar
                  </button>
                  <button type="button" className="table-action danger" onClick={() => handleDelete(item)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card-header">
              <div>
                <h2>{editingTarea ? "Editar tarea" : "Nueva tarea"}</h2>
                <p>{editingTarea ? "Ajusta la información y el responsable." : "Planifica una nueva actividad."}</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form id="tarea-form" className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                Título
                <input value={form.titulo} onChange={(event) => updateField("titulo", event.target.value)} required />
              </label>
              <label className="field-group">
                Descripción
                <textarea rows={3} value={form.descripcion} onChange={(event) => updateField("descripcion", event.target.value)} />
              </label>
              <label className="field-group">
                Asignado a
                <input value={form.asignadoA} onChange={(event) => updateField("asignadoA", event.target.value)} />
              </label>
              <label className="field-group">
                Estado
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="pendiente">Pendiente</option>
                  <option value="en progreso">En progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </label>
              <label className="field-group">
                Prioridad
                <select value={form.prioridad} onChange={(event) => updateField("prioridad", event.target.value)}>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </label>
              <label className="field-group">
                Fecha de vencimiento
                <input type="date" value={form.fechaVencimiento} onChange={(event) => updateField("fechaVencimiento", event.target.value)} />
              </label>
              <label className="field-group" style={{ gridColumn: "1 / -1" }}>
                Notas
                <textarea rows={4} value={form.notas} onChange={(event) => updateField("notas", event.target.value)} />
              </label>
            </form>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button form="tarea-form" type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : editingTarea ? "Actualizar tarea" : "Crear tarea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
