# Proyecto Password Reset

Este proyecto implementa un sistema de recuperación de contraseña con API, clientes Flutter, CLI y Frontend Vite.

## Componentes

- **api/**: Backend Node.js (Express) para autenticación, registro, recuperación y auditoría.
- **flutter-client/**: Cliente móvil multiplataforma (Flutter).
- **cli-client/**: Cliente de línea de comandos (Node.js).
- **front-vite/**: Frontend web moderno (Vite + React).

---

## Despliegue de cada componente

### 1. API (Backend)

**Requisitos:** Node.js >= 14, SQLite3

**Instalación:**
```bash
cd api
npm install
```

**Variables de entorno:**
- Crear `.env` con:
  - `EMAIL_USER=tu_correo@gmail.com`
  - `EMAIL_PASS=tu_contraseña`
  - `FRONTEND_URL=http://localhost:5173` (o la URL de tu frontend)

**Ejecución:**
```bash
node server.js
```

**Puerto por defecto:** 3333

---

### 2. Flutter Client

**Requisitos:** Flutter SDK, fvm (opcional)

**Instalación:**
```bash
cd flutter-client
flutter pub get
```

**Configuración:**
- Edita `lib/config.dart` para la URL de la API si es necesario.

**Ejecución:**
```bash
flutter run
```

---

### 3. CLI Client

**Requisitos:** Node.js >= 14

**Instalación:**
```bash
cd cli-client
npm install
```

**Configuración:**
- Edita `config.json` para la URL de la API si es necesario.

**Ejecución:**
```bash
node index.js
```

---

### 4. Frontend Vite

**Requisitos:** Node.js >= 14

**Instalación:**
```bash
cd front-vite
npm install
```

**Variables de entorno:**
- Crear `.env` con:
  - `VITE_API_URL=http://localhost:3333`

**Ejecución:**
```bash
npm run dev
```

**Puerto por defecto:** 5173

---

## Notas
- Todos los componentes deben apuntar a la misma URL de la API.
- El backend debe estar corriendo antes de usar los clientes.
- Para producción, actualiza las URLs y variables de entorno según tu servidor.

---

## Contacto y soporte
Para dudas o soporte, contacta al autor o revisa los archivos README de cada subcarpeta.
