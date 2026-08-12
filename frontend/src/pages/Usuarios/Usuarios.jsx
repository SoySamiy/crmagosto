import { useEffect, useMemo, useState } from "react";
import {
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  getUsuarios,
} from "../../services/usuariosService";
import "./Usuarios.css";

const EMPTY_FORM = {
  nombre: "",
  email: "",
  roles: "ventas",
  estado: "activo",
  cargo: "Ejecutivo comercial",
  notas: "",
};

function formatFecha(iso) {
  if (!iso) return "Sin conexión";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
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
      {/* HEADER SUPERIOR */}
      <div className="section-header">
        <div>
          <h1>Directorio de Usuarios</h1>
          <p className="subtitle">Gestiona accesos, credenciales y roles del personal del equipo.</p>
        </div>
        <button type="button" className="btn-primary-glow" onClick={openCreateModal}>
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      {/* METRICAS EN UNA SOLA FILA */}
      <div className="section-summary">
        <div className="glass-card summary-card">
          <div className="summary-icon icon-cyan">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="summary-info">
            <span>Total Usuarios</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="glass-card summary-card">
          <div className="summary-icon icon-emerald">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div className="summary-info">
            <span>Usuarios Activos</span>
            <strong>{summary.activos}</strong>
          </div>
        </div>

        <div className="glass-card summary-card">
          <div className="summary-icon icon-rose">
            <span className="material-symbols-outlined">block</span>
          </div>
          <div className="summary-info">
            <span>Inactivos / Suspendidos</span>
            <strong>{summary.inactivos}</strong>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="glass-card section-toolbar">
        <div className="search-input-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="search"
            className="glass-input"
            placeholder="Buscar por nombre, email o cargo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos los estados" },
            { value: "activo", label: "Activos" },
            { value: "inactivo", label: "Inactivos" },
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

      {error && <div className="error-banner">Error cargando usuarios: {error}</div>}

      <div className="results-counter">
        Mostrando <strong>{usuariosFiltrados.length}</strong> colaboradores
      </div>

      {/* GRID DE TARJETAS DE USUARIO (DIFERENTE A TABLA) */}
      <div className="users-grid">
        {usuariosFiltrados.map((item) => (
          <div key={item.id} className="glass-card user-card">
            <div className="user-card-header">
              <div className="avatar-wrapper">
                <div className="user-avatar">{getInitials(item.nombre)}</div>
                <span className={`status-dot ${item.estado === "activo" ? "active" : "inactive"}`} />
              </div>
              <div className="user-card-title">
                <h3>{item.nombre}</h3>
                <span className="user-role-badge">{item.cargo || "Sin cargo registrado"}</span>
              </div>
            </div>

            <div className="user-card-body">
              <div className="user-info-row">
                <span className="material-symbols-outlined">mail</span>
                <span className="info-text">{item.email}</span>
              </div>
              <div className="user-info-row">
                <span className="material-symbols-outlined">badge</span>
                <div className="roles-tags">
                  {item.roles?.length ? (
                    item.roles.map((rol, idx) => (
                      <span key={idx} className="role-chip">{rol}</span>
                    ))
                  ) : (
                    <span className="role-chip">Sin rol</span>
                  )}
                </div>
              </div>
              <div className="user-info-row">
                <span className="material-symbols-outlined">schedule</span>
                <span className="info-text muted">Conexión: {formatFecha(item.ultimaConexion)}</span>
              </div>
            </div>

            <div className="user-card-footer">
              <button type="button" className="btn-card-action" onClick={() => openEditModal(item)}>
                Editar
              </button>
              <button type="button" className="btn-card-action btn-danger" onClick={() => handleDelete(item)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="glass-modal modal-card" onClick={(event) => event.stopPropagation()}>
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
                <span>Nombre</span>
                <input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required />
              </label>
              <label className="field-group">
                <span>Email</span>
                <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
              </label>
              <label className="field-group">
                <span>Roles (separados por coma)</span>
                <input
                  value={form.roles}
                  onChange={(event) => updateField("roles", event.target.value)}
                  placeholder="ventas, admin, manager"
                />
              </label>
              <label className="field-group">
                <span>Estado</span>
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
              <label className="field-group full-width">
                <span>Cargo</span>
                <input value={form.cargo} onChange={(event) => updateField("cargo", event.target.value)} />
              </label>
              <label className="field-group full-width">
                <span>Notas</span>
                <textarea rows={3} value={form.notas} onChange={(event) => updateField("notas", event.target.value)} />
              </label>
            </form>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button form="usuario-form" type="submit" className="btn-primary-glow" disabled={saving}>
                {saving ? "Guardando..." : editingUsuario ? "Actualizar Usuario" : "Crear Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}