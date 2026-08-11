import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleParallax(e) {
      const layers = document.querySelectorAll(".login-bg-layer");
      const x = (window.innerWidth / 2 - e.clientX) / 40;
      const y = (window.innerHeight / 2 - e.clientY) / 40;

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth) || 0;
        layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
      });
    }

    window.addEventListener("mousemove", handleParallax);
    return () => window.removeEventListener("mousemove", handleParallax);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }

    if (!email.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }

    setError("");
    login({ email, roles: ["usuario"] });
    navigate("/");
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-bg-layer layer-1" data-depth="0.8" />
        <div className="login-bg-layer layer-2" data-depth="0.5" />
        <div className="login-bg-layer layer-3" data-depth="1.1" />
        <div className="login-bg-layer layer-4" data-depth="0.3" />
      </div>

      <div className="login-container">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-logo">
            <span className="material-symbols-outlined">hub</span>
          </div>
          <h1 className="login-title">CRM Pro</h1>
          <p className="login-subtitle">Accede a tu panel de clientes y ventas.</p>

          <h2 className="login-welcome">Bienvenido de nuevo</h2>
          <p className="login-hint">Introduce tu correo y contraseña para continuar.</p>

          {error && <div className="login-error">{error}</div>}

          <label className="login-label" htmlFor="email">
            Correo corporativo
          </label>
          <input
            id="email"
            type="email"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="login-label-row">
            <label className="login-label" htmlFor="password">
              Contraseña
            </label>
            <button type="button" className="login-forgot" onClick={() => setError("Por favor contacta al administrador para restablecer tu contraseña.")}>¿Olvidaste tu contraseña?</button>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-submit">
            Iniciar sesión
          </button>

          <div className="login-divider">O continuar con</div>

          <div className="login-sso">
            <button type="button" className="login-sso-button" onClick={() => setError("Función de SSO no disponible en esta demo.")}>Google</button>
            <button type="button" className="login-sso-button" onClick={() => setError("Función de SSO no disponible en esta demo.")}>Azure AD</button>
          </div>
        </form>
      </div>
    </div>
  );
}
