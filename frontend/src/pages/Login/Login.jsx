import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    login({ email });
    navigate("/");
  }

  return (
    <div className="login-page">
      <form className="login-card glass" data-aos="zoom-in" onSubmit={handleSubmit}>
        <div className="login-logo">
          <span className="material-symbols-outlined">hub</span>
        </div>
        <h1 className="login-title">CRM Pro</h1>
        <p className="login-subtitle">Gestión de Relaciones Empresariales</p>

        <h2 className="login-welcome">Bienvenido de nuevo</h2>
        <p className="login-hint">Ingresa tus credenciales para acceder a la consola.</p>

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
          <a href="#" className="login-forgot">
            ¿Olvidaste tu contraseña?
          </a>
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
          <button type="button" className="login-sso-button">
            Google
          </button>
          <button type="button" className="login-sso-button">
            Azure AD
          </button>
        </div>
      </form>
    </div>
  );
}
