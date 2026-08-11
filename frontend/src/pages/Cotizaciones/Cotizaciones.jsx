import { useEffect, useMemo, useState } from "react";
import {
  crearCotizacion,
  actualizarCotizacion,
  eliminarCotizacion,
  getCotizaciones,
} from "../../services/cotizacionesService";
import "../../styles/SectionPage.css";

const EMPTY_FORM = {
  referencia: "",
  cliente: "",
  monto: "",
  estado: "en revisión",
  responsable: "",
  fechaCreacion: new Date().toISOString().slice(0, 10),
  fechaValidez: "",
  items: "",
  notas: "",
};

function formatFecha(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCotizacion, setEditingCotizacion] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadCotizaciones() {
    getCotizaciones()
      .then((res) => setCotizaciones(res.data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadCotizaciones();
  }, []);

  const cotizacionesFiltradas = useMemo(() => {
    return cotizaciones.filter((item) => {
      const text = `${item.referencia || ""} ${item.cliente || ""} ${item.responsable || ""} ${item.estado || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "todos" || item.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [cotizaciones, search, estadoFiltro]);

  const summary = useMemo(() => {
    return {
      total: cotizaciones.length,
      enRevision: cotizaciones.filter((item) => item.estado === "en revisión").length,
      aprobadas: cotizaciones.filter((item) => item.estado === "aprobada").length,
      rechazadas: cotizaciones.filter((item) => item.estado === "rechazada").length,
    };
  }, [cotizaciones]);

  function openCreateModal() {
    setEditingCotizacion(null);
    setForm({ ...EMPTY_FORM, fechaCreacion: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingCotizacion(item);
    setForm({
      referencia: item.referencia || "",
      cliente: item.cliente || "",
      monto: item.monto?.toString() || "",
      estado: item.estado || "en revisión",
      responsable: item.responsable || "",
      fechaCreacion: item.fechaCreacion || new Date().toISOString().slice(0, 10),
      fechaValidez: item.fechaValidez || "",
      items: item.items?.map((row) => `${row.nombre} x${row.cantidad} @${row.precioUnitario}`).join("; ") || "",
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
      referencia: form.referencia.trim(),
      cliente: form.cliente.trim(),
      monto: Number(form.monto) || 0,
      estado: form.estado,
      responsable: form.responsable.trim(),
      fechaCreacion: form.fechaCreacion,
      fechaValidez: form.fechaValidez,
      items: form.items
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [nombrePart, cantidadPart, precioPart] = item.split(/\s*x|\s*@/i).map((part) => part.trim());
          return {
            nombre: nombrePart || "Item",
            cantidad: Number(cantidadPart) || 1,
            precioUnitario: Number(precioPart) || 0,
          };
        }),
      notas: form.notas.trim(),
    };

    try {
      if (editingCotizacion) {
        await actualizarCotizacion(editingCotizacion.id, payload);
      } else {
        await crearCotizacion(payload);
      }
      setModalOpen(false);
      await loadCotizaciones();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar la cotización ${item.referencia || "seleccionada"}?`)) return;
    try {
      await eliminarCotizacion(item.id);
      await loadCotizaciones();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <div>
          <h1>Cotizaciones</h1>
          <p>Registra y administra las cotizaciones generadas para tus clientes.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">description</span>
          Nueva cotización
        </button>
      </div>

      <div className="section-toolbar">
        <input
          type="search"
          placeholder="Buscar por referencia, cliente o responsable..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos los estados" },
            { value: "en revisión", label: "En revisión" },
            { value: "aprobada", label: "Aprobadas" },
            { value: "rechazada", label: "Rechazadas" },
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

      {error && <p className="error">Error cargando cotizaciones: {error}</p>}

      <div className="section-summary">
        <div className="summary-card">
          <span>Total de cotizaciones</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>En revisión</span>
          <strong>{summary.enRevision}</strong>
        </div>
        <div className="summary-card">
          <span>Aprobadas</span>
          <strong>{summary.aprobadas}</strong>
        </div>
        <div className="summary-card">
          <span>Rechazadas</span>
          <strong>{summary.rechazadas}</strong>
        </div>
      </div>

      <div className="table-actions">
        <span>{cotizacionesFiltradas.length} resultados</span>
      </div>

      <div className="table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Referencia</th>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha creación</th>
              <th>Validez</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizacionesFiltradas.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.referencia}</td>
                <td>{item.cliente}</td>
                <td>{formatCurrency(item.monto)}</td>
                <td>{item.estado}</td>
                <td>{item.responsable}</td>
                <td>{formatFecha(item.fechaCreacion)}</td>
                <td>{formatFecha(item.fechaValidez)}</td>
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
                <h2>{editingCotizacion ? "Editar cotización" : "Nueva cotización"}</h2>
                <p>{editingCotizacion ? "Ajusta los detalles de la cotización." : "Crea una nueva cotización para el cliente."}</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form id="cotizacion-form" className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                Referencia
                <input value={form.referencia} onChange={(event) => updateField("referencia", event.target.value)} required />
              </label>
              <label className="field-group">
                Cliente
                <input value={form.cliente} onChange={(event) => updateField("cliente", event.target.value)} required />
              </label>
              <label className="field-group">
                Monto
                <input type="number" value={form.monto} onChange={(event) => updateField("monto", event.target.value)} required />
              </label>
              <label className="field-group">
                Estado
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="en revisión">En revisión</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </label>
              <label className="field-group">
                Responsable
                <input value={form.responsable} onChange={(event) => updateField("responsable", event.target.value)} />
              </label>
              <label className="field-group">
                Fecha de validez
                <input type="date" value={form.fechaValidez} onChange={(event) => updateField("fechaValidez", event.target.value)} />
              </label>
              <label className="field-group" style={{ gridColumn: "1 / -1" }}>
                Items (separa con ; )
                <textarea rows={3} value={form.items} onChange={(event) => updateField("items", event.target.value)} placeholder="Producto xCantidad @Precio; Servicio xCantidad @Precio" />
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
              <button form="cotizacion-form" type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : editingCotizacion ? "Actualizar cotización" : "Crear cotización"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
