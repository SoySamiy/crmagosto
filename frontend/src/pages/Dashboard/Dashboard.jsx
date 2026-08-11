import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { getClientes } from "../../services/clientesService";
import { getContactos } from "../../services/contactosService";
import { getCompanias } from "../../services/companiasService";
import { getProductos } from "../../services/productosService";
import { getPedidos } from "../../services/pedidosService";
import { getNegociaciones } from "../../services/negociacionesService";
import { getTareas } from "../../services/tareasService";
import { getCotizaciones } from "../../services/cotizacionesService";
import "./Dashboard.css";

const PIE_COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24"];

const BAR_DATA = [
  { mes: "Ene", oportunidades: 8 },
  { mes: "Feb", oportunidades: 12 },
  { mes: "Mar", oportunidades: 7 },
  { mes: "Abr", oportunidades: 15 },
  { mes: "May", oportunidades: 11 },
  { mes: "Jun", oportunidades: 18 },
];

const PROGRESS_ITEMS = [
  { label: "Seguimiento activo", value: 72, color: "#38bdf8" },
  { label: "Propuestas enviadas", value: 45, color: "#fbbf24" },
  { label: "Cierres logrados", value: 58, color: "#34d399" },
];

const DATA_REFRESH_EVENT = "crm-data-refresh";
const DATA_REFRESH_STORAGE_KEY = "crm-data-refresh";

