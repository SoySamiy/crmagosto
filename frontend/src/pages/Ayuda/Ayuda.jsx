import "./Ayuda.css";

const helpSections = [
  {
    id: "introduccion",
    title: "Introducción",
    content:
      "Este apartado de ayuda brinda una guía completa sobre cada módulo del CRM y cómo utilizarlo dentro de la aplicación.",
  },
  {
    id: "login",
    title: "Acceso / Login",
    content:
      "La página de login permite iniciar sesión con correo y contraseña. Valida que el correo tenga un formato básico y que ambos campos estén presentes. En esta versión, el inicio es funcional dentro del frontend y redirige al Dashboard.",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    content:
      "Presenta un resumen ejecutivo con tarjetas de métricas clave, un gráfico de distribución general y un gráfico de oportunidades por mes. Es el punto de entrada al estado actual del negocio.",
  },
  {
    id: "clientes",
    title: "Clientes",
    content:
      "Este módulo administra la lista de clientes. Permite crear, editar y eliminar clientes, y ofrece una vista consolidada de información como nombre, correo, teléfono y tipo de cliente.",
  },
  {
    id: "leads",
    title: "Leads",
    content:
      "Aquí se gestionan los prospectos y oportunidades. Incluye campos de origen, etapa, responsable y seguimiento, y ayuda a convertir prospectos en clientes.",
  },
  {
    id: "contactos",
    title: "Contactos",
    content:
      "Permite llevar un registro de personas de contacto asociadas a empresas o clientes, con datos de correo, teléfono, cargo y compañía.",
  },
  {
    id: "companias",
    title: "Compañías",
    content:
      "Mantiene el catálogo de empresas relacionadas con los clientes y negociaciones. Es útil para agrupar clientes y contactos bajo una misma cuenta corporativa.",
  },
  {
    id: "productos",
    title: "Productos",
    content:
      "Gestión de catálogo de productos o servicios. Permite crear, editar y eliminar productos, y sus datos se utilizan en pedidos y cotizaciones.",
  },
  {
    id: "pedidos",
    title: "Pedidos",
    content:
      "Registro de órdenes de venta. Incluye información de cliente, producto, total, estado y fecha de envío para seguir el cumplimiento de las ventas.",
  },
  {
    id: "negociaciones",
    title: "Negociaciones",
    content:
      "Administra las oportunidades comerciales abiertas. Cuenta con etapas, montos estimados y clientes asociados, lo que facilita priorizar el pipeline.",
  },
  {
    id: "usuarios",
    title: "Usuarios",
    content:
      "Sección de administración de cuentas de usuario del CRM. Permite gestionar el personal que utiliza el sistema y sus datos de acceso.",
  },
  {
    id: "tareas",
    title: "Tareas",
    content:
      "Planificación y seguimiento de actividades internas. Cada tarea tiene título, asignado, prioridad, estado y fecha de vencimiento.",
  },
  {
    id: "cotizaciones",
    title: "Cotizaciones",
    content:
      "Registro y seguimiento de propuestas comerciales. Incluye referencia, cliente, monto, estado y responsable.",
  },
  {
    id: "reportes",
    title: "Reportes",
    content:
      "Panel de reportes con filtros por tipo y rango de fechas, métricas dinámicas, gráficos y exportación a CSV. Permite ver tendencias y análisis por secciones.",
  },
  {
    id: "analiticas",
    title: "Analíticas",
    content:
      "Módulo de analíticas comerciales que muestra ROI, ROA, conversiones, ticket promedio, y visualizaciones avanzadas como funnel, rendimiento por ejecutivo, mezcla de cartera y cumplimiento de metas.",
  },
  {
    id: "perfil",
    title: "Perfil",
    content:
      "Página personal del usuario autenticado. Muestra información básica y sirve como base para futuras mejoras de edición de perfil.",
  },
  {
    id: "configuracion",
    title: "Configuración",
    content:
      "Área para ajustar preferencias del CRM, notificaciones, idioma y otras opciones generales. En esta versión contiene parámetros básicos de configuración.",
  },
];

export default function Ayuda() {
  return (
    <div className="ayuda-page section-page">
      <div className="section-header">
        <div>
          <h1>Ayuda</h1>
          <p>Consulta este manual dentro del CRM para entender el propósito y uso de cada módulo.</p>
        </div>
      </div>

      <div className="ayuda-grid">
        <aside className="ayuda-sidebar glass">
          <h2>Índice</h2>
          <nav>
            {helpSections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="ayuda-link">
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="ayuda-content glass">
          {helpSections.map((section) => (
            <section key={section.id} id={section.id} className="ayuda-section">
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
