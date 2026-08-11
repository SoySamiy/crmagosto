import { useEffect, useMemo, useState } from "react";
import { actualizarPedido, crearPedido, eliminarPedido, getPedidos } from "../../services/pedidosService";
import "../../styles/SectionPage.css";

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
    setError(null);
    setForm({ ...PEDIDO_FORM_TEMPLATE, fechaPedido: new Date().toISOString().slice(0, 16) });
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
      await crearPedido(payload);
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

  return (
    <div className="section-page">
      <div className="section-header">
        <div>
          <h1>Pedidos</h1>
          <p>Monitorea pedidos, estados de entrega y el valor de cada orden.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">receipt</span>
          Nuevo pedido
        </button>
      </div>

      <div className="section-toolbar">
        <input
          type="search"
          placeholder="Buscar por cliente, producto o estado..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
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
              className={`section-pill ${estadoFiltro === item.value ? "active" : ""}`}
              onClick={() => setEstadoFiltro(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error">Error cargando pedidos: {error}</p>}

      <div className="section-summary">
        <div className="summary-card">
          <span>Total de pedidos</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="summary-card">
          <span>Completados</span>
          <strong>{stats.completados}</strong>
        </div>
        <div className="summary-card">
          <span>Pendientes</span>
          <strong>{stats.pendientes}</strong>
        </div>
        <div className="summary-card">
          <span>Cancelados</span>
          <strong>{stats.cancelados}</strong>
        </div>
      </div>

      <div className="table-actions">
        <span>{pedidosFiltrados.length} resultados</span>
      </div>

      <div className="table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Envío</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.clienteNombre}</td>
                <td>{item.productoNombre || item.productoId}</td>
                <td>{item.cantidad}</td>
                <td>{formatCurrency(item.total)}</td>
                <td>{item.estado || "-"}</td>
                <td>{formatFecha(item.fechaPedido)}</td>
                <td>{item.direccionEnvio || "-"}</td>
                <td>{item.notas || "-"}</td>
                <td>
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => handleUpdateStatus(item, "completado")}
                    disabled={item.estado === "completado"}
                  >
                    Completar
                  </button>
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => handleUpdateStatus(item, "cancelado")}
                    disabled={item.estado === "cancelado"}
                  >
                    Cancelar
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
                <h2>Nuevo pedido</h2>
                <p>Registra un pedido rápido para tu cliente.</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                Cliente
                <input value={form.clienteNombre} onChange={(event) => updateField("clienteNombre", event.target.value)} required />
              </label>
              <label className="field-group">
                Producto
                <input value={form.productoNombre} onChange={(event) => updateField("productoNombre", event.target.value)} required />
              </label>
              <label className="field-group">
                Cantidad
                <input type="number" min="1" value={form.cantidad} onChange={(event) => updateField("cantidad", event.target.value)} required />
              </label>
              <label className="field-group">
                Total
                <input type="number" min="0" value={form.total} onChange={(event) => updateField("total", event.target.value)} required />
              </label>
              <label className="field-group">
                Estado
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="pendiente">Pendiente</option>
                  <option value="en proceso">En proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>
              <label className="field-group">
                Fecha de pedido
                <input type="datetime-local" value={form.fechaPedido} onChange={(event) => updateField("fechaPedido", event.target.value)} />
              </label>
              <label className="field-group">
                Dirección de envío
                <input value={form.direccionEnvio} onChange={(event) => updateField("direccionEnvio", event.target.value)} />
              </label>
              <label className="field-group" style={{ gridColumn: "1 / -1" }}>
                Notas del pedido
                <textarea rows={4} value={form.notas} onChange={(event) => updateField("notas", event.target.value)} />
              </label>
            </form>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : "Crear pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
