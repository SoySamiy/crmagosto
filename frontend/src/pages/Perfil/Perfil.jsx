import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Perfil.css";

const STORAGE_KEY = "crm-profile";

const defaultProfile = {
  nombre: "",
  cargo: "Director comercial",
  telefono: "+52 55 0000 0000",
  ubicacion: "Ciudad de México",
  bio: "Gestiona clientes, leads y oportunidades con seguimiento diario.",
};

export default function Perfil() {
  const { usuario } = useAuth();
  const email = usuario?.email || "Invitado";
  const initial = (email.charAt(0) || "U").toUpperCase();

  const [perfil, setPerfil] = useState(defaultProfile);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      try {
        setPerfil({ ...defaultProfile, ...JSON.parse(guardado) });
      } catch {
        setPerfil(defaultProfile);
      }
    } else {
      setPerfil((prev) => ({ ...prev, nombre: email.split("@")[0] || "Invitado" }));
    }
  }, [email]);

  function actualizarCampo(event) {
    const { name, value } = event.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  }

  function guardarPerfil(event) {
    event.preventDefault();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
    setMensaje("Perfil actualizado correctamente");
    window.setTimeout(() => setMensaje(""), 2200);
  }

  async function copiarCorreo() {
    try {
      await navigator.clipboard.writeText(email);
      setMensaje("Correo copiado al portapapeles");
      window.setTimeout(() => setMensaje(""), 2200);
    } catch {
      setMensaje("No fue posible copiar el correo");
    }
  }

  return (
    <div className="perfil-page">
      <h1 data-aos="fade-up">Mi perfil</h1>

      <div className="card glass profile-card" data-aos="fade-up" data-aos-delay="100">
        <span className="profile-avatar">{initial}</span>
        <div>
          <h3>{perfil.nombre || email}</h3>
          <p className="profile-role">{perfil.cargo || "Usuario del sistema"}</p>
          <p className="profile-meta">{email}</p>
        </div>
      </div>

      <div className="profile-grid" data-aos="fade-up" data-aos-delay="140">
        <form className="card glass profile-form" onSubmit={guardarPerfil}>
          <div className="section-title">
            <h3>Datos del perfil</h3>
            <span>Actualiza tu información de contacto</span>
          </div>

          <label>
            Nombre
            <input name="nombre" value={perfil.nombre} onChange={actualizarCampo} placeholder="Tu nombre" />
          </label>
          <label>
            Cargo
            <input name="cargo" value={perfil.cargo} onChange={actualizarCampo} placeholder="Cargo" />
          </label>
          <label>
            Teléfono
            <input name="telefono" value={perfil.telefono} onChange={actualizarCampo} placeholder="Teléfono" />
          </label>
          <label>
            Ubicación
            <input name="ubicacion" value={perfil.ubicacion} onChange={actualizarCampo} placeholder="Ciudad o región" />
          </label>
          <label>
            Biografía
            <textarea name="bio" rows="3" value={perfil.bio} onChange={actualizarCampo} placeholder="Describe tu rol" />
          </label>

          <div className="profile-actions">
            <button type="submit" className="btn-primary">Guardar cambios</button>
            <button type="button" className="btn-secondary" onClick={copiarCorreo}>Copiar correo</button>
          </div>
          {mensaje ? <p className="profile-message">{mensaje}</p> : null}
        </form>

        <div className="profile-side-stack">
          <div className="card glass profile-stats">
            <div className="section-title">
              <h3>Resumen de actividad</h3>
              <span>Vista rápida del día</span>
            </div>
            <div className="stat-pill">Seguimiento: 12 tareas</div>
            <div className="stat-pill">Leads activos: 7</div>
            <div className="stat-pill">Clientes en onboarding: 3</div>
          </div>

          <div className="card glass profile-activity">
            <div className="section-title">
              <h3>Acciones rápidas</h3>
              <span>Herramientas frecuentes</span>
            </div>
            <ul>
              <li>Revisar oportunidades pendientes</li>
              <li>Actualizar próximos seguimientos</li>
              <li>Enviar resumen semanal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
