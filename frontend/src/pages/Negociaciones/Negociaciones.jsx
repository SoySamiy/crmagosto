import { useEffect, useMemo, useState } from "react";
import {
  actualizarNegociacion,
  crearNegociacion,
  eliminarNegociacion,
  getNegociaciones,
} from "../../services/negociacionesService";
import "../../styles/SectionPage.css";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function formatProbability(value) {
  if (value === undefined || value === null) return "-";
  return `${value}%`;
}

const ETAPAS_MAP = {
  contacto_inicial: { label: "Contacto inicial", color: "blue" },
  seguimiento: { label: "Seguimiento", color: "purple" },
  propuesta: { label: "Propuesta", color: "amber" },
  negociacion: { label: "Negociación", color: "cyan" },
  fidelizado: { label: "Fidelizado", color: "emerald" },
};

const NEGOCIACION_FORM_TEMPLATE = {
  nombre: "",
  clienteNombre: "",
  valor: "",
  etapa: "contacto_inicial",
  probabilidad: "10",
  vendedor: "",
  fechaCierre: "",
  notas: "",
};

export default function Negociaciones() {
  const [negociaciones, setNegociaciones] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [etapaFiltro, setEtapaFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(NEGOCIACION_FORM_TEMPLATE);
  const [saving, setSaving] = useState(false);

  function loadNegociaciones() {
    getNegociaciones()
      .then((res) => setNegociaciones(res.data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadNegociaciones();
  }, []);

  const negociacionesFiltradas = useMemo(() => {
    return negociaciones.filter((item) => {
      const text = `${item.nombre || ""} ${item.clienteNombre || ""} ${item.vendedor || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesEtapa = etapaFiltro === "todos" || item.etapa === etapaFiltro;
      return matchesSearch && matchesEtapa;
    });
  }, [negociaciones, search, etapaFiltro]);

  const stats = useMemo(() => {
    const total = negociaciones.length;
    const altaProbabilidad = negociaciones.filter((item) => item.probabilidad >= 75).length;
    const enProgreso = negociaciones.filter(
      (item) => item.etapa === "negociacion" || item.etapa === "propuesta"
    ).length;
    const fidelizadas = negociaciones.filter((item) => item.etapa === "fidelizado").length;
    return { total, altaProbabilidad, enProgreso, fidelizadas };
  }, [negociaciones]);

  function openCreateModal() {
    setError(null);
    setForm({ ...NEGOCIACION_FORM_TEMPLATE, fechaCierre: "" });
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
      valor: Number(form.valor) || 0,
      probabilidad: Number(form.probabilidad) || 0,
    };

    try {
      await crearNegociacion(payload);
      setModalOpen(false);
      await loadNegociaciones();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCloseOpportunity(item) {
    try {
      await actualizarNegociacion(item.id, {
        ...item,
        etapa: "fidelizado",
        probabilidad: 100,
      });
      await loadNegociaciones();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar la negociación ${item.nombre || "seleccionada"}?`)) return;
    try {
      await eliminarNegociacion(item.id);
      await loadNegociaciones();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section-page glass-layout">
      {/* Encabezado Superior */}
      <div className="section-header">
        <div>
          <h1 className="title-gradient">Negociaciones</h1>
          <p className="subtitle">
            Administra las oportunidades en negociación y mantén el control de cierres.
          </p>
        </div>
        <button type="button" className="btn-primary-glow" onClick={openCreateModal}>
          <span className="material-symbols-outlined">handshake</span>
          Nueva negociación
        </button>
      </div>

      {/* Tarjetas Métrica Cristal */}
      <div className="section-summary">
        <div className="summary-card glass-card">
          <div className="summary-icon icon-emerald">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div className="summary-info">
            <span>Total de oportunidades</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="summary-icon icon-cyan">
            <span className="material-symbols-outlined">speed</span>
          </div>
          <div className="summary-info">
            <span>Alta probabilidad</span>
            <strong>{stats.altaProbabilidad}</strong>
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="summary-icon icon-blue">
            <span className="material-symbols-outlined">settings_suggest</span>
          </div>
          <div className="summary-info">
            <span>En negociación</span>
            <strong>{stats.enProgreso}</strong>
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="summary-icon icon-indigo">
            <span className="material-symbols-outlined">handshake</span>
          </div>
          <div className="summary-info">
            <span>Fidelizadas</span>
            <strong>{stats.fidelizadas}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar / Filtros de Cristal */}
      <div className="section-toolbar glass-card">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="search"
            placeholder="Buscar por oportunidad, cliente o vendedor..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="glass-input"
          />
        </div>

        <div className="filter-group">
          {[
            { value: "todos", label: "Todas" },
            { value: "contacto_inicial", label: "Contacto inicial" },
            { value: "seguimiento", label: "Seguimiento" },
            { value: "propuesta", label: "Propuesta" },
            { value: "negociacion", label: "Negociación" },
            { value: "fidelizado", label: "Fidelizado" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={`glass-pill ${etapaFiltro === item.value ? "active" : ""}`}
              onClick={() => setEtapaFiltro(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-glass">Error cargando negociaciones: {error}</p>}

      <div className="table-actions">
        <span className="results-counter">{negociacionesFiltradas.length} resultados encontrados</span>
      </div>

      {/* Tabla con Estilo Cristal Impresionante */}
      <div className="table-container glass-card main-table-glass">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Oportunidad</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Etapa</th>
              <th>Probabilidad</th>
              <th>Vendedor</th>
              <th>Cierre</th>
              <th>Notas</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {negociacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-table-cell">
                  No se encontraron negociaciones registradas.
                </td>
              </tr>
            ) : (
              negociacionesFiltradas.map((item) => {
                const etapaInfo = ETAPAS_MAP[item.etapa] || {
                  label: item.etapa || "-",
                  color: "gray",
                };
                return (
                  <tr key={item.id} className="glass-row">
                    <td className="cell-id">#{item.id}</td>
                    <td className="cell-title">{item.nombre}</td>
                    <td className="cell-client">{item.clienteNombre}</td>
                    <td className="cell-value">{formatCurrency(item.valor)}</td>
                    <td>
                      <span className={`badge-pill badge-${etapaInfo.color}`}>
                        {etapaInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="probability-container">
                        <span>{formatProbability(item.probabilidad)}</span>
                        {item.probabilidad !== undefined && (
                          <div className="prob-bar-bg">
                            <div
                              className="prob-bar-fill"
                              style={{ width: `${Math.min(item.probabilidad, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{item.vendedor || "-"}</td>
                    <td>
                      {item.fechaCierre
                        ? new Date(item.fechaCierre).toLocaleDateString("es-MX")
                        : "-"}
                    </td>
                    <td className="cell-notes" title={item.notas || ""}>
                      {item.notas || "-"}
                    </td>
                    <td>
                      <div className="action-buttons-wrapper">
                        <button
                          type="button"
                          className="btn-glass-action"
                          onClick={() => handleCloseOpportunity(item)}
                          disabled={item.etapa === "fidelizado"}
                        >
                          Cerrar
                        </button>
                        <button
                          type="button"
                          className="btn-glass-action btn-danger"
                          onClick={() => handleDelete(item)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Rediseñado Cristal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card glass-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card-header">
              <div>
                <h2>Nueva negociación</h2>
                <p>Registra una oportunidad comercial en el pipeline.</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                Oportunidad
                <input
                  value={form.nombre}
                  onChange={(event) => updateField("nombre", event.target.value)}
                  placeholder="Ej. Proyecto Software CRM"
                  required
                />
              </label>
              <label className="field-group">
                Cliente
                <input
                  value={form.clienteNombre}
                  onChange={(event) => updateField("clienteNombre", event.target.value)}
                  placeholder="Nombre de la empresa o cliente"
                  required
                />
              </label>
              <label className="field-group">
                Valor estimado ($)
                <input
                  type="number"
                  value={form.valor}
                  onChange={(event) => updateField("valor", event.target.value)}
                  placeholder="0.00"
                  required
                />
              </label>
              <label className="field-group">
                Etapa
                <select
                  value={form.etapa}
                  onChange={(event) => updateField("etapa", event.target.value)}
                >
                  <option value="contacto_inicial">Contacto inicial</option>
                  <option value="seguimiento">Seguimiento</option>
                  <option value="propuesta">Propuesta</option>
                  <option value="negociacion">Negociación</option>
                  <option value="fidelizado">Fidelizado</option>
                </select>
              </label>
              <label className="field-group">
                Probabilidad (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.probabilidad}
                  onChange={(event) => updateField("probabilidad", event.target.value)}
                  required
                />
              </label>
              <label className="field-group">
                Vendedor
                <input
                  value={form.vendedor}
                  onChange={(event) => updateField("vendedor", event.target.value)}
                  placeholder="Nombre del asesor comercial"
                />
              </label>
              <label className="field-group">
                Fecha de cierre
                <input
                  type="date"
                  value={form.fechaCierre}
                  onChange={(event) => updateField("fechaCierre", event.target.value)}
                />
              </label>
              <label className="field-group" style={{ gridColumn: "1 / -1" }}>
                Notas
                <textarea
                  rows={4}
                  value={form.notas}
                  onChange={(event) => updateField("notas", event.target.value)}
                  placeholder="Agrega anotaciones relevantes..."
                />
              </label>
            </form>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary-glass"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary-glow"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Crear negociación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}