import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getClientes } from "../../services/clientesService";
import { TIPOS_CLIENTE, getEtapasDeTipo, getTipoLabel, getEtapaLabel } from "./clienteConstants";
import "./Clientes.css";

const PERSONA_FILTROS = {
  fisicas: { valor: "fisica", titulo: "Personas fisicas" },
  morales: { valor: "moral", titulo: "Personas morales" },
};

function PersonaBadge({ tipoPersona }) {
  return (
    <span className={`badge badge-persona-${tipoPersona}`}>
      {tipoPersona === "moral" ? "Persona moral" : "Persona fisica"}
    </span>
  );
}

function TipoBadge({ tipo }) {
  return <span className={`badge badge-tipo-${tipo}`}>{getTipoLabel(tipo)}</span>;
}

function EtapaBadge({ tipo, etapa }) {
  return <span className={`badge badge-etapa-${etapa}`}>{getEtapaLabel(tipo, etapa)}</span>;
}

function formatFecha(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatValor(valor) {
  const numero = Number(valor) || 0;
  return numero.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default function Clientes({ tipoForzado, tituloPagina, tituloBoton }) {
  const { personaTipo } = useParams();
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState(tipoForzado || "todos");
  const [etapaFiltro, setEtapaFiltro] = useState("todas");

  useEffect(() => {
    getClientes()
      .then((res) => setClientes(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const personaSeleccionada = PERSONA_FILTROS[personaTipo]?.valor;
  const mostrarColumnaTipo = !tipoForzado;
  const etapasDisponibles = tipoFiltro !== "todos" ? getEtapasDeTipo(tipoFiltro) : [];

  function seleccionarTipo(valor) {
    setTipoFiltro(valor);
    setEtapaFiltro("todas");
  }

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const coincidePersona = !personaSeleccionada || cliente.tipoPersona === personaSeleccionada;
      const coincideTipo = tipoFiltro === "todos" || cliente.tipo === tipoFiltro;
      const coincideEtapa = etapaFiltro === "todas" || cliente.etapa === etapaFiltro;
      return coincidePersona && coincideTipo && coincideEtapa;
    });
  }, [clientes, personaSeleccionada, tipoFiltro, etapaFiltro]);

  const titulo =
    tituloPagina || (PERSONA_FILTROS[personaTipo] ? `Clientes - ${PERSONA_FILTROS[personaTipo].titulo}` : "Clientes");

  return (
    <div>
      <div className="page-header" data-aos="fade-up">
        <h1>{titulo}</h1>
        <Link to="/clientes/nuevo" className="btn-primary">
          <span className="material-symbols-outlined">add</span>
          {tituloBoton || "Nuevo cliente"}
        </Link>
      </div>
      {error && <p className="error">No se pudo conectar con el backend: {error}</p>}

      {!tipoForzado && (
        <div className="filter-tabs" data-aos="fade-up" data-aos-delay="50">
          <button
            type="button"
            className={`filter-tab ${tipoFiltro === "todos" ? "active" : ""}`}
            onClick={() => seleccionarTipo("todos")}
          >
            Todos
          </button>
          {TIPOS_CLIENTE.map((tipo) => (
            <button
              key={tipo.valor}
              type="button"
              className={`filter-tab ${tipoFiltro === tipo.valor ? "active" : ""}`}
              onClick={() => seleccionarTipo(tipo.valor)}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      )}

      {etapasDisponibles.length > 0 && (
        <div className="filter-tabs secondary" data-aos="fade-up" data-aos-delay="75">
          <button
            type="button"
            className={`filter-tab ${etapaFiltro === "todas" ? "active" : ""}`}
            onClick={() => setEtapaFiltro("todas")}
          >
            Todas las etapas
          </button>
          {etapasDisponibles.map((etapa) => (
            <button
              key={etapa.valor}
              type="button"
              className={`filter-tab ${etapaFiltro === etapa.valor ? "active" : ""}`}
              onClick={() => setEtapaFiltro(etapa.valor)}
            >
              {etapa.label}
            </button>
          ))}
        </div>
      )}

      <div className="table-scroll">
        <table className="data-table glass" data-aos="fade-up" data-aos-delay="100">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Tipo persona</th>
              {mostrarColumnaTipo && <th>Tipo</th>}
              <th>Etapa</th>
              <th>Origen</th>
              <th>Valor</th>
              <th>Asignado a</th>
              <th>Creado el</th>
              <th>Ultimo contacto</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.tipoPersona && <PersonaBadge tipoPersona={cliente.tipoPersona} />}</td>
                {mostrarColumnaTipo && <td>{cliente.tipo && <TipoBadge tipo={cliente.tipo} />}</td>}
                <td>{cliente.etapa && <EtapaBadge tipo={cliente.tipo} etapa={cliente.etapa} />}</td>
                <td>{cliente.origen || "-"}</td>
                <td>{formatValor(cliente.valor)}</td>
                <td>{cliente.asignadoA || "-"}</td>
                <td>{formatFecha(cliente.creadoEl)}</td>
                <td>{formatFecha(cliente.ultimoContacto)}</td>
                <td>
                  <Link to={`/clientes/${cliente.id}/editar`} className="btn-icon" title="Editar cliente">
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
