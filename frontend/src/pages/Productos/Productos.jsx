import { useEffect, useMemo, useState } from "react";
import { crearProducto, actualizarProducto, eliminarProducto, getProductos } from "../../services/productosService";
import "./Productos.css";

const EMPTY_FORM = {
  nombre: "",
  categoria: "Software",
  precio: "",
  inventario: "",
  unidad: "licencias",
  estado: "disponible",
  descripcion: "",
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadProductos() {
    getProductos()
      .then((res) => setProductos(res.data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((item) => {
      const text = `${item.nombre || ""} ${item.categoria || ""} ${item.descripcion || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "todos" || (item.estado || "disponible") === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [productos, search, estadoFiltro]);

  const inventorySummary = useMemo(() => {
    return {
      total: productos.length,
      disponibles: productos.filter((item) => (item.estado || "disponible") !== "agotado").length,
      agotados: productos.filter((item) => (item.estado || "disponible") === "agotado").length,
    };
  }, [productos]);

  function openCreateModal() {
    setEditingProducto(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingProducto(item);
    setForm({
      nombre: item.nombre || "",
      categoria: item.categoria || "Software",
      precio: item.precio?.toString() || "",
      inventario: item.inventario?.toString() || "",
      unidad: item.unidad || "licencias",
      estado: item.estado || "disponible",
      descripcion: item.descripcion || "",
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
      precio: Number(form.precio) || 0,
      inventario: Number(form.inventario) || 0,
    };

    try {
      if (editingProducto) {
        await actualizarProducto(editingProducto.id, payload);
      } else {
        await crearProducto(payload);
      }
      setModalOpen(false);
      await loadProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar el producto ${item.nombre || "seleccionado"}?`)) return;
    try {
      await eliminarProducto(item.id);
      await loadProductos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section-page">
      {/* HEADER SUPERIOR */}
      <div className="section-header">
        <div>
          <h1>Catálogo de Productos</h1>
          <p className="subtitle">Controla inventario, categorías y disponibilidad en tiempo real.</p>
        </div>
        <button type="button" className="btn-primary-glow" onClick={openCreateModal}>
          <span className="material-symbols-outlined">inventory_2</span>
          Nuevo producto
        </button>
      </div>

      {/* TARJETAS DE RESUMEN (DESAMONTONADAS) */}
      <div className="section-summary">
        <div className="glass-card summary-card">
          <div className="summary-icon icon-cyan">
            <span className="material-symbols-outlined">widgets</span>
          </div>
          <div className="summary-info">
            <span>Productos Registrados</span>
            <strong>{inventorySummary.total}</strong>
          </div>
        </div>

        <div className="glass-card summary-card">
          <div className="summary-icon icon-emerald">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="summary-info">
            <span>Disponibles</span>
            <strong>{inventorySummary.disponibles}</strong>
          </div>
        </div>

        <div className="glass-card summary-card">
          <div className="summary-icon icon-rose">
            <span className="material-symbols-outlined">do_not_disturb_on</span>
          </div>
          <div className="summary-info">
            <span>Agotados</span>
            <strong>{inventorySummary.agotados}</strong>
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS Y BÚSQUEDA */}
      <div className="glass-card section-toolbar">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="search"
            className="glass-input"
            placeholder="Buscar producto, categoría o descripción..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos" },
            { value: "disponible", label: "Disponibles" },
            { value: "agotado", label: "Agotados" },
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

      {error && <div className="error-banner">Error cargando productos: {error}</div>}

      <div className="results-counter">
        Mostrando <strong>{productosFiltrados.length}</strong> resultados
      </div>

      {/* TABLA PRINCIPAL DE PRODUCTOS */}
      <div className="glass-card main-table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Inventario</th>
              <th>Unidad</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((item) => (
              <tr key={item.id} className="glass-row">
                <td className="cell-id">#{item.id}</td>
                <td className="cell-title">{item.nombre}</td>
                <td>
                  <span className="badge-category">{item.categoria || "-"}</span>
                </td>
                <td className="cell-value">{formatCurrency(item.precio)}</td>
                <td>
                  <strong>{item.inventario ?? "-"}</strong>
                </td>
                <td className="cell-unit">{item.unidad || "-"}</td>
                <td>
                  <span className={`badge-status ${item.estado === "agotado" ? "status-rose" : "status-emerald"}`}>
                    {(item.estado || "disponible").toUpperCase()}
                  </span>
                </td>
                <td className="cell-desc" title={item.descripcion}>
                  {item.descripcion || "-"}
                </td>
                <td>
                  <div className="action-buttons-wrapper">
                    <button type="button" className="btn-glass-action" onClick={() => openEditModal(item)}>
                      Editar
                    </button>
                    <button type="button" className="btn-glass-action btn-danger" onClick={() => handleDelete(item)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDITAR / AGREGAR */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="glass-modal modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card-header">
              <div>
                <h2>{editingProducto ? "Editar producto" : "Agregar producto"}</h2>
                <p>{editingProducto ? "Actualiza los detalles del producto." : "Registra un nuevo producto o servicio."}</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                <span>Nombre</span>
                <input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required />
              </label>
              <label className="field-group">
                <span>Categoría</span>
                <input value={form.categoria} onChange={(event) => updateField("categoria", event.target.value)} />
              </label>
              <label className="field-group">
                <span>Precio</span>
                <input type="number" value={form.precio} onChange={(event) => updateField("precio", event.target.value)} />
              </label>
              <label className="field-group">
                <span>Inventario</span>
                <input type="number" value={form.inventario} onChange={(event) => updateField("inventario", event.target.value)} />
              </label>
              <label className="field-group">
                <span>Unidad</span>
                <input value={form.unidad} onChange={(event) => updateField("unidad", event.target.value)} />
              </label>
              <label className="field-group">
                <span>Estado</span>
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="disponible">Disponible</option>
                  <option value="agotado">Agotado</option>
                </select>
              </label>
              <label className="field-group full-width">
                <span>Descripción</span>
                <textarea rows={3} value={form.descripcion} onChange={(event) => updateField("descripcion", event.target.value)} />
              </label>
            </form>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary-glow" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : editingProducto ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}