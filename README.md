# README del equipo - Blueprints RT

Servidor Node.js con Express y Socket.IO para gestionar blueprints y colaboracion en tiempo real por sala.

## Equipo

- Cristian Silva
- David Salamanca
- Felipe Calvache
- Juan miguel Rojas


## Video
[![Ver demo en YouTube](https://img.youtube.com/vi/J0TTSaxKyDs/0.jpg)](https://youtu.be/J0TTSaxKyDs)


## Setup

### Requisitos

- Node.js 18+
- npm

### Instalacion

```bash
npm install
```

### Ejecucion

```bash
npm run dev
```

Servidor por defecto en `http://localhost:3001`.

### Variables de entorno

- `PORT`: puerto del servidor (default: `3001`)
- `NODE_ENV`: `development` o `production`
- `FRONTEND_ORIGIN`: origen permitido en produccion para Socket.IO (default: `http://localhost:5173/`)

## Endpoints usados

### Health checks

- `GET /health`
- `GET /health/live`

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
