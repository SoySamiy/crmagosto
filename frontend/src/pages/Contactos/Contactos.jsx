import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { crearContacto, actualizarContacto, eliminarContacto, getContactos } from "../../services/contactosService";
import "./Contactos.css";

const PERSONA_FILTROS = {
  fisicas: { valor: "fisica", titulo: "Personas fisicas" },
  morales: { valor: "moral", titulo: "Personas morales" },
};

const DATA_REFRESH_EVENT = "crm-data-refresh";
const DATA_REFRESH_STORAGE_KEY = "crm-data-refresh";

const EMPTY_FORM = {
  nombre: "",
  email: "",
  telefono: "",
  puesto: "",
  departamento: "Ventas",
  empresa: "",
  direccion: "",
  estado: "activo",
  origen: "Recomendación",
  prioridad: "media",
  tipoPersona: "fisica",
  notas: "",
  ultimoContacto: "",
};

function formatFecha(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getInitials(nombre) {
  if (!nombre) return "C";
  return nombre.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function notifyDataRefresh() {
  const stamp = Date.now().toString();
  localStorage.setItem(DATA_REFRESH_STORAGE_KEY, stamp);
  window.dispatchEvent(new CustomEvent(DATA_REFRESH_EVENT, { detail: stamp }));
}

export default function Contactos() {
  const { personaTipo } = useParams();
  const [contactos, setContactos] = useState([]);
  const [error, setError] = useState(null);
  const [modalReunion, setModalReunion] = useState(null);
  const [direccionExpandida, setDireccionExpandida] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadContactos() {
    getContactos()
      .then((res) => setContactos(res.data || []))
      .catch((err) => setError(err.message));
  }

  const personaSeleccionada = PERSONA_FILTROS[personaTipo]?.valor;
  const contactosFiltrados = useMemo(() => {
    return contactos.filter((contacto) => {
      if (!personaSeleccionada) return true;
      return contacto.tipoPersona === personaSeleccionada;
    });
  }, [contactos, personaSeleccionada]);

  const titulo = PERSONA_FILTROS[personaTipo]?.titulo ? `Contactos - ${PERSONA_FILTROS[personaTipo].titulo}` : "Contactos";

  useEffect(() => {
    loadContactos();
    const handleRefresh = () => loadContactos();
    window.addEventListener(DATA_REFRESH_EVENT, handleRefresh);
    window.addEventListener("storage", (event) => {
      if (event.key === DATA_REFRESH_STORAGE_KEY) handleRefresh();
    });

    return () => {
      window.removeEventListener(DATA_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  const summary = useMemo(() => {
    const activos = contactos.filter((contact) => contact.estado === "activo").length;
    const pendientes = contactos.filter((contact) => contact.estado === "pendiente").length;
    return { total: contactos.length, activos, pendientes };
  }, [contactos]);

  function openCreateModal() {
    setEditingContact(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(contact) {
    setEditingContact(contact);
    setForm({
      ...EMPTY_FORM,
      ...contact,
      ultimoContacto: toDatetimeLocal(contact.ultimoContacto),
      departamento: contact.departamento || "Ventas",
      estado: contact.estado || "activo",
      prioridad: contact.prioridad || "media",
    });
    setModalOpen(true);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) return;

    setSaving(true);
    setError(null);

    const ahora = new Date().toISOString();
    const payload = {
      ...form,
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      puesto: form.puesto.trim(),
      departamento: form.departamento.trim(),
      empresa: form.empresa.trim(),
      direccion: form.direccion.trim(),
      estado: form.estado || "activo",
      origen: form.origen || "Recomendación",
      prioridad: form.prioridad || "media",
      tipoPersona: form.tipoPersona || "fisica",
      notas: form.notas.trim(),
      creadoEl: editingContact?.creadoEl || ahora,
      ultimoContacto: form.ultimoContacto ? new Date(form.ultimoContacto).toISOString() : ahora,
    };

    try {
      if (editingContact) {
        await actualizarContacto(editingContact.id, payload);
      } else {
        await crearContacto(payload);
      }
      setModalOpen(false);
      await loadContactos();
      notifyDataRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(contact) {
    if (!window.confirm(`¿Eliminar a ${contact.nombre || "este contacto"}?`)) return;
    try {
      await eliminarContacto(contact.id);
      await loadContactos();
      notifyDataRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="crm-main-container">
      <header className="crm-header">
        <div className="title-section">
          <h1>{titulo}</h1>
          <p>Gestión de clientes, prospectos y equipo comercial</p>
        </div>
        <button className="btn-primary header-action" onClick={openCreateModal}>
          <span className="material-symbols-outlined">person_add</span>
          Nuevo contacto
        </button>
      </header>

      {error && <p className="error-msg">Error: {error}</p>}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Activos</span>
          <strong>{summary.activos}</strong>
        </div>
        <div className="summary-card">
          <span>Pendientes</span>
          <strong>{summary.pendientes}</strong>
        </div>
      </div>

      <div className="cards-grid">
        {contactosFiltrados.map((c) => {
          const tieneDireccion = c.direccion && c.direccion !== "null";
          const estado = c.estado || "activo";
          const prioridad = c.prioridad || "media";

          return (
            <div className="contact-card" key={c.id}>
              <div className="card-header">
                <div className="avatar-circle">{getInitials(c.nombre)}</div>
                <div className="name-area">
                  <h3>{c.nombre}</h3>
                  <div className="badge-row">
                    <span className={`type-tag ${estado}`}>{estado}</span>
                    <span className={`type-tag secondary ${prioridad}`}>{prioridad}</span>
                    {c.tipoPersona && (
                      <span className={`type-tag persona-${c.tipoPersona}`}>{c.tipoPersona === "moral" ? "Persona moral" : "Persona fisica"}</span>
                    )}
                    <button className="meeting-tag interactive-btn" onClick={() => setModalReunion(c)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      Reuniones
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="data-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <a href={`mailto:${c.email}`} className="interactive-link">{c.email || "contacto@empresa.com"}</a>
                </div>

                <div className="data-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>{c.telefono || "555-0101"}</span>
                </div>

                <div className="data-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>{c.puesto || "Puesto no definido"}</span>
                </div>

                <div className="data-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18"></path><path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"></path><rect x="4" y="7" width="16" height="13" rx="2"></rect></svg>
                  <span>{c.empresa || "Empresa sin registrar"}</span>
                </div>

                <div className="address-container">
                  <div className="data-line interactive-link" onClick={() => setDireccionExpandida(direccionExpandida === c.id ? null : c.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span className="text-truncate">{tieneDireccion ? c.direccion : "Dirección no registrada"}</span>
                  </div>

                  {direccionExpandida === c.id && (
                    <div className="address-panel">
                      <strong>Detalles adicionales:</strong>
                      <span>{tieneDireccion ? c.direccion : "Sin información extra."}</span>
                      {c.notas && <span>Notas: {c.notas}</span>}
                    </div>
                  )}
                </div>

                <div className="data-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  <span>{c.departamento || "Departamento no definido"}</span>
                </div>

                <div className="data-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{formatFecha(c.ultimoContacto || c.creadoEl)}</span>
                </div>
              </div>

              <div className="card-footer">
                <span className={`status-pill ${estado}`}>{estado}</span>
                <div className="footer-actions">
                  <button className="edit-circle-btn" onClick={() => openEditModal(c)} title="Editar contacto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                  <button className="delete-circle-btn" onClick={() => handleDelete(c)} title="Eliminar contacto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalReunion && (
        <div className="modal-overlay" onClick={() => setModalReunion(null)}>
          <div className="contact-card modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reuniones</h2>
              <button className="close-btn" onClick={() => setModalReunion(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="avatar-circle modal-avatar">{getInitials(modalReunion.nombre)}</div>
              <h3>{modalReunion.nombre}</h3>
              <div className="meeting-status">
                {modalReunion.proximaReunion ? (
                  <p className="has-meeting">Próxima reunión: <strong>{formatFecha(modalReunion.proximaReunion)}</strong></p>
                ) : (
                  <p className="no-meeting">No hay ninguna reunión programada en este momento.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => alert("Función para agendar pendiente")}>
                Agendar nueva
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="contact-card modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingContact ? "Editar contacto" : "Crear contacto"}</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <label>
                  Nombre
                  <input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required />
                </label>
                <label>
                  Email
                  <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
                </label>
                <label>
                  Teléfono
                  <input value={form.telefono} onChange={(event) => updateField("telefono", event.target.value)} />
                </label>
                <label>
                  Puesto
                  <input value={form.puesto} onChange={(event) => updateField("puesto", event.target.value)} />
                </label>
                <label>
                  Tipo de persona
                  <select value={form.tipoPersona} onChange={(event) => updateField("tipoPersona", event.target.value)}>
                    <option value="fisica">Persona física</option>
                    <option value="moral">Persona moral</option>
                  </select>
                </label>
                <label>
                  Departamento
                  <input value={form.departamento} onChange={(event) => updateField("departamento", event.target.value)} />
                </label>
                <label>
                  Empresa
                  <input value={form.empresa} onChange={(event) => updateField("empresa", event.target.value)} />
                </label>
                <label>
                  Dirección
                  <input value={form.direccion} onChange={(event) => updateField("direccion", event.target.value)} />
                </label>
                <label>
                  Estado
                  <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </label>
                <label>
                  Origen
                  <input value={form.origen} onChange={(event) => updateField("origen", event.target.value)} />
                </label>
                <label>
                  Prioridad
                  <select value={form.prioridad} onChange={(event) => updateField("prioridad", event.target.value)}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </label>
                <label>
                  Último contacto
                  <input type="datetime-local" value={form.ultimoContacto} onChange={(event) => updateField("ultimoContacto", event.target.value)} />
                </label>
                <label className="full-width">
                  Notas
                  <textarea rows={3} value={form.notas} onChange={(event) => updateField("notas", event.target.value)} />
                </label>
              </div>

              <div className="modal-footer form-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Guardando..." : editingContact ? "Guardar cambios" : "Crear contacto"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}