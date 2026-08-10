import { useMemo, useState } from "react";
import { useEffect } from "react";
import { crearCliente, actualizarCliente, eliminarCliente, getClientes } from "../../services/clientesService";
import "./Leads.css";

const SETTINGS_KEY = "crm-settings";

const ETAPAS = [
  { value: "all", label: "Todos" },
  { value: "contacto_inicial", label: "Contacto inicial" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "propuesta", label: "Propuesta" },
  { value: "cerrado", label: "Cerrado" },
];

function getStageClass(etapa) {
  return etapa?.toLowerCase?.() || "contacto_inicial";
}

const EMPTY_FORM = {
  nombre: "",
  email: "",
  telefono: "",
  origen: "Recomendación",
  asignadoA: "",
  tipoPersona: "fisica",
  tipo: "prospecto",
  etapa: "contacto_inicial",
  valor: "",
  notas: "",
  presupuestoAceptado: false,
  rfc: "",
  regimenFiscal: "",
  direccionFiscal: "",
  cp: "",
  representante: "",
};

const DATA_REFRESH_EVENT = "crm-data-refresh";
const DATA_REFRESH_STORAGE_KEY = "crm-data-refresh";

function notifyDataRefresh() {
  const stamp = Date.now().toString();
  localStorage.setItem(DATA_REFRESH_STORAGE_KEY, stamp);
  window.dispatchEvent(new CustomEvent(DATA_REFRESH_EVENT, { detail: stamp }));
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ destacarLeads: true });

  function loadLeads() {
    getClientes()
      .then((res) => {
        const leadsData = (res.data || []).filter((cliente) => cliente.tipo === "prospecto");
        setLeads(leadsData);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {}
    }

    const handleRefresh = () => loadLeads();
    const handleSettingsUpdate = (event) => {
      if (event.detail) {
        setSettings((prev) => ({ ...prev, ...event.detail }));
      }
    };

    window.addEventListener(DATA_REFRESH_EVENT, handleRefresh);
    window.addEventListener("crm-settings-updated", handleSettingsUpdate);
    window.addEventListener("storage", (event) => {
      if (event.key === DATA_REFRESH_STORAGE_KEY) handleRefresh();
    });

    loadLeads();

    return () => {
      window.removeEventListener(DATA_REFRESH_EVENT, handleRefresh);
      window.removeEventListener("crm-settings-updated", handleSettingsUpdate);
    };
  }, []);

  function openCreateModal() {
    setEditingLead(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(lead) {
    setEditingLead(lead);
    setForm({
      ...EMPTY_FORM,
      ...lead,
      valor: lead.valor ?? "",
      presupuestoAceptado: Boolean(lead.presupuestoAceptado),
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
      origen: form.origen || "Recomendación",
      asignadoA: form.asignadoA.trim(),
      tipoPersona: form.tipoPersona || "fisica",
      tipo: form.tipo || "prospecto",
      etapa: form.etapa || "contacto_inicial",
      valor: Number(form.valor) || 0,
      notas: form.notas || "",
      presupuestoAceptado: Boolean(form.presupuestoAceptado),
      creadoEl: editingLead?.creadoEl || ahora,
      ultimoContacto: editingLead?.ultimoContacto || ahora,
      representante: form.representante || undefined,
      rfc: form.rfc || "",
      regimenFiscal: form.regimenFiscal || "",
      direccionFiscal: form.direccionFiscal || "",
      cp: form.cp || "",
    };

    try {
      if (editingLead) {
        await actualizarCliente(editingLead.id, payload);
      } else {
        await crearCliente(payload);
      }
      setModalOpen(false);
      await loadLeads();
      notifyDataRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lead) {
    if (!window.confirm(`¿Eliminar el lead ${lead.nombre || "seleccionado"}?`)) return;

    try {
      await eliminarCliente(lead.id);
      await loadLeads();
      notifyDataRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStage = stage === "all" || lead.etapa === stage;
      const text = `${lead.nombre || ""} ${lead.email || ""} ${lead.origen || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [leads, search, stage]);

  const stats = useMemo(() => {
    const total = leads.length;
    const seguimiento = leads.filter((lead) => lead.etapa === "seguimiento").length;
    const propuesta = leads.filter((lead) => lead.etapa === "propuesta").length;
    const cerrados = leads.filter((lead) => lead.etapa === "cerrado").length;
    const conversion = total ? Math.round((cerrados / total) * 100) : 0;

    return { total, seguimiento, propuesta, cerrados, conversion };
  }, [leads]);

  const insights = [
    { label: "Leads activos", value: stats.total },
    { label: "En seguimiento", value: stats.seguimiento },
    { label: "En propuesta", value: stats.propuesta },
    { label: "Cerrados", value: stats.cerrados },
  ];

  return (
    <div className="leads-page" data-aos="fade-up">
      <div className="leads-header">
        <div>
          <h1>Leads</h1>
          <p>Convierte oportunidades en clientes con un flujo más accionable.</p>
        </div>
        <div className="lead-actions-row">
          <div className="lead-alert">
            Tasa de conversión estimada: {stats.conversion}%
          </div>
          <button className="btn-primary lead-create-btn" onClick={openCreateModal}>
            <span className="material-symbols-outlined">add</span>
            Nuevo lead
          </button>
        </div>
      </div>

      {error && <p className="error-msg">No se pudo cargar la información de leads: {error}</p>}

      <div className="lead-stats-grid">
        <div className="lead-stat-card">
          <span className="label">Total de leads</span>
          <span className="value">{stats.total}</span>
        </div>
        <div className="lead-stat-card">
          <span className="label">Seguimiento</span>
          <span className="value">{stats.seguimiento}</span>
        </div>
        <div className="lead-stat-card">
          <span className="label">Propuesta</span>
          <span className="value">{stats.propuesta}</span>
        </div>
        <div className="lead-stat-card">
          <span className="label">Cerrados</span>
          <span className="value">{stats.cerrados}</span>
        </div>
      </div>

      <div className="leads-workspace">
        <section className="leads-panel">
          <div className="leads-toolbar">
            <input
              className="leads-search"
              placeholder="Buscar por nombre, correo o origen"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {ETAPAS.map((etapa) => (
              <button
                key={etapa.value}
                className={`lead-stage-chip ${stage === etapa.value ? "active" : ""}`}
                onClick={() => setStage(etapa.value)}
              >
                {etapa.label}
              </button>
            ))}
          </div>

          <div className="lead-list">
            {filteredLeads.map((lead) => (
              <article key={lead.id} className={`lead-card ${settings.destacarLeads && Number(lead.valor || 0) >= 50000 ? "priority" : ""}`}>
                <div className="lead-card-header">
                  <div>
                    <h3>{lead.nombre || "Lead sin nombre"}</h3>
                    <p>{lead.email || "Sin correo"}</p>
                    {settings.destacarLeads && Number(lead.valor || 0) >= 50000 ? <span className="priority-badge">Prioritario</span> : null}
                  </div>
                  <span className={`lead-badge ${getStageClass(lead.etapa)}`}>{lead.etapa || "contacto_inicial"}</span>
                </div>

                <div className="lead-meta">
                  <span>Origen: {lead.origen || "Sin origen"}</span>
                  <span>Asignado: {lead.asignadoA || "Sin asignar"}</span>
                  <span>Valor: {lead.valor ? `${Number(lead.valor).toLocaleString("es-MX")} MXN` : "Sin valor"}</span>
                </div>

                <div className="lead-progress">
                  <div className="lead-progress-bar" style={{ width: `${Math.min(100, (lead.etapa === "cerrado" ? 100 : lead.etapa === "propuesta" ? 75 : lead.etapa === "seguimiento" ? 50 : 25))}%` }} />
                </div>

                <div className="lead-actions">
                  <button className="primary" onClick={() => openEditModal(lead)}>Editar lead</button>
                  <button onClick={() => handleDelete(lead)}>Eliminar</button>
                  <button className="success" onClick={() => openEditModal({ ...lead, etapa: "cerrado" })}>Marcar como cerrado</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="lead-insight-card">
          <h3>Resumen de oportunidad</h3>
          <div className="insight-list">
            {insights.map((item) => (
              <div key={item.label} className="insight-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {modalOpen && (
        <div className="lead-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="lead-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="lead-modal-header">
              <h3>{editingLead ? "Editar lead" : "Crear lead"}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form className="lead-modal-form" onSubmit={handleSubmit}>
              <div className="lead-modal-grid">
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
                  Origen
                  <input value={form.origen} onChange={(event) => updateField("origen", event.target.value)} />
                </label>
                <label>
                  Asignado a
                  <input value={form.asignadoA} onChange={(event) => updateField("asignadoA", event.target.value)} />
                </label>
                <label>
                  Etapa
                  <select value={form.etapa} onChange={(event) => updateField("etapa", event.target.value)}>
                    {ETAPAS.filter((etapa) => etapa.value !== "all").map((etapa) => (
                      <option key={etapa.value} value={etapa.value}>{etapa.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Valor estimado
                  <input type="number" value={form.valor} onChange={(event) => updateField("valor", event.target.value)} />
                </label>
                <label>
                  Tipo de persona
                  <select value={form.tipoPersona} onChange={(event) => updateField("tipoPersona", event.target.value)}>
                    <option value="fisica">Persona física</option>
                    <option value="moral">Persona moral</option>
                  </select>
                </label>
                <label>
                  Notas
                  <textarea rows={3} value={form.notas} onChange={(event) => updateField("notas", event.target.value)} />
                </label>
              </div>

              <div className="lead-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Guardando..." : editingLead ? "Guardar cambios" : "Crear lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