function ProgressBar({ label, value, color }) {
  return (
    <div className="progress-item">
      <div className="progress-item-header">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [counts, setCounts] = useState({
    clientes: 0,
    leads: 0,
    contactos: 0,
    companias: 0,
    productos: 0,
    pedidos: 0,
    negociaciones: 0,
    tareas: 0,
    cotizaciones: 0,
    oportunidades: 6,
    seguimiento: 0,
    propuesta: 0,
    cerrados: 0,
    pipelineValue: 0,
    totalOrderValue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  async function loadDashboardData() {
    try {
      const [clientesRes, contactosRes, companiasRes, productosRes, pedidosRes, negociacionesRes, tareasRes, cotizacionesRes] = await Promise.all([
        getClientes(),
        getContactos(),
        getCompanias(),
        getProductos(),
        getPedidos(),
        getNegociaciones(),
        getTareas(),
        getCotizaciones(),
      ]);

      const registros = clientesRes.data || [];
      const leads = registros.filter((c) => c.tipo === "prospecto");
      const clientes = registros.filter((c) => c.tipo === "cliente" || c.tipo === "cliente_frecuente");
      const contactos = contactosRes.data || [];
      const companias = companiasRes.data || [];
      const productos = productosRes.data || [];
      const pedidos = pedidosRes.data || [];
      const negociaciones = negociacionesRes.data || [];
      const tareas = tareasRes.data || [];
      const cotizaciones = cotizacionesRes.data || [];

      const pipelineValue = registros.reduce((sum, item) => sum + Number(item.valor || 0), 0);
      const totalOrderValue = pedidos.reduce((sum, item) => sum + Number(item.total || 0), 0);
      const ventasPendientes = pedidos.filter((item) => item.estado !== "completado").length;
      const tareasUrgentes = tareas.filter((item) => item.prioridad?.toLowerCase() === "alta").length;
      const cotizacionesEnRevision = cotizaciones.filter((item) => item.estado === "en revisión").length;
      const conversionRate = leads.length
        ? Math.round((leads.filter((c) => c.etapa === "cerrado").length / leads.length) * 100)
        : 0;
      const averageOrderValue = pedidos.length ? totalOrderValue / pedidos.length : 0;

      setCounts({
        clientes: clientes.length,
        leads: leads.length,
        contactos: contactos.length,
        companias: companias.length,
        productos: productos.length,
        pedidos: pedidos.length,
        negociaciones: negociaciones.length,
        tareas: tareas.length,
        cotizaciones: cotizaciones.length,
        oportunidades: Math.max(6, leads.length + clientes.length),
        seguimiento: leads.filter((c) => c.etapa === "seguimiento").length,
        propuesta: leads.filter((c) => c.etapa === "propuesta").length,
        cerrados: leads.filter((c) => c.etapa === "cerrado").length,
        pipelineValue,
        totalOrderValue,
        ventasPendientes,
        tareasUrgentes,
        cotizacionesEnRevision,
        conversionRate,
        averageOrderValue,
      });

      const activity = [
        ...contactos.slice(0, 2).map((contact) => ({ label: `${contact.nombre} • ${contact.departamento || "Contacto"}`, detail: contact.email || "Sin correo", tone: "contact" })),
        ...leads.slice(0, 2).map((lead) => ({ label: `${lead.nombre} • ${lead.etapa || "contacto_inicial"}`, detail: lead.origen || "Sin origen", tone: "lead" })),
        ...negociaciones.slice(0, 1).map((neg) => ({ label: `${neg.nombre} • ${neg.clienteNombre || "Cliente"}`, detail: `Etapa: ${neg.etapa || "-"}`, tone: "negociacion" })),
      ];
      setRecentActivity(activity.slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadDashboardData();
    const handleRefresh = () => loadDashboardData();
    window.addEventListener(DATA_REFRESH_EVENT, handleRefresh);
    window.addEventListener("storage", (event) => {
      if (event.key === DATA_REFRESH_STORAGE_KEY) handleRefresh();
    });

    return () => {
      window.removeEventListener(DATA_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  const cards = [
    { key: "clientes", label: "Clientes", icon: "group", subtitle: "Relacionados con ventas" },
    { key: "leads", label: "Leads", icon: "person_add", subtitle: "Oportunidades activas" },
    { key: "contactos", label: "Contactos", icon: "contacts", subtitle: "Seguimiento de personas" },
    { key: "companias", label: "Compañías", icon: "business", subtitle: "Cuentas clave" },
    { key: "productos", label: "Productos", icon: "inventory_2", subtitle: "Catálogo disponible" },
    { key: "pedidos", label: "Pedidos", icon: "receipt_long", subtitle: "Órdenes registradas" },
    { key: "negociaciones", label: "Negociaciones", icon: "handshake", subtitle: "Oportunidades abiertas" },
    { key: "tareas", label: "Tareas", icon: "task", subtitle: "Actividades programadas" },
    { key: "cotizaciones", label: "Cotizaciones", icon: "description", subtitle: "Propuestas comerciales" },
    { key: "cotizacionesEnRevision", label: "Cotizaciones en revisión", icon: "hourglass_top", subtitle: "Aprobaciones pendientes" },
    { key: "pedidosPendientes", label: "Pedidos pendientes", icon: "pending", subtitle: "Órdenes por cerrar" },
    { key: "tareasUrgentes", label: "Tareas urgentes", icon: "priority_high", subtitle: "Prioridad alta" },
  ];

  const pieData = cards.map((card) => ({ name: card.label, value: counts[card.key] }));

  const kpis = useMemo(() => [
    { label: "Leads en seguimiento", value: counts.seguimiento, tone: "info" },
    { label: "Propuestas en curso", value: counts.propuesta, tone: "warning" },
    { label: "Negociaciones activas", value: counts.negociaciones, tone: "success" },
    { label: "Pedidos pendientes", value: counts.ventasPendientes, tone: "info" },
    { label: "Ratio de cierre", value: `${counts.conversionRate}%`, tone: "success" },
    { label: "Valor promedio pedido", value: `$${Number(counts.averageOrderValue || 0).toLocaleString("es-MX")}`, tone: "info" },
  ], [counts]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero" data-aos="fade-up">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen ejecutivo del estado del CRM y su relación con clientes, leads y contactos.</p>
        </div>
        <div className="hero-pill">Pipeline saludable</div>
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={card.key} className="card stat-card glass" data-aos="fade-up" data-aos-delay={(index + 1) * 100}>
            <span className="material-symbols-outlined stat-icon">{card.icon}</span>
            <div>
              <h3>{card.label}</h3>
              <p>{counts[card.key]}</p>
              <small>{card.subtitle}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="kpi-strip">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`kpi-card ${kpi.tone}`}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </div>
        ))}
        <div className="kpi-card info">
          <span>Valor en pipeline</span>
          <strong>${Number(counts.pipelineValue || 0).toLocaleString("es-MX")}</strong>
        </div>
        <div className="kpi-card success">
          <span>Valor de pedidos</span>
          <strong>${Number(counts.totalOrderValue || 0).toLocaleString("es-MX")}</strong>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="charts-section">
          <div className="chart-card glass" data-aos="fade-up">
            <h3>Distribución general</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card glass" data-aos="fade-up" data-aos-delay="100">
            <h3>Oportunidades por mes</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={BAR_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                <XAxis dataKey="mes" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip />
                <Bar dataKey="oportunidades" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="side-panel-stack">
          <div className="progress-panel glass" data-aos="fade-up" data-aos-delay="200">
            <h3>Resumen del flujo</h3>
            {PROGRESS_ITEMS.map((item) => (
              <ProgressBar key={item.label} {...item} />
            ))}
          </div>

          <div className="activity-panel glass" data-aos="fade-up" data-aos-delay="250">
            <h3>Actividad reciente</h3>
            <div className="activity-list">
              {recentActivity.map((item, index) => (
                <div key={`${item.label}-${index}`} className={`activity-item ${item.tone}`}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
