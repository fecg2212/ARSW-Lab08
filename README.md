# Blueprints RT - Aplicación de Colaboración en Tiempo Real

## ¿QUÉ ES?

Una aplicación web **fullstack de colaboración en tiempo real** que permite a múltiples usuarios dibujar "blueprints" (planos) simultáneamente en salas compartidas. Es similar a un tablero colaborativo o Google Docs pero para dibujo técnico.

## EQUIPO

- Cristian Silva
- David Salamanca
- Felipe Calvache
- Juan Miguel Rojas

---

## ESTRUCTURA DEL PROYECTO

```
lab07/
├── back/                          # Backend (Node.js)
│   ├── package.json              # Dependencias del servidor
│   └── src/
│       ├── index.js              # Punto de entrada, configura Express + Socket.IO
│       ├── routes/
│       │   └── blueprints.routes.js  # API REST (CRUD de blueprints)
│       ├── sockets/
│       │   └── blueprints.socket.js  # Eventos WebSocket (dibujo en tiempo real)
│       ├── store/
│       │   └── blueprints.store.js   # Base de datos en memoria (Map)
│       └── validation/
│           └── schemas.js        # Validación de datos (Zod)
│
└── front/                         # Frontend (React + Vite)
    ├── package.json              # Dependencias del cliente
    ├── vite.config.js            # Configuración del bundler
    └── src/
        ├── App.jsx               # Componente principal (UI e lógica)
        ├── main.jsx              # Punto de entrada
        └── lib/
            ├── socketIoClient.js # Cliente WebSocket
            └── stompClient.js    # Cliente STOMP alternativo
```

---

## TECNOLOGÍAS USADAS

### Backend
- **Express**: Framework web
- **Socket.IO**: WebSockets para comunicación bidireccional en tiempo real
- **Zod**: Validación de esquemas (data validation)
- **Nodemon**: Recarga automática durante desarrollo

### Frontend
- **React 18**: Framework UI
- **Vite**: Bundler y dev server ultrarrápido
- **Socket.IO Client**: Cliente para conectarse al servidor WebSocket
- **STOMP Client**: Protocolo alternativo de mensajería

---

## ¿QUÉ HACE?

### Funcionalidades Principales

#### 1. CRUD de Blueprints (API REST)
- `GET /api/blueprints?author=juan` → Lista todos los planos de un autor
- `GET /api/users/:author/points` → Obtiene puntos totales y cantidad de planos
- `POST /api/blueprints` → Crea un nuevo plano
- `PUT /api/blueprints/:author/:name` → Actualiza un plano
- `DELETE /api/blueprints/:author/:name` → Elimina un plano

#### 2. Dibujo Colaborativo en Tiempo Real (WebSockets)
- Los usuarios se unen a **salas** (rooms) específicas: `blueprints.{author}.{name}`
- Cuando alguien dibuja un punto, se envía a todos en esa sala **instantáneamente**
- El canvas se actualiza en vivo en todos los clientes

#### 3. Sistema de Salas (Rooms)
- Sala de autor: `author.{author}` → Notificaciones de cambios de puntos
- Sala de blueprint: `blueprints.{author}.{name}` → Dibujo colaborativo

#### 4. Estadísticas en Tiempo Real
- Cada autor ve su cantidad total de puntos dibujados
- Cada autor ve su cantidad total de blueprints creados

---

## FLUJO DE DATOS

### Flujo de Dibujo (Colaborativo)
```
Usuario A dibuja → Cliente A emite "draw-event" (x,y) → 
Socket.IO → Backend recibe → Valida con Zod → 
Almacena en Store → Emite "blueprint-update" a todos en la sala → 
Usuario A, B, C reciben actualización → Canvas se redibuja
```

### Flujo de Estadísticas
```
Se dibuja un punto → Backend calcula totales → 
Emite "user-points-update" a sala del autor → 
Frontend actualiza UI con nuevos números
```

---

## CÓMO EJECUTAR EL PROYECTO

### Requisitos
- Node.js 18+
- npm

### Instalación y Ejecución

**Terminal 1 - Backend:**
```bash
cd back
npm install
npm run dev
# Servidor en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd front
npm install
npm run dev
# Cliente en http://localhost:5173
```

### Endpoints de Health Check
- `GET http://localhost:3001/health` → Status completo del servidor
- `GET http://localhost:3001/health/live` → Verificación de disponibilidad

---

## VARIABLES DE ENTORNO

