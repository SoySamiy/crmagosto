import { useEffect, useMemo, useState } from "react";
import {
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  getUsuarios,
} from "../../services/usuariosService";
import "../../styles/SectionPage.css";

const EMPTY_FORM = {
  nombre: "",
  email: "",
  roles: "ventas",
  estado: "activo",
  cargo: "Ejecutivo comercial",
  notas: "",
};

function formatFecha(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadUsuarios() {
    getUsuarios()
      .then((res) => setUsuarios(res.data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((item) => {
      const text = `${item.nombre || ""} ${item.email || ""} ${item.cargo || ""} ${item.roles?.join(" ") || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "todos" || item.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [usuarios, search, estadoFiltro]);

  const summary = useMemo(() => {
    return {
      total: usuarios.length,
      activos: usuarios.filter((item) => item.estado === "activo").length,
      inactivos: usuarios.filter((item) => item.estado !== "activo").length,
    };
  }, [usuarios]);

  function openCreateModal() {
    setEditingUsuario(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingUsuario(item);
    setForm({
      nombre: item.nombre || "",
      email: item.email || "",
      roles: (item.roles || []).join(", "),
      estado: item.estado || "activo",
      cargo: item.cargo || "",
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
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      roles: form.roles.split(",").map((rol) => rol.trim()).filter(Boolean),
      estado: form.estado,
      cargo: form.cargo.trim(),
      notas: form.notas.trim(),
      ultimaConexion: new Date().toISOString(),
    };

    try {
      if (editingUsuario) {
        await actualizarUsuario(editingUsuario.id, payload);
      } else {
        await crearUsuario(payload);
      }
      setModalOpen(false);
      await loadUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar a ${item.nombre || "este usuario"}?`)) return;
    try {
      await eliminarUsuario(item.id);
      await loadUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <div>
          <h1>Usuarios</h1>
          <p>Administra usuarios y roles de acceso para tu equipo comercial.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">people</span>
          Nuevo usuario
        </button>
      </div>

      <div className="section-toolbar">
        <input
          type="search"
          placeholder="Buscar por nombre, email o cargo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos los estados" },
            { value: "activo", label: "Activos" },
            { value: "inactivo", label: "Inactivos" },
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

      {error && <p className="error">Error cargando usuarios: {error}</p>}

      <div className="section-summary">
        <div className="summary-card">
          <span>Usuarios</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Activos</span>
          <strong>{summary.activos}</strong>
        </div>
        <div className="summary-card">
          <span>Inactivos</span>
          <strong>{summary.inactivos}</strong>
        </div>
      </div>

      <div className="table-actions">
        <span>{usuariosFiltrados.length} resultados</span>
      </div>

      <div className="table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Cargo</th>
              <th>Ultima conexión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>{item.email}</td>
                <td>{item.roles?.join(", ") || "-"}</td>
                <td>{item.estado || "-"}</td>
                <td>{item.cargo || "-"}</td>
                <td>{formatFecha(item.ultimaConexion)}</td>
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
                <h2>{editingUsuario ? "Editar usuario" : "Nuevo usuario"}</h2>
                <p>{editingUsuario ? "Actualiza un usuario existente." : "Crea un usuario nuevo para el CRM."}</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form id="usuario-form" className="modal-grid" onSubmit={handleSubmit}>
              <label className="field-group">
                Nombre
                <input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required />
              </label>
              <label className="field-group">
                Email
                <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
              </label>
              <label className="field-group">
                Roles
                <input
                  value={form.roles}
                  onChange={(event) => updateField("roles", event.target.value)}
                  placeholder="ventas, admin, manager"
                />
              </label>
              <label className="field-group">
                Estado
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
              <label className="field-group">
                Cargo
                <input value={form.cargo} onChange={(event) => updateField("cargo", event.target.value)} />
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
              <button form="usuario-form" type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : editingUsuario ? "Actualizar usuario" : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
