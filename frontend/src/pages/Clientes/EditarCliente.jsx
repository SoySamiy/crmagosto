import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getCliente, actualizarCliente } from "../../services/clientesService";
import { TIPOS_CLIENTE, ORIGENES_CLIENTE, getEtapasDeTipo } from "./clienteConstants";
import "./EditarCliente.css";

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatFecha(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

export default function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCliente(id)
      .then((res) => setForm({ ...res.data, ultimoContacto: toDatetimeLocal(res.data.ultimoContacto) }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTipoChange(nuevoTipo) {
    const etapas = getEtapasDeTipo(nuevoTipo);
    setForm((prev) => ({ ...prev, tipo: nuevoTipo, etapa: etapas[0]?.valor || "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await actualizarCliente(id, {
        ...form,
        ultimoContacto: form.ultimoContacto ? new Date(form.ultimoContacto).toISOString() : null,
      });
      navigate("/clientes");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 data-aos="fade-up">Editar cliente</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div>
        <h1 data-aos="fade-up">Editar cliente</h1>
        <p className="error">No se pudo cargar el cliente: {error}</p>
        <Link to="/clientes" className="btn-secondary">
          Volver a clientes
        </Link>
      </div>
    );
  }

  const etapasDisponibles = getEtapasDeTipo(form.tipo);

  return (
    <div>
      <h1 data-aos="fade-up">Editar cliente</h1>

      <form className="edit-card glass" data-aos="fade-up" data-aos-delay="100" onSubmit={handleSubmit}>
        {error && <p className="error">No se pudo guardar el cliente: {error}</p>}

        <h3 className="edit-section-title">ID</h3>
        <p className="edit-readonly">#{form.id}</p>

        <h3 className="edit-section-title">Datos personales o de la empresa</h3>
        <div className="form-field">
          <label>Tipo de cliente</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="tipoPersona"
                checked={form.tipoPersona === "fisica"}
                onChange={() => update("tipoPersona", "fisica")}
              />
              Persona fisica
            </label>
            <label>
              <input
                type="radio"
                name="tipoPersona"
                checked={form.tipoPersona === "moral"}
                onChange={() => update("tipoPersona", "moral")}
              />
              Persona moral / Empresa
            </label>
          </div>
        </div>

        <div className="form-field">
          <label>{form.tipoPersona === "moral" ? "Razon social" : "Nombre completo"}</label>
          <input value={form.nombre || ""} onChange={(e) => update("nombre", e.target.value)} />
        </div>

        {form.tipoPersona === "moral" && (
          <div className="form-field">
            <label>Representante legal</label>
            <input
              value={form.representante || ""}
              onChange={(e) => update("representante", e.target.value)}
            />
          </div>
        )}

        <div className="form-field">
          <label>Correo electronico</label>
          <input
            type="email"
            value={form.email || ""}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Telefono</label>
          <input value={form.telefono || ""} onChange={(e) => update("telefono", e.target.value)} />
        </div>

        <div className="form-field">
          <label>Origen del contacto</label>
          <select value={form.origen || ""} onChange={(e) => update("origen", e.target.value)}>
            {ORIGENES_CLIENTE.map((origen) => (
              <option key={origen} value={origen}>
                {origen}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Asignado a</label>
          <input value={form.asignadoA || ""} onChange={(e) => update("asignadoA", e.target.value)} />
        </div>

        <h3 className="edit-section-title">Datos fiscales</h3>
        <div className="form-field">
          <label>RFC</label>
          <input value={form.rfc || ""} onChange={(e) => update("rfc", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Regimen fiscal</label>
          <input
            value={form.regimenFiscal || ""}
            onChange={(e) => update("regimenFiscal", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Direccion fiscal</label>
          <input
            value={form.direccionFiscal || ""}
            onChange={(e) => update("direccionFiscal", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Codigo postal</label>
          <input value={form.cp || ""} onChange={(e) => update("cp", e.target.value)} />
        </div>

        <h3 className="edit-section-title">Oportunidad</h3>
        <div className="form-field">
          <label>Valor del trato</label>
          <input
            type="number"
            value={form.valor || ""}
            onChange={(e) => update("valor", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Notas / ultimo comentario</label>
          <textarea
            rows={3}
            value={form.notas || ""}
            onChange={(e) => update("notas", e.target.value)}
          />
        </div>

        <h3 className="edit-section-title">Tipo y etapa</h3>
        <div className="form-field">
          <label>Tipo</label>
          <select value={form.tipo || ""} onChange={(e) => handleTipoChange(e.target.value)}>
            <option value="" disabled>
              Selecciona un tipo
            </option>
            {TIPOS_CLIENTE.map((tipo) => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Etapa</label>
          <select value={form.etapa || ""} onChange={(e) => update("etapa", e.target.value)}>
            <option value="" disabled>
              Selecciona una etapa
            </option>
            {etapasDisponibles.map((etapa) => (
              <option key={etapa.valor} value={etapa.valor}>
                {etapa.label}
              </option>
            ))}
          </select>
        </div>

        <h3 className="edit-section-title">Seguimiento</h3>
        <p className="edit-readonly">Creado el: {formatFecha(form.creadoEl)}</p>
        <div className="form-field">
          <label>Ultimo contacto</label>
          <input
            type="datetime-local"
            value={form.ultimoContacto || ""}
            onChange={(e) => update("ultimoContacto", e.target.value)}
          />
        </div>

        <div className="edit-actions">
          <Link to="/clientes" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