### Backend (`back/.env` o variables del sistema)
```
PORT=3001
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend (`front/.env`)
```
VITE_API_BASE=http://localhost:3001
VITE_IO_BASE=http://localhost:3001
VITE_STOMP_BASE=http://localhost:3001
```

---

## ALMACENAMIENTO

- **Almacenamiento en memoria** (Map de JavaScript)
- Los datos **se pierden** cuando el servidor se reinicia
- Estructura de datos:
```javascript
{
  "author:name": {
    author: "juan",
    name: "plano-1",
    points: [
      { x: 100, y: 200 },
      { x: 110, y: 210 },
      ...
    ]
  }
}
```

---

## FLUJO DE USO (Usuario Final)

1. **Usuario abre el navegador** → Accede a http://localhost:5173
2. **Selecciona autor y nombre de plano**
3. **Carga plano existente o crea uno nuevo**
4. **Se une automáticamente a salas WebSocket**
5. **Dibuja en el canvas** → Puntos se sincronizan en tiempo real
6. **Otros usuarios ven el dibujo actualizado** instantáneamente
7. **Estadísticas se actualizan** en tiempo real

---

## DETALLES TÉCNICOS IMPORTANTES

| Aspecto | Detalle |
|---------|---------|
| **Protocolo de Comunicación** | HTTP (REST) + WebSocket (Socket.IO) |
| **Validación** | Zod (backend) |
| **CORS** | Configurado para `localhost:5173` en dev |
| **Persistencia** | En memoria (ephemeral) |
| **Escalabilidad** | No soporta múltiples instancias (sin Redis) |
| **Autenticación** | No implementada (usa `author` como identificador) |
| **Concurrencia** | Manejo de múltiples usuarios en simultáneo |

---

## VIDEO DEMO

[![Ver demo en YouTube](https://img.youtube.com/vi/J0TTSaxKyDs/0.jpg)](https://youtu.be/J0TTSaxKyDs)

### Blueprints

- `GET /api/blueprints?author=:author`
  - Lista blueprints por autor e incluye `totalPoints`.
- `GET /api/blueprints/:author/:name`
  - Retorna un blueprint con sus puntos.
- `POST /api/blueprints`
  - Crea blueprint.
  - Body:
  ```json
  {
    "author": "juan",
    "name": "plano-1",
    "points": [{ "x": 10, "y": 10 }]
  }
  ```
- `PUT /api/blueprints/:author/:name`
  - Actualiza puntos del blueprint.
- `DELETE /api/blueprints/:author/:name`
  - Elimina blueprint.

Compatibilidad temporal:
- `POST /api/blueprints/:author/:name` (legacy)

## Protocolo RT (Socket.IO)

### Cliente -> Servidor

- `join-room`
  - payload: `blueprints.{author}.{name}`
- `draw-event`
  - payload:
  ```json
  {
    "room": "blueprints.juan.plano-1",
    "author": "juan",
    "name": "plano-1",
    "point": { "x": 123, "y": 45 }
  }
  ```

### Servidor -> Clientes

- `blueprint-update`
  - Se emite a la sala correspondiente con el plano acumulado:
  ```json
  {
    "author": "juan",
    "name": "plano-1",
    "points": [{ "x": 123, "y": 45 }]
  }
  ```
- `error-event`
  - Se emite cuando el payload es invalido o la sala no coincide.

## Estructura del proyecto

```text
src/
  index.js
  routes/
    blueprints.routes.js
  sockets/
    blueprints.socket.js
  store/
    blueprints.store.js
  validation/
    schemas.js
```

## Decisiones de diseno (rooms/topicos)

- Se usa una sala por plano: `blueprints.{author}.{name}`.
- Cualquier cliente que quiera colaborar en un plano primero emite `join-room` con ese identificador.
- El evento `draw-event` valida que `room` coincida con `author` y `name`, para evitar publicar en una sala que no corresponde.
- El servidor emite `blueprint-update` hacia la sala del plano para aislar eventos entre planos diferentes.
- En `blueprint-update` se envia el arreglo acumulado de puntos para simplificar el repintado en el front.

## Comparativa breve: Socket.IO vs STOMP (opcional)

- Socket.IO:
  - Ventaja: API simple para eventos personalizados (`emit/on`) y manejo directo de salas.
  - Ventaja: buena experiencia para prototipos colaborativos con Node.
  - Costo: acopla cliente/servidor al ecosistema Socket.IO.
- STOMP (sobre WebSocket):
  - Ventaja: modelo estandar de topicos y subscripciones (util cuando hay broker y multiples servicios).
  - Ventaja: integra bien con stacks enterprise (por ejemplo Spring + broker).
  - Costo: algo mas de complejidad operativa y de configuracion inicial.

## Evidencia

### Captura 1

![Evidencia 1](images/image.png)

### Captura 2

![Evidencia 2](images/image2.png)

### Captura 3

![Evidencia 3](images/image3.png)
