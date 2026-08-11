# CRM 2.0

Proyecto dividido en `frontend` (React + Vite + AOS) y `backend` (Node.js + Express).

## Estructura

```
CRM2.0/
├── frontend/        React + Vite, animaciones con AOS
│   └── src/
│       ├── components/
│       ├── pages/        Dashboard, Clientes, Leads, Contactos
│       ├── layouts/
│       ├── routes/
│       ├── services/     Llamadas a la API (axios)
│       ├── context/
│       ├── hooks/
│       └── styles/
└── backend/         API REST con Express
    └── src/
        ├── controllers/
        ├── routes/
        ├── models/        Datos en memoria (clientes, leads, contactos)
        ├── middlewares/
        ├── config/
        └── utils/
```

## Requisitos

- Node.js 18+

## Instalación

```bash
npm run install:all
```

## Desarrollo (frontend + backend juntos)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000 (endpoints bajo `/api`)

## Endpoints disponibles

- `GET/POST /api/clientes`, `GET/PUT/DELETE /api/clientes/:id`
- `GET/POST /api/leads`, `GET/PUT/DELETE /api/leads/:id`
- `GET/POST /api/contactos`, `GET/PUT/DELETE /api/contactos/:id`

Los datos del backend se almacenan en memoria; se reinician al reiniciar el servidor.

## Manual de usuario

Este CRM incluye varios módulos diseñados para cubrir todo el ciclo de ventas y la gestión de relaciones con clientes.

### Acceso / Login
- Página de acceso con correo y contraseña.
- El formulario valida la presencia de correo y contraseña y verifica que el correo tenga un formato básico con `@`.
- Incluye botones de SSO como Google y Azure AD, que en esta versión funcionan a modo de demostración.
- Al iniciar sesión, el usuario es redirigido al panel principal (`Dashboard`).

### Dashboard
- Resumen ejecutivo del CRM.
- Muestra tarjetas de estado clave para clientes, leads, contactos, compañías, productos, pedidos, negociaciones, tareas y cotizaciones.
- Incluye métricas de pipeline, propuestas en curso y pedidos pendientes.
- Provee gráficos para visualizar la distribución general de registros y una vista de oportunidades por mes.

### Clientes
- Permite ver la lista completa de clientes.
- Incluye acciones para crear, editar y eliminar clientes.
- El módulo puede diferenciar entre tipos de clientes y prospectos, con campos como nombre, correo, teléfono y segmento.
- Los productos o servicios asociados pueden vincularse desde la ficha de cliente según la configuración existente.

### Leads
- Gestiona oportunidades comerciales y prospectos.
- Permite registrar nuevos leads y actualizar su etapa dentro del embudo de ventas.
- Incluye campos para origen, estado, responsable y fecha de seguimiento.
- Ideal para hacer seguimiento de contactos antes de que se conviertan en clientes.

### Contactos
- Lista de personas de contacto vinculadas a compañías o clientes.
- Permite registro, edición y eliminación de contactos.
- Incluye información de correo, teléfono, cargo y compañía.
- Útil para mantener una base de datos de comunicaciones y referencias clave.

### Compañías
- Mantiene el catálogo de empresas asociadas al CRM.
- Cada compañía puede contener datos como nombre, industria, ubicación y contactos principales.
- Se usa para agrupar clientes, leads y contactos bajo una misma cuenta corporativa.

### Productos
- Catálogo de productos o servicios gestionados por el CRM.
- Permite agregar, editar y eliminar ítems del inventario comercial.
- Cada producto puede tener nombre, precio, descripción y categoría.
- Se vincula con pedidos y cotizaciones para generar métricas de ventas.

### Pedidos
- Gestión de órdenes de venta o solicitudes de clientes.
- Permite registrar pedidos con cliente, producto, total, estado y fecha de envío.
- Incluye estados como pendientes, en proceso y completados.
- Ideal para llevar control de las ventas activas y el cumplimiento de entregas.

### Negociaciones
- Registro de negociaciones comerciales en curso.
- Incluye etapas, montos estimados, responsables y clientes asociados.
- Permite visualizar el avance de cada oportunidad dentro del pipeline.
- Sirve para priorizar las negociaciones con mayor potencial.

### Usuarios
- Gestión de cuentas de usuario del CRM.
- Permite crear y editar usuarios que podrán acceder al sistema.
- Es útil para administrar roles y responsabilidades internas.
- En esta versión, se utiliza para representar al personal que interactúa con el CRM.

### Tareas
- Planificación y seguimiento de actividades internas.
- Cada tarea contiene título, asignado, fecha de vencimiento, prioridad y estado.
- Facilita la organización de acciones pendientes relacionadas con clientes, leads o negociaciones.
- Incluye métricas de tareas completadas y en progreso.

### Cotizaciones
- Registro de propuestas comerciales enviadas a clientes.
- Incluye referencia, cliente, monto, estado y responsable.
- Permite llevar control de las oportunidades que aún no se han convertido en órdenes.
- Ideal para comparar propuestas aprobadas, en revisión o rechazadas.

### Reportes
- Panel de reportes con métricas dinámicas y filtros de rango de fecha.
- Permite seleccionar reportes por sección: resumen general, pedidos, tareas y cotizaciones.
- Muestra tarjetas de resumen, gráficos y tablas filtradas.
- Incluye exportación a CSV y visualización de tendencias mensuales.

### Perfil
- Página personal del usuario.
- En esta versión, permite ver datos básicos asociados al usuario autenticado.
- Puede servir como base para agregar edición de perfil o preferencias.

### Configuración
- Espacio para ajustes del CRM.
- Actualmente incluye opciones básicas de configuración y parámetros generales.
- Es la sección donde el administrador puede ajustar comportamientos del sistema.

> Nota: el CRM está construido con un frontend de React + Vite y un backend de Express. La persistencia actual es en memoria para datos de ejemplo, por lo que los cambios no se guardan permanentemente tras reiniciar el servidor.
