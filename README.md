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
