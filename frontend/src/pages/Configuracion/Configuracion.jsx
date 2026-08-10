import { useEffect, useState } from "react";
import "./Configuracion.css";

const STORAGE_KEY = "crm-settings";

const DEFAULT_SETTINGS = {
  notificaciones: true,
  modoOscuro: true,
  autenticacion2fa: false,
  resumenSemanal: true,
  vistaCompacta: false,
  notificacionesContexto: true,
  autoGuardar: true,
  destacarLeads: true,
  frecuencia: "diaria",
  idioma: "es",
};

const SETTINGS = [
  { key: "notificaciones", label: "Notificaciones por correo", icon: "mail" },
  { key: "modoOscuro", label: "Modo oscuro", icon: "dark_mode" },
  { key: "autenticacion2fa", label: "Autenticación en dos pasos", icon: "shield" },
  { key: "resumenSemanal", label: "Resumen semanal automático", icon: "calendar_month" },
  { key: "vistaCompacta", label: "Vista compacta", icon: "density_small" },
  { key: "notificacionesContexto", label: "Alertas contextuales", icon: "notifications_active" },
  { key: "autoGuardar", label: "Auto-guardar cambios", icon: "save" },
  { key: "destacarLeads", label: "Destacar leads prioritarios", icon: "star" },
];

export default function Configuracion() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(guardado) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("crm-settings-updated", { detail: settings }));
  }, [settings]);

  function toggle(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function actualizarSelect(event) {
    const { name, value } = event.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  function guardarCambios() {
    const payload = JSON.stringify(settings);
    window.localStorage.setItem(STORAGE_KEY, payload);
    window.dispatchEvent(new CustomEvent("crm-settings-updated", { detail: settings }));
    setMensaje("Preferencias guardadas");
    window.setTimeout(() => setMensaje(""), 2200);
  }

  function restaurarPredeterminadas() {
    const restored = DEFAULT_SETTINGS;
    setSettings(restored);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    window.dispatchEvent(new CustomEvent("crm-settings-updated", { detail: restored }));
    setMensaje("Configuración restaurada");
    window.setTimeout(() => setMensaje(""), 2200);
  }

  return (
    <div className="config-page">
      <h1 data-aos="fade-up">Configuración</h1>

      <div className="settings-list glass" data-aos="fade-up" data-aos-delay="100">
        {SETTINGS.map((item) => (
          <div className="settings-row" key={item.key}>
            <div className="settings-row-label">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <button
              type="button"
              className={`switch ${settings[item.key] ? "on" : ""}`}
              onClick={() => toggle(item.key)}
              aria-pressed={settings[item.key]}
            >
              <span className="switch-thumb" />
            </button>
          </div>
        ))}

        <div className="settings-row settings-select-row">
          <div className="settings-row-label">
            <span className="material-symbols-outlined">schedule</span>
            <span>Frecuencia de alertas</span>
          </div>
          <select name="frecuencia" value={settings.frecuencia} onChange={actualizarSelect}>
            <option value="diaria">Diaria</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>

        <div className="settings-row settings-select-row">
          <div className="settings-row-label">
            <span className="material-symbols-outlined">language</span>
            <span>Idioma de la interfaz</span>
          </div>
          <select name="idioma" value={settings.idioma} onChange={actualizarSelect}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="config-actions" data-aos="fade-up" data-aos-delay="140">
        <button type="button" className="btn-primary" onClick={guardarCambios}>Guardar cambios</button>
        <button type="button" className="btn-secondary" onClick={restaurarPredeterminadas}>Restaurar predeterminadas</button>
      </div>
      {mensaje ? <p className="config-message">{mensaje}</p> : null}
    </div>
  );
}
