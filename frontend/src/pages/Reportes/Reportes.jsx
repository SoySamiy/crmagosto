import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { getClientes } from "../../services/clientesService";
import { getContactos } from "../../services/contactosService";
import { getCompanias } from "../../services/companiasService";
import { getProductos } from "../../services/productosService";
import { getPedidos } from "../../services/pedidosService";
import { getNegociaciones } from "../../services/negociacionesService";
import { getTareas } from "../../services/tareasService";
import { getCotizaciones } from "../../services/cotizacionesService";
import "../../styles/SectionPage.css";

const REPORT_TYPES = [
  { value: "todos", label: "Resumen general" },
  { value: "pedidos", label: "Pedidos" },
  { value: "tareas", label: "Tareas" },
  { value: "cotizaciones", label: "Cotizaciones" },
];

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isInRange(fecha, startDate, endDate) {
  if (!fecha) return true;
  const itemDate = new Date(fecha);
  if (startDate && itemDate < startDate) return false;
  if (endDate && itemDate > endDate) return false;
  return true;
}

const CHART_COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#60a5fa"];

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildTimeSeriesData(items, dateKey, valueKey) {
  const series = items.reduce((acc, item) => {
    const date = new Date(item[dateKey]);
    if (Number.isNaN(date.getTime())) return acc;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;
    const label = date.toLocaleDateString("es-MX", { month: "short", year: "numeric" });

    if (!acc[key]) {
      acc[key] = { periodo: key, label, cantidad: 0, valor: 0 };
    }

    acc[key].cantidad += 1;
    acc[key].valor += Number(item[valueKey] || 0);
    return acc;
  }, {});

  return Object.values(series).sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export default function Reportes() {
  const [counts, setCounts] = useState({});
  const [pedidos, setPedidos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getClientes(),
      getContactos(),
      getCompanias(),
      getProductos(),
      getPedidos(),
      getNegociaciones(),
      getTareas(),
      getCotizaciones(),
    ])
      .then(([
        clientesRes,
        contactosRes,
        companiasRes,
        productosRes,
        pedidosRes,
        negociacionesRes,
        tareasRes,
        cotizacionesRes,
      ]) => {
        const clientes = clientesRes.data || [];
        const contactos = contactosRes.data || [];
        const companias = companiasRes.data || [];
        const productos = productosRes.data || [];
        const pedidosData = pedidosRes.data || [];
        const negociaciones = negociacionesRes.data || [];
        const tareasData = tareasRes.data || [];
        const cotizacionesData = cotizacionesRes.data || [];

        setCounts({
          clientes: clientes.length,
          contactos: contactos.length,
          companias: companias.length,
          productos: productos.length,
          pedidos: pedidosData.length,
          negociaciones: negociaciones.length,
          tareas: tareasData.length,
          cotizaciones: cotizacionesData.length,
        });

        setPedidos(pedidosData);
        setTareas(tareasData);
        setCotizaciones(cotizacionesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const startDateValue = useMemo(() => parseDate(startDate), [startDate]);
  const endDateValue = useMemo(() => parseDate(endDate), [endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      setDateError(start && end && start > end ? "El rango de fechas no es válido." : "");
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  function handleResetFilters() {
    setStartDate("");
    setEndDate("");
    setDateError("");
  }

  function handleExportCsv() {
    const csvContent = buildCsvContent();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const filteredPedidos = useMemo(
    () => pedidos.filter((item) => isInRange(item.fechaPedido, startDateValue, endDateValue)),
    [pedidos, startDateValue, endDateValue]
  );

  const filteredTareas = useMemo(
    () => tareas.filter((item) => isInRange(item.fechaVencimiento, startDateValue, endDateValue)),
    [tareas, startDateValue, endDateValue]
  );

  const filteredCotizaciones = useMemo(
    () => cotizaciones.filter((item) => isInRange(item.fechaCreacion, startDateValue, endDateValue)),
    [cotizaciones, startDateValue, endDateValue]
  );

  const totalValorPedidos = useMemo(
    () => filteredPedidos.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [filteredPedidos]
  );

  const totalValorCotizaciones = useMemo(
    () => filteredCotizaciones.reduce((sum, item) => sum + Number(item.monto || 0), 0),
    [filteredCotizaciones]
  );

  const chartData = useMemo(() => {
    if (reportType === "pedidos") {
      const labels = ["pendiente", "en proceso", "completado", "cancelado"];
      return labels.map((label) => ({
        name: toTitleCase(label),
        value: filteredPedidos.filter((item) => (item.estado || "").toLowerCase() === label).length,
      }));
    }

    if (reportType === "tareas") {
      const labels = ["pendiente", "en progreso", "completada"];
      return labels.map((label) => ({
        name: toTitleCase(label),
        value: filteredTareas.filter((item) => (item.estado || "").toLowerCase() === label).length,
      }));
    }

    if (reportType === "cotizaciones") {
      const labels = ["en revisión", "aprobada", "rechazada"];
      return labels.map((label) => ({
        name: toTitleCase(label),
        value: filteredCotizaciones.filter((item) => (item.estado || "").toLowerCase() === label).length,
      }));
    }

    return [
      { name: "Pedidos", value: filteredPedidos.length },
      { name: "Tareas", value: filteredTareas.length },
      { name: "Cotizaciones", value: filteredCotizaciones.length },
    ];
  }, [reportType, filteredPedidos, filteredTareas, filteredCotizaciones]);

  const timeSeriesData = useMemo(() => {
    if (reportType === "pedidos") {
      return buildTimeSeriesData(filteredPedidos, "fechaPedido", "total");
    }

    if (reportType === "cotizaciones") {
      return buildTimeSeriesData(filteredCotizaciones, "fechaCreacion", "monto");
    }

    return [];
  }, [reportType, filteredPedidos, filteredCotizaciones]);

  const summaryCards = useMemo(() => {
    if (reportType === "pedidos") {
      return [
        { label: "Pedidos totales", value: filteredPedidos.length },
        { label: "Completados", value: filteredPedidos.filter((item) => item.estado === "completado").length },
        { label: "Pendientes", value: filteredPedidos.filter((item) => item.estado === "pendiente" || item.estado === "en proceso").length },
        { label: "Valor total", value: `$${totalValorPedidos.toLocaleString("es-MX")}` },
      ];
    }

    if (reportType === "tareas") {
      return [
        { label: "Tareas totales", value: filteredTareas.length },
        { label: "Pendientes", value: filteredTareas.filter((item) => item.estado === "pendiente").length },
        { label: "En progreso", value: filteredTareas.filter((item) => item.estado === "en progreso").length },
        { label: "Completadas", value: filteredTareas.filter((item) => item.estado === "completada").length },
      ];
    }

    if (reportType === "cotizaciones") {
      return [
        { label: "Cotizaciones totales", value: filteredCotizaciones.length },
        { label: "En revisión", value: filteredCotizaciones.filter((item) => item.estado === "en revisión").length },
        { label: "Aprobadas", value: filteredCotizaciones.filter((item) => item.estado === "aprobada").length },
        { label: "Valor total", value: `$${totalValorCotizaciones.toLocaleString("es-MX")}` },
      ];
    }

    return [
      { label: "Pedidos", value: counts.pedidos || 0 },
      { label: "Tareas", value: counts.tareas || 0 },
      { label: "Cotizaciones", value: counts.cotizaciones || 0 },
      { label: "Clientes", value: counts.clientes || 0 },
      { label: "Contactos", value: counts.contactos || 0 },
      { label: "Compañías", value: counts.companias || 0 },
      { label: "Productos", value: counts.productos || 0 },
      { label: "Negociaciones", value: counts.negociaciones || 0 },
    ];
  }, [reportType, counts, filteredPedidos, filteredTareas, filteredCotizaciones, totalValorPedidos, totalValorCotizaciones]);

  const tableRows = useMemo(() => {
    if (reportType === "pedidos") return filteredPedidos;
    if (reportType === "tareas") return filteredTareas;
    if (reportType === "cotizaciones") return filteredCotizaciones;
    return [];
  }, [reportType, filteredPedidos, filteredTareas, filteredCotizaciones]);

  const tableHeaders = useMemo(() => {
    if (reportType === "pedidos") return ["ID", "Cliente", "Producto", "Total", "Estado", "Fecha", "Envío"];
    if (reportType === "tareas") return ["ID", "Título", "Asignado", "Estado", "Prioridad", "Vencimiento"];
    if (reportType === "cotizaciones") return ["ID", "Referencia", "Cliente", "Monto", "Estado", "Responsable", "Creación"];
    return ["Reporte", "Estado", "Valor"];
  }, [reportType]);

  function formatDate(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  }

  function escapeCsv(value) {
    const stringValue = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  function buildCsvContent() {
    const rows = [];
    if (reportType === "todos") {
      rows.push(["Métrica", "Valor"]);
      summaryCards.forEach((card) => rows.push([card.label, card.value]));
    } else {
      rows.push(tableHeaders);
      tableRows.forEach((item) => {
        if (reportType === "pedidos") {
          rows.push([
            item.id,
            item.clienteNombre || item.cliente || "-",
            item.productoNombre || item.productoId || "-",
            Number(item.total || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }),
            item.estado || "-",
            formatDate(item.fechaPedido),
            item.direccionEnvio || "-",
          ]);
        }
        if (reportType === "tareas") {
          rows.push([
            item.id,
            item.titulo || item.descripcion || "-",
            item.asignadoA || "-",
            item.estado || "-",
            item.prioridad || "-",
            formatDate(item.fechaVencimiento),
          ]);
        }
        if (reportType === "cotizaciones") {
          rows.push([
            item.id,
            item.referencia || "-",
            item.cliente || item.clienteNombre || "-",
            Number(item.monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }),
            item.estado || "-",
            item.responsable || "-",
            formatDate(item.fechaCreacion),
          ]);
        }
      });
    }

    return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  }

  function handleExportCsv() {
    const csvContent = buildCsvContent();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <div>
          <h1>Reportes</h1>
          <p>Genera métricas dinámicas filtradas por sección y rango de fechas.</p>
        </div>
      </div>

      <div className="section-toolbar">
        <label className="field-group compact">
          Tipo de reporte
          <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
            {REPORT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field-group compact">
          Desde
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>

        <label className="field-group compact">
          Hasta
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>

        <div className="toolbar-actions">
          <button type="button" className="table-action" onClick={handleResetFilters}>
            Limpiar filtros
          </button>
          <button type="button" className="table-action" onClick={handleExportCsv} disabled={Boolean(dateError)}>
            Exportar CSV
          </button>
        </div>
      </div>

      {error && <p className="error">Error cargando reportes: {error}</p>}
      {dateError && <p className="error">{dateError}</p>}
      {loading && <p>Cargando datos...</p>}

      <div className="section-summary">
        {summaryCards.map((card) => (
          <div key={card.label} className="summary-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="section-chart-grid">
        <div className="chart-panel">
          <h2>Visualización de reportes</h2>
          {chartData.length ? (
            reportType === "todos" ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={6}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Cantidad"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <p>No hay datos disponibles para este gráfico.</p>
          )}
        </div>
        {(reportType === "pedidos" || reportType === "cotizaciones") && (
          <div className="chart-panel">
            <h2>Tendencia mensual</h2>
            {timeSeriesData.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={timeSeriesData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" />
                  <XAxis dataKey="label" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString("es-MX"), reportType === "pedidos" ? "Total" : "Monto"]} />
                  <Line type="monotone" dataKey="valor" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No hay datos de tendencia para este periodo.</p>
            )}
          </div>
        )}
      </div>

      <div className="table-actions">
        <span>
          {reportType === "todos"
            ? "Visión general de métricas y estados operativos."
            : `Mostrando ${tableRows.length} registros filtrados por rango de fechas.`}
        </span>
        <button className="table-action" type="button" onClick={handleExportCsv}>
          Exportar CSV
        </button>
      </div>

      <div className="table-container">
        <table className="section-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportType === "todos" ? (
              [
                ...[{ type: "Pedidos", data: filteredPedidos, labels: ["Pendientes", "En proceso", "Completados", "Cancelados"] }],
                ...[{ type: "Tareas", data: filteredTareas, labels: ["Pendientes", "En progreso", "Completadas"] }],
                ...[{ type: "Cotizaciones", data: filteredCotizaciones, labels: ["En revisión", "Aprobadas", "Rechazadas"] }],
              ].flatMap((group) =>
                group.labels.map((label) => (
                  <tr key={`${group.type}-${label}`}>
                    <td>{group.type}</td>
                    <td>{label}</td>
                    <td>
                      {group.data.filter((item) => item.estado === label.toLowerCase().replace(" ", " ")).length}
                    </td>
                  </tr>
                ))
              )
            ) : reportType === "pedidos" ? (
              filteredPedidos.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.clienteNombre}</td>
                  <td>{item.productoNombre || item.productoId}</td>
                  <td>{Number(item.total || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}</td>
                  <td>{item.estado || "-"}</td>
                  <td>{formatDate(item.fechaPedido)}</td>
                  <td>{item.direccionEnvio || "-"}</td>
                </tr>
              ))
            ) : reportType === "tareas" ? (
              filteredTareas.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.titulo}</td>
                  <td>{item.asignadoA || "-"}</td>
                  <td>{item.estado || "-"}</td>
                  <td>{item.prioridad || "-"}</td>
                  <td>{formatDate(item.fechaVencimiento)}</td>
                </tr>
              ))
            ) : reportType === "cotizaciones" ? (
              filteredCotizaciones.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.referencia}</td>
                  <td>{item.cliente}</td>
                  <td>{Number(item.monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}</td>
                  <td>{item.estado || "-"}</td>
                  <td>{item.responsable || "-"}</td>
                  <td>{formatDate(item.fechaCreacion)}</td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
