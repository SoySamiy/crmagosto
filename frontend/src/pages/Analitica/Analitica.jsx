import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getClientes } from "../../services/clientesService";
import { getPedidos } from "../../services/pedidosService";
import { getCotizaciones } from "../../services/cotizacionesService";
import "./Analitica.css";
import { getAnaliticaSettings, saveAnaliticaSettings } from "../../services/analiticaService";

export default function Analitica() {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({ clientes: [], pedidos: [], cotizaciones: [] });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetOverride, setBudgetOverride] = useState(() => window.localStorage.getItem("analitica:budget") || "");
  const [assetBaseOverride, setAssetBaseOverride] = useState(() => window.localStorage.getItem("analitica:assetBase") || "");

  async function load() {
    try {
      const [clientesRes, pedidosRes, cotizacionesRes] = await Promise.all([getClientes(), getPedidos(), getCotizaciones()]);
      setData({
        clientes: clientesRes.data || [],
        pedidos: pedidosRes.data || [],
        cotizaciones: cotizacionesRes.data || [],
      });
      // load server-side settings if available
      try {
        const settingsRes = await getAnaliticaSettings();
        if (settingsRes?.data) {
          const s = settingsRes.data || {};
          if (s.budget) setBudgetOverride(String(s.budget));
          if (s.assetBase) setAssetBaseOverride(String(s.assetBase));
        }
      } catch (err) {
        // ignore if backend not available
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleDownloadCsv = () => {
    const escapeValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [];

    rows.push(["Informe Analítico", ""]);
    rows.push(["Desde", startDate || "Todos"]);
    rows.push(["Hasta", endDate || "Todos"]);
    rows.push([]);
    rows.push(["Métrica", "Valor"]);
    rows.push(["ROI %", totals.ROI]);
    rows.push(["ROA %", totals.ROA]);
    rows.push(["Tratos ganados", totals.tratosGanados]);
    rows.push(["Pipeline activo", totals.pipelineValue]);
    rows.push(["Conversión %", `${totals.conversionRate}%`]);
    rows.push(["Ticket promedio", totals.ticketPromedio]);
    rows.push([]);
    rows.push(["Pedidos filtrados"]);
    rows.push(["Fecha", "Cliente", "Estado", "Total"]);
    totals.pedidosFiltered.forEach((pedido) => {
      rows.push([pedido.fechaPedido || "-", pedido.clienteNombre || "-", pedido.estado || "-", pedido.total || 0]);
    });
    rows.push([]);
    rows.push(["Cotizaciones filtradas"]);
    rows.push(["Fecha", "Cliente", "Estado", "Monto"]);
    totals.cotizacionesFiltered.forEach((cotizacion) => {
      rows.push([cotizacion.fechaCreacion || "-", cotizacion.clienteNombre || "-", cotizacion.estado || "-", cotizacion.monto || 0]);
    });

    const csv = rows.map((row) => row.map(escapeValue).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `analiticas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    // apply date filtering to pedidos and cotizaciones
    const parseISODate = (v) => (v ? new Date(v) : null);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const pedidosFiltered = data.pedidos.filter((p) => {
      if (!p.fechaPedido) return true;
      const d = parseISODate(p.fechaPedido);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > new Date(end).setHours(23, 59, 59, 999)) return false;
      return true;
    });

    const cotizacionesFiltered = data.cotizaciones.filter((c) => {
      if (!c.fechaCreacion) return true;
      const d = parseISODate(c.fechaCreacion);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > new Date(end).setHours(23, 59, 59, 999)) return false;
      return true;
    });

    const totalOrderValue = pedidosFiltered.reduce((s, p) => s + Number(p.total || 0), 0);
    const aprobadas = cotizacionesFiltered.filter((c) => c.estado === "aprobada");
    const tratosGanados = aprobadas.length;
    const pipelineValue = cotizacionesFiltered.reduce((s, c) => s + Number(c.monto || 0), 0);
    const conversionRate = cotizacionesFiltered.length ? Math.round((aprobadas.length / cotizacionesFiltered.length) * 100) : 0;
    const ticketPromedio = pedidosFiltered.length ? Math.round(totalOrderValue / pedidosFiltered.length) : 0;

    // Overrides: allow user-provided budget and asset base stored in localStorage
    const marketingBudgetEstimate = Number(budgetOverride) > 0 ? Number(budgetOverride) : Math.max(1, pipelineValue * 0.12);
    const ROI = Math.round(((totalOrderValue - marketingBudgetEstimate) / Math.max(1, marketingBudgetEstimate)) * 100);
    const activoBaseEstimate = Number(assetBaseOverride) > 0 ? Number(assetBaseOverride) : Math.max(1, data.clientes.length * 1000);
    const ROA = Math.round((totalOrderValue / Math.max(1, activoBaseEstimate)) * 100);

    return {
      totalOrderValue,
      tratosGanados,
      pipelineValue,
      conversionRate,
      ticketPromedio,
      ROI,
      ROA,
      pedidosFiltered,
      cotizacionesFiltered,
    };
  }, [data, startDate, endDate, budgetOverride, assetBaseOverride]);

  const sparkData = useMemo(() => {
    // Build a six-month series computing ROI and ROA per month
    const monthsCount = 6;
    const now = new Date();
    const months = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }

    function monthLabel(d) {
      return d.toLocaleString("es-MX", { month: "short" });
    }

    const monthly = months.map((mDate) => {
      const year = mDate.getFullYear();
      const month = mDate.getMonth();

      const pedidosMonth = data.pedidos.filter((p) => {
        if (!p.fechaPedido) return false;
        const pd = new Date(p.fechaPedido);
        return pd.getFullYear() === year && pd.getMonth() === month;
      });

      const cotMonth = data.cotizaciones.filter((c) => {
        if (!c.fechaCreacion) return false;
        const cd = new Date(c.fechaCreacion);
        return cd.getFullYear() === year && cd.getMonth() === month;
      });

      const totalOrderValue = pedidosMonth.reduce((s, p) => s + Number(p.total || 0), 0);
      const pipelineValue = cotMonth.reduce((s, c) => s + Number(c.monto || 0), 0);

      const marketingBudget = Number(budgetOverride) > 0 ? Number(budgetOverride) / months.length : Math.max(1, pipelineValue * 0.12);
      const ROI = Math.round(((totalOrderValue - marketingBudget) / Math.max(1, marketingBudget)) * 100);

      const activoBase = Number(assetBaseOverride) > 0 ? Number(assetBaseOverride) / months.length : Math.max(1, data.clientes.length * 1000);
      const ROA = Math.round((totalOrderValue / Math.max(1, activoBase)) * 100);

      return { mes: monthLabel(mDate), ROI: isFinite(ROI) ? ROI : 0, ROA: isFinite(ROA) ? ROA : 0 };
    });

    return monthly;
  }, [data, budgetOverride, assetBaseOverride]);

  return (
    <div className="analitica-page">
      <div className="analitica-hero">
        <div>
          <h1>Analíticas & Inteligencia Comercial</h1>
          <p>Métricas clave: ROI, ROA, conversión y ticket promedio.</p>
        </div>
        <div className="analitica-controls">
          <label>
            Desde
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            Hasta
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <button className="btn-primary" onClick={handleDownloadCsv}>Descargar CSV</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card settings">
          <span className="kpi-label">Ajustes</span>
          <div className="settings-row">
            <label>Presupuesto comercial
              <input type="number" value={budgetOverride} onChange={(e) => setBudgetOverride(e.target.value)} placeholder="0" />
            </label>
            <label>Base de activos
              <input type="number" value={assetBaseOverride} onChange={(e) => setAssetBaseOverride(e.target.value)} placeholder="0" />
            </label>
          </div>
          <div className="settings-actions">
            <button className="btn-secondary" onClick={() => { setBudgetOverride(""); setAssetBaseOverride(""); }}>Reset</button>
            <button className="btn-primary" onClick={async () => {
              const payload = { budget: Number(budgetOverride) || null, assetBase: Number(assetBaseOverride) || null };
              window.localStorage.setItem("analitica:budget", budgetOverride);
              window.localStorage.setItem("analitica:assetBase", assetBaseOverride);
              try {
                await saveAnaliticaSettings(payload);
              } catch (err) {
                console.warn("No se pudo guardar en backend, datos almacenados en localStorage.", err);
              }
            }}>Guardar</button>
          </div>
        </div>
        <div className="kpi-card big">
          <span className="kpi-label">% ROI COMERCIAL</span>
          <strong className="kpi-value">{totals.ROI}%</strong>
          <small>Retorno sobre Inversión</small>
        </div>

        <div className="kpi-card big">
          <span className="kpi-label">% ROA OPERATIVO</span>
          <strong className="kpi-value">{totals.ROA}%</strong>
          <small>Retorno sobre Activos</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">TRATOS GANADOS</span>
          <strong className="kpi-value green">${totals.tratosGanados.toLocaleString("es-MX")}</strong>
          <small>Cierres confirmados</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">PIPELINE ACTIVO</span>
          <strong className="kpi-value blue">${Number(totals.pipelineValue || 0).toLocaleString("es-MX")}</strong>
          <small>En proceso de negociación</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">CONVERSIÓN</span>
          <strong className="kpi-value">{totals.conversionRate}%</strong>
          <small>Oportunidades a contratos</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">TICKET PROMEDIO</span>
          <strong className="kpi-value orange">${Number(totals.ticketPromedio || 0).toLocaleString("es-MX")}</strong>
          <small>Por contrato cerrado</small>
        </div>
      </div>

      <div className="analitica-detail">
        <div className="explain glass">
          <h3>Desglose financiero ROI / ROA</h3>
          <p>
            El ROI es una estimación basada en el valor total de pedidos frente a una estimación del presupuesto comercial. El ROA aproxima la eficiencia usando el valor promedio por cliente.
          </p>
        </div>

        <div className="trend glass">
          <h3>Evolución Semestral de Ventas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sparkData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 260]} ticks={[0, 65, 130, 195, 260]} />
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              <Legend verticalAlign="top" align="right" />
              <Line type="monotone" dataKey="ROI" name="ROI (%)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="ROA" name="ROA (%)" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button className="btn-secondary formulas-btn" onClick={() => setShowModal(true)}>Ver Fórmulas & Desglose</button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3>Fórmulas y Desglose</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <h4>ROI (Retorno sobre Inversión)</h4>
              <p>ROI (%) = ((Ingresos atribuibles - Inversión en marketing) / Inversión en marketing) × 100</p>
              <p>Donde <em>Ingresos atribuibles</em> se considera la suma de pedidos en el periodo filtrado y la <em>Inversión en marketing</em> puede ser estimada o provista en ajustes.</p>

              <h4>ROA (Retorno sobre Activos)</h4>
              <p>ROA (%) = (Ingresos atribuibles / Base de activos) × 100</p>
              <p>La <em>Base de activos</em> puede ser el valor contable aproximado de activos relevantes o una estimación basada en clientes × factor; puedes ajustar este valor en Ajustes.</p>

              <h4>Notas</h4>
              <ul>
                <li>Los cálculos son aproximados y dependen de la calidad de los datos en `clientes`, `pedidos` y `cotizaciones`.</li>
                <li>Usar los campos de ajuste para proporcionar valores más reales y persistirlos en localStorage con el botón Guardar.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="analytics-grid">
        <div className="chart-card glass" data-aos="fade-up">
          <h3>Funnel de Conversión (Embudo)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={getFunnelData(data)} margin={{ left: 16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass" data-aos="fade-up">
          <h3>Rendimiento por Ejecutivo de Ventas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getRepPerformance(data)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `$${Number(v).toLocaleString("es-MX")}`} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString("es-MX")}`} />
              <Bar dataKey="sales" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass" data-aos="fade-up">
          <h3>Mezcla de Cartera: Física vs Moral</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={getMixData(data)} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} label={false}>
                {getMixData(data).map((entry, idx) => (
                  <Cell key={entry.name} fill={idx === 0 ? "#2563eb" : "#38bdf8"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => Number(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass" data-aos="fade-up">
          <h3>Cumplimiento de Metas Trimestrales</h3>
          <div className="goal-item">
            <span>Meta de Facturación Q3 ($2.5M)</span>
            <div className="goal-track"><div className="goal-fill" style={{ width: `${getGoalProgress(data, "facturacion")}%` }} /></div>
            <strong className="goal-value">{getGoalProgress(data, "facturacion")}%</strong>
          </div>
          <div className="goal-item">
            <span>Adquisición Nuevas Personas Morales (15)</span>
            <div className="goal-track"><div className="goal-fill blue" style={{ width: `${getGoalProgress(data, "adquisicion")}%` }} /></div>
            <strong className="goal-value">{getGoalProgress(data, "adquisicion")}%</strong>
          </div>
          <div className="goal-item">
            <span>Retención de Clientes Activos (95%)</span>
            <div className="goal-track"><div className="goal-fill green" style={{ width: `${getGoalProgress(data, "retencion")}%` }} /></div>
            <strong className="goal-value">{getGoalProgress(data, "retencion")}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers to compute chart data
function getFunnelData(data) {
  const stages = ["prospecto", "contactado", "propuesta", "negociacion", "ganada"];
  const labels = ["Prospecto", "Contactado", "Propuesta", "Negociación", "Ganada"];
  return stages.map((s, i) => ({ stage: labels[i], value: data.clientes.filter((c) => (c.etapa || "").toLowerCase().includes(s)).length }));
}

function getRepPerformance(data) {
  // group orders by asignadoA from clientes; sum pedidos totals per assigned
  const byRep = {};
  const clienteByName = {};
  data.clientes.forEach((c) => { clienteByName[c.nombre] = c.asignadoA || "Sin asignar"; });
  data.pedidos.forEach((p) => {
    const rep = clienteByName[p.clienteNombre] || "Sin asignar";
    byRep[rep] = (byRep[rep] || 0) + Number(p.total || 0);
  });
  return Object.keys(byRep).map((k) => ({ name: k, sales: byRep[k] }));
}

function getMixData(data) {
  const fisica = data.clientes.filter((c) => (c.tipoPersona || c.tipo_persona || "").toString().toLowerCase().includes("fisica")).length;
  const moral = data.clientes.filter((c) => (c.tipoPersona || c.tipo_persona || "").toString().toLowerCase().includes("moral")).length;
  return [ { name: "Personas Físicas", value: fisica }, { name: "Personas Morales", value: moral } ];
}

function getGoalProgress(data, key) {
  // crude approximations
  if (key === "facturacion") {
    const total = data.pedidos.reduce((s, p) => s + Number(p.total || 0), 0);
    const goal = 2500000;
    return Math.min(100, Math.round((total / goal) * 100));
  }
  if (key === "adquisicion") {
    const acquired = data.clientes.filter((c) => (c.tipoPersona || "").toLowerCase().includes("moral") && new Date(c.creadoEl || c.creado_at || 0) > new Date(Date.now() - 90*24*3600*1000)).length;
    const goal = 15;
    return Math.min(100, Math.round((acquired / goal) * 100));
  }
  if (key === "retencion") {
    // percent of active clients vs total
    const totalClients = data.clientes.length || 1;
    const active = data.clientes.filter((c) => (c.etapa || "").toLowerCase().includes("fidel") || (c.etapa || "").toLowerCase() === "cliente").length;
    return Math.min(100, Math.round((active / totalClients) * 100));
  }
  return 0;
}
