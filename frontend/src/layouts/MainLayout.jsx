import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MainLayout.css";

const SETTINGS_KEY = "crm-settings";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  {
    to: "/clientes",
    label: "Clientes",
    icon: "group",
    children: [
      { to: "/clientes/fisicas", label: "Personas fisicas" },
      { to: "/clientes/morales", label: "Personas morales" },
    ],
  },
  { to: "/leads", label: "Leads", icon: "person_add" },
  { to: "/contactos", label: "Contactos", icon: "contacts" },
];

function UserMenu() {
  const { usuario, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login");
  }

  const email = usuario?.email || "Invitado";
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="user-avatar">{initial}</span>
        <span className="user-email">{email}</span>
        <span className="material-symbols-outlined user-chevron">expand_more</span>
      </button>

      {open && (
        <div className="user-menu-dropdown glass">
          <Link to="/perfil" className="user-menu-item" onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined">person</span>
            Mi perfil
          </Link>
          <Link to="/configuracion" className="user-menu-item" onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined">settings</span>
            Configuracion
          </Link>
          <div className="user-menu-divider" />
          <button type="button" className="user-menu-item" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesion
          </button>
        </div>
      )}
    </div>
  );
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    modoOscuro: true,
    notificaciones: true,
    resumenSemanal: true,
    frecuencia: "diaria",
    idioma: "es",
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {
        setSettings((prev) => prev);
      }
    }
  }, []);

  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      if (event.detail) {
        setSettings((prev) => ({ ...prev, ...event.detail }));
      }
    };

    window.addEventListener("crm-settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("crm-settings-updated", handleSettingsUpdate);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", settings.modoOscuro !== false);
    document.body.classList.toggle("theme-light", settings.modoOscuro === false);
    document.body.dataset.idioma = settings.idioma || "es";
    document.body.dataset.viewMode = settings.vistaCompacta ? "compact" : "expanded";
    document.body.dataset.contextAlerts = settings.notificacionesContexto ? "on" : "off";
    document.body.dataset.highlightLeads = settings.destacarLeads ? "on" : "off";
  }, [settings]);

  return (
    <div className={`main-layout ${settings.modoOscuro === false ? "theme-light" : "theme-dark"}`}>
      <aside className={`sidebar glass ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!collapsed && <h2 className="sidebar-title">CRM 2.0</h2>}
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <div className="nav-group" key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>

              {item.children && !collapsed && (
                <div className="nav-submenu">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) => `nav-sublink ${isActive ? "active" : ""}`}
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar glass">
          <div className="topbar-status">
            {settings.notificaciones ? (
              <span className="topbar-badge">Alertas activas</span>
            ) : (
              <span className="topbar-badge muted">Alertas desactivadas</span>
            )}
            {settings.resumenSemanal ? (
              <span className="topbar-badge">Resumen semanal</span>
            ) : null}
            {settings.vistaCompacta ? (
              <span className="topbar-badge">Vista compacta</span>
            ) : null}
            {settings.destacarLeads ? (
              <span className="topbar-badge">Leads priorizados</span>
            ) : null}
          </div>
          <UserMenu />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
