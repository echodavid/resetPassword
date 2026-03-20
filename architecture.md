# Arquitectura y Plan de Pruebas

## Diagrama de Componentes

La aplicación sigue una arquitectura modular por capas, con servicios independientes para manejar responsabilidades específicas. A continuación, un diagrama simplificado de los componentes principales:

```
[Cliente (Browser)]
    |
    | HTTP Requests (AJAX/Fetch)
    v
[Express Server (server.js)]
    |
    +-- [RateLimiter] (Control de tasa por IP/acción)
    +-- [AuditService] (Logs de auditoría en DB)
    +-- [TokenService] (Gestión de tokens de reset)
    +-- [PasswordResetService] (Hashing, validación y auth de passwords)
    |
    v
[SQLite Database (password_reset.db)]
    |
    +-- Tablas: users, reset_tokens, audit_logs
```

### Descripción de Componentes:

- **Express Server**: Punto de entrada, maneja rutas HTTP, middleware (CORS, JSON parsing), y delega lógica a servicios.
- **RateLimiter**: Servicio in-memory para limitar solicitudes (5 por hora por IP/acción) y prevenir abuso.
- **AuditService**: Registra eventos de seguridad (logins, resets, etc.) en la base de datos para trazabilidad.
- **TokenService**: Genera, hashea y valida tokens de reset de contraseña con expiración configurable.
- **PasswordResetService**: Maneja hashing de contraseñas (bcrypt), validación de políticas, registro y autenticación de usuarios.
- **SQLite Database**: Almacenamiento persistente de usuarios, tokens y logs.

### Relaciones y Flujo:
- El servidor inyecta la instancia de DB a cada servicio para encapsular el acceso a datos.
- Servicios son independientes y cohesivos, facilitando pruebas y mantenimiento.
- Configuración centralizada en `config.js` (expiración de tokens, regex de passwords, límites de tasa).

## Plan de Pruebas Unitarias e Integración

### Estrategia General:
- **Framework**: Jest para ejecución de pruebas.
- **Cobertura Objetivo**: >80% (actual: **96.22%**).
- **Tipos de Pruebas**:
  - **Unitarias**: Prueban funciones/métodos individuales.
  - **Integración**: Prueban interacción con DB SQLite real (en memoria para aislamiento y velocidad).
- **DB en Pruebas**: Cada suite crea una DB SQLite en memoria (`:memory:`), inicializa tablas reales, ejecuta queries reales, y cierra la DB. Esto hace las pruebas **más realistas** y robustas, simulando el comportamiento de producción.

### Suites de Pruebas:

#### 1. **RateLimiter** (`__tests__/RateLimiter.test.js`)
   - **Tipo**: Unitaria.
   - **Cobertura**: 100%.
   - **Pruebas**:
     - `should allow requests within limit`: Permite hasta 5 requests por ventana.
     - `should block requests over limit`: Bloquea después del límite.
     - `should reset after window`: Prueba reset con mock de `Date.now`.

#### 2. **AuditService** (`__tests__/AuditService.test.js`)
   - **Tipo**: Integración (DB real).
   - **Cobertura**: 100%.
   - **Pruebas**:
     - `log should insert into DB`: Inserta y verifica logs reales en tabla `audit_logs`.

#### 3. **TokenService** (`__tests__/TokenService.test.js`)
   - **Tipo**: Integración (DB real).
   - **Cobertura**: 100%.
   - **Pruebas**:
     - `generateToken should return a string`: Genera token de 64 chars (hex).
     - `hashToken should return sha256 hash`: Hashea correctamente.
     - `storeToken should insert into DB`: Inserta en `reset_tokens` con expiración.
     - `validateToken should query DB`: Consulta token existente.
     - `removeToken should delete from DB`: Elimina token usado.

#### 4. **PasswordResetService** (`__tests__/PasswordResetService.test.js`)
   - **Tipo**: Integración (DB real + bcrypt).
   - **Cobertura**: 89.47%.
   - **Pruebas**:
     - `validatePassword should return true for valid password`: Valida regex (14+ chars, mayúscula, minúscula, dígito, especial).
     - `validatePassword should return false for invalid password`: Rechaza inválidos.
     - `userExists should check DB`: Consulta existencia en `users`.
     - `registerUser should hash and insert`: Hashea con bcrypt y registra.
     - `authenticateUser should compare password`: Verifica login con bcrypt.compare.
     - `authenticateUser should handle bcrypt error`: Maneja errores en comparación.

### Ejecución de Pruebas:
- **Comando Unitario**: `npm test` (Jest ejecuta todas las suites).
- **Con Cobertura**: `npm run test:coverage` (genera reporte en consola y HTML en `coverage/`).
- **DB Real**: Usa SQLite en memoria para realismo, sin afectar archivos.
- **Integración Futura**: Para end-to-end, usar Supertest para requests HTTP.

### Métricas y Mejoras:
- **Cobertura Actual**: 96.22% statements, **100% branches**, 94.44% functions.
- **Líneas No Cubiertas**: Solo 2 líneas en `PasswordResetService` (excepciones en auth, parcialmente cubiertas).
- **Recomendaciones**: Agregar pruebas para rutas Express (e.g., con Supertest), errores de DB, y escenarios edge.

Esta documentación asegura mantenibilidad y calidad del código, cumpliendo con los principios de modularidad y testing.