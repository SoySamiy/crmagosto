import { useEffect, useMemo, useState } from "react";
import { crearCompania, actualizarCompania, eliminarCompania, getCompanias } from "../../services/companiasService";
import "../../styles/SectionPage.css";

const EMPTY_FORM = {
  nombre: "",
  email: "",
  telefono: "",
  tipoPersona: "moral",
  sector: "",
  rfc: "",
  empleados: "",
  direccion: "",
  estado: "activo",
  etapa: "prospecto",
  origen: "Prospecto inbound",
  asignadoA: "",
  valor: "",
  notas: "",
  ultimoContacto: "",
};

function formatFecha(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Companias() {
  const [companias, setCompanias] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompania, setEditingCompania] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadCompanias() {
    getCompanias()
      .then((res) => setCompanias(res.data || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadCompanias();
  }, []);

  const companiasFiltradas = useMemo(() => {
    return companias.filter((item) => {
      const text = `${item.nombre || ""} ${item.email || ""} ${item.sector || ""} ${item.origen || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesEstado = estadoFiltro === "todos" || item.estado === estadoFiltro;
      const matchesTipo = tipoFiltro === "todos" || item.tipoPersona === tipoFiltro;
      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [companias, search, estadoFiltro, tipoFiltro]);

  const summary = useMemo(() => {
    const pipeline = companias.reduce((sum, item) => sum + Number(item.valor || item.valorAnual || 0), 0);
    return {
      total: companias.length,
      morales: companias.filter((c) => c.tipoPersona === "moral").length,
      fisicas: companias.filter((c) => c.tipoPersona === "fisica").length,
      pipeline,
      activos: companias.filter((c) => c.estado === "activo").length,
      prospectos: companias.filter((c) => c.estado === "prospecto").length,
    };
  }, [companias]);

  function openCreateModal() {
    setEditingCompania(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingCompania(item);
    setForm({
      nombre: item.nombre || "",
      email: item.email || "",
      telefono: item.telefono || "",
      tipoPersona: item.tipoPersona || "moral",
      sector: item.sector || "",
      rfc: item.rfc || "",
      empleados: item.empleados || "",
      direccion: item.direccion || "",
      estado: item.estado || "activo",
      etapa: item.etapa || "prospecto",
      origen: item.origen || "",
      asignadoA: item.asignadoA || "",
      valor: item.valor?.toString() || "",
      notas: item.notas || "",
      ultimoContacto: item.ultimoContacto || "",
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
      valor: Number(form.valor) || 0,
      empleados: Number(form.empleados) || 0,
      ultimoContacto: form.ultimoContacto || new Date().toISOString(),
    };

    try {
      if (editingCompania) {
        await actualizarCompania(editingCompania.id, payload);
      } else {
        await crearCompania(payload);
      }
      setModalOpen(false);
      await loadCompanias();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar a ${item.nombre || "esta compañía"}?`)) return;
    try {
      await eliminarCompania(item.id);
      await loadCompanias();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <div>
          <h1>Compañías</h1>
          <p>Registra y gestiona las compañías vinculadas a tus clientes y contactos.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">business</span>
          Nueva compañía
        </button>
      </div>

      <div className="section-toolbar">
        <input
          type="search"
          placeholder="Buscar compañías, sector o origen..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="filter-group">
          {[
            { value: "todos", label: "Todos los estados" },
            { value: "activo", label: "Activo" },
            { value: "prospecto", label: "Prospecto" },
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
        <div className="filter-group">
          {[
            { value: "todos", label: "Todas las personas" },
            { value: "moral", label: "Personas morales" },
            { value: "fisica", label: "Personas físicas" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={`section-pill ${tipoFiltro === item.value ? "active" : ""}`}
              onClick={() => setTipoFiltro(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error">Error cargando compañías: {error}</p>}

      <div className="section-summary">
        <div className="summary-card">
          <span>Total de compañías</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Personas morales</span>
          <strong>{summary.morales}</strong>
        </div>
        <div className="summary-card">
          <span>Personas físicas</span>
          <strong>{summary.fisicas}</strong>
        </div>
        <div className="summary-card">
          <span>Pipeline estimado</span>
          <strong>{summary.pipeline.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}</strong>
        </div>
      </div>

      <div className="table-actions">
        <span>{companiasFiltradas.length} resultados</span>
      </div>

      <div className="table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo persona</th>
              <th>Etapa</th>
              <th>Origen</th>
              <th>Valor</th>
              <th>Asignado</th>
              <th>Último contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companiasFiltradas.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>{item.tipoPersona === "moral" ? "Moral" : "Física"}</td>
                <td>{item.etapa || "-"}</td>
                <td>{item.origen || "-"}</td>
                <td>{Number(item.valor || item.valorAnual || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}</td>
                <td>{item.asignadoA || "Sin asignar"}</td>
                <td>{formatFecha(item.ultimoContacto)}</td>
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
                <h2>{editingCompania ? "Editar compañía" : "Crear compañía"}</h2>
                <p>{editingCompania ? "Ajusta los datos y guarda cambios." : "Agrega una nueva compañía al CRM."}</p>
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
                Email
                <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
              </label>
              <label className="field-group">
                Teléfono
                <input value={form.telefono} onChange={(event) => updateField("telefono", event.target.value)} />
              </label>
              <label className="field-group">
                Tipo de empresa
                <select value={form.tipoPersona} onChange={(event) => updateField("tipoPersona", event.target.value)}>
                  <option value="moral">Persona moral</option>
                  <option value="fisica">Persona física</option>
                </select>
              </label>
              <label className="field-group">
                Sector
                <input value={form.sector} onChange={(event) => updateField("sector", event.target.value)} />
              </label>
              <label className="field-group">
                RFC
                <input value={form.rfc} onChange={(event) => updateField("rfc", event.target.value)} />
              </label>
              <label className="field-group">
                Empleados
                <input type="number" value={form.empleados} onChange={(event) => updateField("empleados", event.target.value)} />
              </label>
              <label className="field-group">
                Dirección
                <input value={form.direccion} onChange={(event) => updateField("direccion", event.target.value)} />
              </label>
              <label className="field-group">
                Estado
                <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                  <option value="activo">Activo</option>
                  <option value="prospecto">Prospecto</option>
                </select>
              </label>
              <label className="field-group">
                Etapa
                <input value={form.etapa} onChange={(event) => updateField("etapa", event.target.value)} />
              </label>
              <label className="field-group">
                Origen
                <input value={form.origen} onChange={(event) => updateField("origen", event.target.value)} />
              </label>
              <label className="field-group">
                Asignado a
                <input value={form.asignadoA} onChange={(event) => updateField("asignadoA", event.target.value)} />
              </label>
              <label className="field-group">
                Valor estimado
                <input type="number" value={form.valor} onChange={(event) => updateField("valor", event.target.value)} />
              </label>
              <label className="field-group">
                Último contacto
                <input type="datetime-local" value={form.ultimoContacto} onChange={(event) => updateField("ultimoContacto", event.target.value)} />
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
              <button type="button" className="btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : editingCompania ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
