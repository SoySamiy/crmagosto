import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Clientes from "../pages/Clientes/Clientes";
import NuevoCliente from "../pages/Clientes/NuevoCliente";
import EditarCliente from "../pages/Clientes/EditarCliente";
import Leads from "../pages/Leads/Leads";
import Contactos from "../pages/Contactos/Contactos";
import Companias from "../pages/Companias/Companias";
import Productos from "../pages/Productos/Productos";
import Pedidos from "../pages/Pedidos/Pedidos";
import Negociaciones from "../pages/Negociaciones/Negociaciones";
import Perfil from "../pages/Perfil/Perfil";
import Configuracion from "../pages/Configuracion/Configuracion";
import Usuarios from "../pages/Usuarios/Usuarios";
import Tareas from "../pages/Tareas/Tareas";
import Cotizaciones from "../pages/Cotizaciones/Cotizaciones";
import Reportes from "../pages/Reportes/Reportes";
import Ayuda from "../pages/Ayuda/Ayuda";
import Analitica from "../pages/Analitica/Analitica";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/nuevo" element={<NuevoCliente />} />
        <Route path="clientes/:id/editar" element={<EditarCliente />} />
        <Route path="clientes/:personaTipo" element={<Clientes />} />
        <Route path="leads" element={<Leads />} />
        <Route path="contactos" element={<Contactos />} />
        <Route path="contactos/:personaTipo" element={<Contactos />} />
        <Route path="companias" element={<Companias />} />
        <Route path="productos" element={<Productos />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="negociaciones" element={<Negociaciones />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="cotizaciones" element={<Cotizaciones />} />
        <Route path="analitica" element={<Analitica />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="ayuda" element={<Ayuda />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  );
}
