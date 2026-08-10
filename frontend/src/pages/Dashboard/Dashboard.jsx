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
    oportunidades: 6,
    seguimiento: 0,
    propuesta: 0,
    cerrados: 0,
    pipelineValue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  function loadDashboardData() {
    Promise.all([getClientes(), getContactos()])
      .then(([clientesRes, contactosRes]) => {
        const registros = clientesRes.data || [];
        const leads = registros.filter((c) => c.tipo === "prospecto");
        const clientes = registros.filter((c) => c.tipo === "cliente" || c.tipo === "cliente_frecuente");
        const contactos = contactosRes.data || [];
        const pipelineValue = registros.reduce((sum, item) => sum + Number(item.valor || 0), 0);

        setCounts({
          clientes: clientes.length,
          leads: leads.length,
          contactos: contactos.length,
          oportunidades: Math.max(6, leads.length + clientes.length),
          seguimiento: leads.filter((c) => c.etapa === "seguimiento").length,
          propuesta: leads.filter((c) => c.etapa === "propuesta").length,
          cerrados: leads.filter((c) => c.etapa === "cerrado").length,
          pipelineValue,
        });

        const activity = [
          ...contactos.slice(0, 3).map((contact) => ({ label: `${contact.nombre} • ${contact.departamento || "Contacto"}`, detail: contact.email || "Sin correo", tone: "contact" })),
          ...leads.slice(0, 2).map((lead) => ({ label: `${lead.nombre} • ${lead.etapa || "contacto_inicial"}`, detail: lead.origen || "Sin origen", tone: "lead" })),
        ];
        setRecentActivity(activity.slice(0, 5));
      })
      .catch(() => {});
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
    { key: "oportunidades", label: "Oportunidades", icon: "trending_up", subtitle: "Pipeline mensual" },
  ];

  const pieData = cards.map((card) => ({ name: card.label, value: counts[card.key] }));

  const kpis = useMemo(() => [
    { label: "Leads en seguimiento", value: counts.seguimiento, tone: "info" },
    { label: "Propuestas en curso", value: counts.propuesta, tone: "warning" },
    { label: "Cerrados este ciclo", value: counts.cerrados, tone: "success" },
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
