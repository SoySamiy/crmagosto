import { useEffect, useMemo, useState } from "react";
import { crearProducto, actualizarProducto, eliminarProducto, getProductos } from "../../services/productosService";
import "../../styles/SectionPage.css";

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
      <div className="section-header">
        <div>
          <h1>Productos</h1>
          <p>Controla el catálogo, precios y disponibilidad de tus productos y servicios.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">inventory_2</span>
          Nuevo producto
        </button>
      </div>

      <div className="section-toolbar">
        <input
          type="search"
          placeholder="Buscar producto, categoría o descripción..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos" },
            { value: "disponible", label: "Disponibles" },
            { value: "agotado", label: "Agotados" },
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

      {error && <p className="error">Error cargando productos: {error}</p>}

      <div className="section-summary">
        <div className="summary-card">
          <span>Productos registrados</span>
          <strong>{inventorySummary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Disponibles</span>
          <strong>{inventorySummary.disponibles}</strong>
        </div>
        <div className="summary-card">
          <span>Agotados</span>
          <strong>{inventorySummary.agotados}</strong>
        </div>
      </div>

      <div className="table-actions">
        <span>{productosFiltrados.length} resultados</span>
      </div>

      <div className="table-container">
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>{item.categoria || "-"}</td>
                <td>{formatCurrency(item.precio)}</td>
                <td>{item.inventario ?? "-"}</td>
                <td>{item.unidad || "-"}</td>
                <td>{(item.estado || "disponible").toUpperCase()}</td>
                <td>{item.descripcion || "-"}</td>
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
                <h2>{editingProducto ? "Editar producto" : "Agregar producto"}</h2>
                <p>{editingProducto ? "Actualiza los detalles del producto." : "Registra un nuevo producto o servicio."}</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                Nombre
                <input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required />
              </label>
              <label className="field-group">
                Categoría
                <input value={form.categoria} onChange={(event) => updateField("categoria", event.target.value)} />
              </label>
              <label className="field-group">
                Precio
                <input type="number" value={form.precio} onChange={(event) => updateField("precio", event.target.value)} />
              </label>
              <label className="field-group">
                Inventario
                <input type="number" value={form.inventario} onChange={(event) => updateField("inventario", event.target.value)} />
              </label>
              <label className="field-group">
                Unidad
                <input value={form.unidad} onChange={(event) => updateField("unidad", event.target.value)} />
              </label>
              <label className="field-group">
                Estado
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="disponible">Disponible</option>
                  <option value="agotado">Agotado</option>
                </select>
              </label>
              <label className="field-group" style={{ gridColumn: "1 / -1" }}>
                Descripción
                <textarea rows={4} value={form.descripcion} onChange={(event) => updateField("descripcion", event.target.value)} />
              </label>
            </form>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : editingProducto ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
