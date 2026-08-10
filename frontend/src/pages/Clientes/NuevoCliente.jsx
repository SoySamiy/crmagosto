import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearCliente } from "../../services/clientesService";
import { useAuth } from "../../context/AuthContext";
import { ORIGENES_CLIENTE } from "./clienteConstants";
import "./NuevoCliente.css";

const STEPS = [
  { id: 1, label: "Datos personales" },
  { id: 2, label: "Datos fiscales" },
  { id: 3, label: "Presupuesto" },
];

export default function NuevoCliente() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    tipoPersona: "fisica",
    nombre: "",
    representante: "",
    email: "",
    telefono: "",
    origen: ORIGENES_CLIENTE[0],
    asignadoA: usuario?.email || "",
    rfc: "",
    regimenFiscal: "",
    direccionFiscal: "",
    cp: "",
    valor: "",
    notas: "",
    presupuestoAceptado: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const canAdvance = useMemo(() => {
    if (step === 1) return form.nombre.trim() !== "" && form.email.trim() !== "";
    if (step === 2) return form.rfc.trim() !== "";
    if (step === 3) return form.valor !== "" && form.presupuestoAceptado !== null;
    return false;
  }, [step, form]);

  function goNext() {
    if (canAdvance && step < 3) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!canAdvance) return;
    setSaving(true);
    setError(null);

    const tipo = form.presupuestoAceptado ? "cliente" : "prospecto";
    const etapa = form.presupuestoAceptado ? "onboarding" : "contacto_inicial";
    const ahora = new Date().toISOString();

    try {
      await crearCliente({
        nombre: form.nombre,
        representante: form.representante || undefined,
        email: form.email,
        telefono: form.telefono,
        tipoPersona: form.tipoPersona,
        origen: form.origen,
        asignadoA: form.asignadoA,
        rfc: form.rfc,
        regimenFiscal: form.regimenFiscal,
        direccionFiscal: form.direccionFiscal,
        cp: form.cp,
        valor: form.valor,
        notas: form.notas,
        presupuestoAceptado: form.presupuestoAceptado,
        tipo,
        etapa,
        creadoEl: ahora,
        ultimoContacto: ahora,
      });
      navigate("/clientes");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 data-aos="fade-up">Nuevo cliente</h1>

      <div className="wizard-steps" data-aos="fade-up" data-aos-delay="50">
        {STEPS.map((s) => (
          <div key={s.id} className={`wizard-step ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
            <span className="wizard-step-circle">
              {step > s.id ? <span className="material-symbols-outlined">check</span> : s.id}
            </span>
            <span className="wizard-step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="wizard-card glass" data-aos="fade-up" data-aos-delay="100">
        {error && <p className="error">No se pudo guardar el cliente: {error}</p>}

        {step === 1 && (
          <div className="wizard-form">
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
              <input
                value={form.nombre}
                onChange={(e) => update("nombre", e.target.value)}
                placeholder={form.tipoPersona === "moral" ? "Grupo Industrial Norte" : "Juan Perez"}
              />
            </div>

            {form.tipoPersona === "moral" && (
              <div className="form-field">
                <label>Representante legal</label>
                <input
                  value={form.representante}
                  onChange={(e) => update("representante", e.target.value)}
                  placeholder="Nombre del representante"
                />
              </div>
            )}

            <div className="form-field">
              <label>Correo electronico</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="contacto@correo.com"
              />
            </div>

            <div className="form-field">
              <label>Telefono</label>
              <input
                value={form.telefono}
                onChange={(e) => update("telefono", e.target.value)}
                placeholder="555-0100"
              />
            </div>

            <div className="form-field">
              <label>Origen del contacto</label>
              <select value={form.origen} onChange={(e) => update("origen", e.target.value)}>
                {ORIGENES_CLIENTE.map((origen) => (
                  <option key={origen} value={origen}>
                    {origen}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Asignado a</label>
              <input
                value={form.asignadoA}
                onChange={(e) => update("asignadoA", e.target.value)}
                placeholder="Nombre del ejecutivo responsable"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-form">
            <div className="form-field">
              <label>RFC</label>
              <input
                value={form.rfc}
                onChange={(e) => update("rfc", e.target.value)}
                placeholder="XAXX010101000"
              />
            </div>
            <div className="form-field">
              <label>Regimen fiscal</label>
              <input
                value={form.regimenFiscal}
                onChange={(e) => update("regimenFiscal", e.target.value)}
                placeholder="Regimen general de ley"
              />
            </div>
            <div className="form-field">
              <label>Direccion fiscal</label>
              <input
                value={form.direccionFiscal}
                onChange={(e) => update("direccionFiscal", e.target.value)}
                placeholder="Calle, numero, colonia, ciudad"
              />
            </div>
            <div className="form-field">
              <label>Codigo postal</label>
              <input
                value={form.cp}
                onChange={(e) => update("cp", e.target.value)}
                placeholder="00000"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-form">
            <div className="form-field">
              <label>Valor estimado del trato</label>
              <input
                type="number"
                value={form.valor}
                onChange={(e) => update("valor", e.target.value)}
                placeholder="50000"
              />
            </div>
            <div className="form-field">
              <label>Notas / ultimo comentario</label>
              <textarea
                value={form.notas}
                onChange={(e) => update("notas", e.target.value)}
                placeholder="Detalle del servicio cotizado o de la llamada"
                rows={3}
              />
            </div>
            <div className="form-field">
              <label>El cliente acepto el presupuesto?</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="presupuestoAceptado"
                    checked={form.presupuestoAceptado === true}
                    onChange={() => update("presupuestoAceptado", true)}
                  />
                  Si, lo acepto
                </label>
                <label>
                  <input
                    type="radio"
                    name="presupuestoAceptado"
                    checked={form.presupuestoAceptado === false}
                    onChange={() => update("presupuestoAceptado", false)}
                  />
                  No, todavia no
                </label>
              </div>
            </div>
            <p className="wizard-hint">
              {form.presupuestoAceptado === true &&
                "El cliente se registrara directamente como Cliente, etapa Onboarding."}
              {form.presupuestoAceptado === false &&
                "El cliente se registrara como Prospecto, etapa Contacto inicial."}
              {form.presupuestoAceptado === null && "Selecciona una opcion para continuar."}
            </p>
          </div>
        )}

        <div className="wizard-actions">
          {step > 1 && (
            <button type="button" className="btn-secondary" onClick={goBack}>
              Atras
            </button>
          )}
          {step < 3 && (
            <button type="button" className="btn-primary" onClick={goNext} disabled={!canAdvance}>
              Siguiente
            </button>
          )}
          {step === 3 && (
            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={!canAdvance || saving}>
              {saving ? "Guardando..." : "Guardar cliente"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
