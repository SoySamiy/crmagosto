import { useEffect, useMemo, useState } from "react";
import { actualizarPedido, crearPedido, eliminarPedido, getPedidos } from "../../services/pedidosService";
import "./Pedidos.css";

function formatFecha(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

const PEDIDO_FORM_TEMPLATE = {
  clienteNombre: "",
  productoNombre: "",
  cantidad: "1",
  total: "",
  estado: "pendiente",
  fechaPedido: new Date().toISOString().slice(0, 16),
  direccionEnvio: "",
  notas: "",
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [form, setForm] = useState(PEDIDO_FORM_TEMPLATE);
  const [saving, setSaving] = useState(false);

  function loadPedidos() {
    getPedidos()
      .then((res) => setPedidos(res.data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((item) => {
      const text = `${item.clienteNombre || ""} ${item.productoNombre || item.productoId || ""} ${item.estado || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "todos" || item.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [pedidos, search, estadoFiltro]);

  const stats = useMemo(() => {
    return {
      total: pedidos.length,
      completados: pedidos.filter((item) => item.estado === "completado").length,
      pendientes: pedidos.filter((item) => item.estado === "pendiente" || item.estado === "en proceso").length,
      cancelados: pedidos.filter((item) => item.estado === "cancelado").length,
    };
  }, [pedidos]);

  async function handleUpdateStatus(pedido, estado) {
    try {
      await actualizarPedido(pedido.id, { ...pedido, estado });
      await loadPedidos();
    } catch (err) {
      setError(err.message);
    }
  }

  function openCreateModal() {
    setEditingPedido(null);
    setError(null);
    setForm({ ...PEDIDO_FORM_TEMPLATE, fechaPedido: new Date().toISOString().slice(0, 16) });
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingPedido(item);
    setError(null);
    setForm({
      clienteNombre: item.clienteNombre || "",
      productoNombre: item.productoNombre || item.productoId || "",
      cantidad: item.cantidad?.toString() || "1",
      total: item.total?.toString() || "",
      estado: item.estado || "pendiente",
      fechaPedido: item.fechaPedido ? new Date(item.fechaPedido).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      direccionEnvio: item.direccionEnvio || "",
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
      cantidad: Number(form.cantidad) || 1,
      total: Number(form.total) || 0,
    };

    try {
      if (editingPedido) {
        await actualizarPedido(editingPedido.id, payload);
      } else {
        await crearPedido(payload);
      }
      setModalOpen(false);
      await loadPedidos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar el pedido #${item.id}?`)) return;
    try {
      await eliminarPedido(item.id);
      await loadPedidos();
    } catch (err) {
      setError(err.message);
    }
  }

  function getStatusBadgeClass(estado) {
    switch (estado) {
      case "completado":
        return "status-emerald";
      case "cancelado":
        return "status-rose";
      case "en proceso":
        return "status-sky";
      default:
        return "status-amber";
    }
  }

  return (
    <div className="section-page">
      {/* HEADER SUPERIOR */}
      <div className="section-header">
        <div>
          <h1>Gestión de Pedidos</h1>
          <p className="subtitle">Monitorea órdenes, estados de entrega y montos globales.</p>
        </div>
        <button type="button" className="btn-primary-glow" onClick={openCreateModal}>
          <span className="material-symbols-outlined">receipt</span>
          Nuevo pedido
        </button>
      </div>

      {/* METRICAS DE RESUMEN */}
      <div className="section-summary">
        <div className="glass-card summary-card">
          <div className="summary-icon icon-cyan">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
          <div className="summary-info">
            <span>Total de Pedidos</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="glass-card summary-card">
          <div className="summary-icon icon-emerald">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div className="summary-info">
            <span>Completados</span>
            <strong>{stats.completados}</strong>
          </div>
        </div>

        <div className="glass-card summary-card">
          <div className="summary-icon icon-amber">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div className="summary-info">
            <span>Pendientes / Proceso</span>
            <strong>{stats.pendientes}</strong>
          </div>
        </div>

        <div className="glass-card summary-card">
          <div className="summary-icon icon-rose">
            <span className="material-symbols-outlined">cancel</span>
          </div>
          <div className="summary-info">
            <span>Cancelados</span>
            <strong>{stats.cancelados}</strong>
          </div>
        </div>
      </div>

      {/* TOOLBAR Y FILTROS */}
      <div className="glass-card section-toolbar">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="search"
            className="glass-input"
            placeholder="Buscar por cliente, producto o estado..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos" },
            { value: "en proceso", label: "En proceso" },
            { value: "pendiente", label: "Pendientes" },
            { value: "completado", label: "Completados" },
            { value: "cancelado", label: "Cancelados" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={`glass-pill ${estadoFiltro === item.value ? "active" : ""}`}
              onClick={() => setEstadoFiltro(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-banner">Error cargando pedidos: {error}</div>}

      <div className="results-counter">
        Mostrando <strong>{pedidosFiltrados.length}</strong> órdenes
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="glass-card main-table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Envío</th>
              <th>Notas</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((item) => (
              <tr key={item.id} className="glass-row">
                <td className="cell-id">#{item.id}</td>
                <td className="cell-title">{item.clienteNombre}</td>
                <td>{item.productoNombre || item.productoId}</td>
                <td><strong>{item.cantidad}</strong></td>
                <td className="cell-value">{formatCurrency(item.total)}</td>
                <td>
                  <span className={`badge-status ${getStatusBadgeClass(item.estado)}`}>
                    {(item.estado || "pendiente").toUpperCase()}
                  </span>
                </td>
                <td className="cell-date">{formatFecha(item.fechaPedido)}</td>
                <td className="cell-desc" title={item.direccionEnvio}>{item.direccionEnvio || "-"}</td>
                <td className="cell-desc" title={item.notas}>{item.notas || "-"}</td>
                <td>
                  <div className="action-buttons-wrapper">
                    <button
                      type="button"
                      className="btn-glass-action"
                      onClick={() => openEditModal(item)}
                    >
                      Editar
                    </button>
                    {item.estado !== "completado" && (
                      <button
                        type="button"
                        className="btn-glass-action btn-success"
                        onClick={() => handleUpdateStatus(item, "completado")}
                      >
                        Completar
                      </button>
                    )}
                    {item.estado !== "cancelado" && (
                      <button
                        type="button"
                        className="btn-glass-action btn-warning"
                        onClick={() => handleUpdateStatus(item, "cancelado")}
                      >
                        Cancelar
                      </button>
                    )}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDITAR / CREAR */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="glass-modal modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card-header">
              <div>
                <h2>{editingPedido ? `Editar Pedido #${editingPedido.id}` : "Nuevo pedido"}</h2>
                <p>{editingPedido ? "Modifica la información de la orden." : "Registra un pedido rápido para tu cliente."}</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                <span>Cliente</span>
                <input value={form.clienteNombre} onChange={(event) => updateField("clienteNombre", event.target.value)} required />
              </label>
              <label className="field-group">
                <span>Producto</span>
                <input value={form.productoNombre} onChange={(event) => updateField("productoNombre", event.target.value)} required />
              </label>
              <label className="field-group">
                <span>Cantidad</span>
                <input type="number" min="1" value={form.cantidad} onChange={(event) => updateField("cantidad", event.target.value)} required />
              </label>
              <label className="field-group">
                <span>Total ($)</span>
                <input type="number" min="0" value={form.total} onChange={(event) => updateField("total", event.target.value)} required />
              </label>
              <label className="field-group">
                <span>Estado</span>
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="pendiente">Pendiente</option>
                  <option value="en proceso">En proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>
              <label className="field-group">
                <span>Fecha de pedido</span>
                <input type="datetime-local" value={form.fechaPedido} onChange={(event) => updateField("fechaPedido", event.target.value)} />
              </label>
              <label className="field-group full-width">
                <span>Dirección de envío</span>
                <input value={form.direccionEnvio} onChange={(event) => updateField("direccionEnvio", event.target.value)} />
              </label>
              <label className="field-group full-width">
                <span>Notas del pedido</span>
                <textarea rows={3} value={form.notas} onChange={(event) => updateField("notas", event.target.value)} />
              </label>
            </form>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary-glow" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : editingPedido ? "Guardar Cambios" : "Crear Pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}