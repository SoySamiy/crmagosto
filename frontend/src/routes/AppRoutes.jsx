import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Clientes from "../pages/Clientes/Clientes";
import NuevoCliente from "../pages/Clientes/NuevoCliente";
import EditarCliente from "../pages/Clientes/EditarCliente";
import Leads from "../pages/Leads/Leads";
import Contactos from "../pages/Contactos/Contactos";
import Perfil from "../pages/Perfil/Perfil";
import Configuracion from "../pages/Configuracion/Configuracion";

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
        <Route path="perfil" element={<Perfil />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  );
}
