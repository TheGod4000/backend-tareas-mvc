# API Tareas MVC

API RESTful para gestión de Tareas, Personas y Tags con autenticación JWT + CSRF, construida con Express.js y Sequelize (SQLite).

## Tecnologías

- **Express.js** — Framework HTTP
- **Sequelize 6** — ORM con dialectos SQLite / MySQL
- **SQLite3** — Base de datos de desarrollo (sin servidor externo)
- **bcryptjs** — Hash de contraseñas
- **JWT + CSRF** — Autenticación y protección contra CSRF

## Instalación y puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear tablas (migraciones)
npm run db:migrate

# 3. Cargar datos de prueba (seeders)
npm run db:seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

## Credenciales de prueba (después de correr seeders)

| Usuario          | Email                | Contraseña     | Estado   |
|------------------|----------------------|----------------|----------|
| Admin Sistema    | admin@tareas.com     | Admin1234!     | activo   |
| María García     | maria@tareas.com     | Maria1234!     | activo   |
| Usuario Inactivo | inactivo@tareas.com  | Inactivo1234!  | inactivo |

**API Key de desarrollo:** `123456789`

## Scripts disponibles

| Comando                 | Descripción                                 |
|-------------------------|---------------------------------------------|
| `npm run dev`           | Inicia con nodemon (recarga automática)     |
| `npm start`             | Inicia en modo producción                   |
| `npm run db:migrate`    | Ejecuta migraciones pendientes              |
| `npm run db:seed`       | Inserta datos de prueba                     |
| `npm run db:reset`      | Revierte todo y recrea desde cero           |

## Documentación OpenAPI

El archivo `openapi.yaml` contiene la especificación OpenAPI 3.0 completa.
Se puede visualizar en [Swagger Editor](https://editor.swagger.io/).

## Endpoints

### Autenticación (`/api/auth`)
| Método | Ruta               | Descripción                        |
|--------|--------------------|------------------------------------|
| POST   | `/login`           | Login (requiere `x-api-key`)       |
| POST   | `/logout`          | Cierra sesión                      |
| GET    | `/verify`          | Verifica sesión activa             |

### Tareas (`/api/tareas`) — JWT + CSRF
| Método | Ruta                             | Descripción                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/`                              | Listar (`?q=` búsqueda, `?formato=text`) |
| GET    | `/buscar?q=`                     | Búsqueda explícita por título        |
| GET    | `/:id`                           | Detalle (incluye personas y tags)    |
| POST   | `/`                              | Crear tarea                          |
| PUT    | `/:id`                           | Actualizar completo                  |
| PATCH  | `/:id`                           | Actualizar parcial                   |
| DELETE | `/:id`                           | Eliminar                             |
| GET    | `/:id/personas`                  | Personas de una tarea                |
| POST   | `/:id/personas/:personaId`       | Vincular persona                     |
| DELETE | `/:id/personas/:personaId`       | Desvincular persona                  |
| GET    | `/:id/tags`                      | Tags de una tarea                    |
| POST   | `/:id/tags/:tagId`               | Vincular tag                         |
| DELETE | `/:id/tags/:tagId`               | Desvincular tag                      |

### Personas (`/api/personas`) — JWT + CSRF
| Método | Ruta                             | Descripción                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/`                              | Listar personas                      |
| GET    | `/:id`                           | Detalle (incluye tareas)             |
| POST   | `/`                              | Crear persona                        |
| PUT    | `/:id`                           | Actualizar                           |
| DELETE | `/:id`                           | Eliminar                             |
| GET    | `/:id/tareas`                    | Tareas de una persona (con tags)     |
| POST   | `/:id/tareas/:tareaId`           | Vincular tarea                       |
| DELETE | `/:id/tareas/:tareaId`           | Desvincular tarea                    |
| GET    | `/:id/tags`                      | Tags indirectos via tareas           |

### Tags (`/api/tags`) — JWT + CSRF
| Método | Ruta                             | Descripción                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/`                              | Listar tags                          |
| GET    | `/:id`                           | Detalle (incluye tareas)             |
| POST   | `/`                              | Crear tag                            |
| PUT    | `/:id`                           | Actualizar                           |
| DELETE | `/:id`                           | Eliminar                             |
| GET    | `/:id/tareas`                    | Tareas con este tag                  |
| POST   | `/:id/tareas/:tareaId`           | Vincular tarea                       |
| DELETE | `/:id/tareas/:tareaId`           | Desvincular tarea                    |
| GET    | `/:id/personas`                  | Personas indirectas via tareas       |

### Usuarios (`/api/usuarios`)
| Método | Ruta                | Auth requerida          | Descripción            |
|--------|---------------------|-------------------------|------------------------|
| POST   | `/`                 | x-api-key               | Registrar usuario      |
| GET    | `/`                 | JWT                     | Listar usuarios        |
| GET    | `/:id`              | JWT                     | Obtener usuario        |
| PUT    | `/:id`              | JWT + CSRF              | Modificar usuario      |
| DELETE | `/:id`              | JWT + CSRF              | Eliminar usuario       |
| PATCH  | `/:id/activar`      | JWT + CSRF              | Activar usuario        |
| PATCH  | `/:id/desactivar`   | JWT + CSRF              | Desactivar usuario     |
