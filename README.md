# SWARCO Ops Portal

Stack: React + Tailwind + Node.js + MariaDB (Sequelize) + Docker.

## Estructura
- `backend/` API (Express)
- `frontend/` UI (React)
- `docker-compose.yml` local

## Ejecutar local (como receta)
1) Abrir terminal en la raíz del proyecto.
2) Ejecutar:
```
docker compose up --build
```
3) Abrir:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/health

## Base de datos MariaDB (explicado fácil)
MariaDB es una “caja” donde guardamos usuarios y pedidos.
El `docker-compose.yml` ya crea esa caja con:
- usuario: `swarco`
- contraseña: `swarco_password`
- base: `swarco_ops`

## Cloud Run (paso a paso)
Backend y frontend se despliegan por separado.

### Backend
1) Build y subir la imagen del backend.
2) Variables:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`
3) Crear una instancia MariaDB en Cloud SQL y usar esos datos.

### Frontend
1) Build y subir la imagen del frontend.
2) Variable:
   - `VITE_API_URL` apuntando al backend de Cloud Run.
