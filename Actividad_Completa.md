# Actividad: Diseño inicial de pruebas con el Modelo en V (RF-12, RF-14, RF-15)

## Datos del estudiante
- Nombre: [Tu nombre]
- Grado: [Tu grado]
- Matrícula: [Tu matrícula]
- PE: [Programa educativo]
- EE: Fundamentos de pruebas
- Fecha de entrega: 20/03/2026
- Práctica: Diseño inicial de pruebas con el Modelo en V (RF-12, RF-14, RF-15)

---

## 1. Identificación inicial de los requerimientos (RF-12 / RF-14 / RF-15)

| Requerimiento | Función principal | Riesgo implementación incorrecta | Atributo ISO 25010 |
|---|---|---|---|
| RF-12 | Restablecer contraseña con enlace temporal seguro. | Token reutilizable, filtración de existencia de usuario, sesión no cerrada. | Seguridad |
| RF-14 | Cliente multiplataforma para gestión de cuenta y recuperación (web/móvil/deskt.). | Flujos inconsistentes, pérdida de acceso en plataformas, errores de compatibilidad. | Portabilidad |
| RF-15 | Verificación de identidad en acciones sensibles (cambio contraseña, cierre de sesión, etc.). | Acceso no autorizado a operación crítica, bypass de 2FA, no registro de auditoría. | Seguridad |

---

## 2. Relación entre requerimientos y aspectos a revisar (9 registros)

| Requerimiento | Aspecto a revisar | Atributo ISO 25010 | ¿Qué debe comprobarse? | ¿Dónde tendría sentido revisarlo? | Evidencia esperada |
|---|---|---|---|---|---|
| RF-12 | Token de restablecimiento | Seguridad | El token es de un solo uso y expira según política. | Componente de validación/revocación (`PasswordResetService`/`TokenService`). | 1) El primer uso funciona, 2) el segundo uso falla, 3) token expirado falla. |
| RF-12 | Mensaje de existencia de usuario | Usabilidad | La respuesta es genérica y no revela si el correo existe. | Endpoint API `POST /forgot-password` y UI de notificación. | Mensaje: "Si el correo existe, se envió enlace" para todos los correos. |
| RF-12 | Flujo de token inválido | Fiabilidad | Códigos inválidos/expirados son bloqueados y no cambian contraseña. | Manejo de error en flujo `/reset?token=` completo. | Respuesta 400/401 y no se actualiza contraseña. |
| RF-14 | Consistencia multiplataforma | Portabilidad | Mismo comportamiento funcional (navegación, errores, confirmación). | Pruebas end-to-end en front-vite y flutter-client. | Mismos estados de flujo y mensajes en al menos dos plataformas. |
| RF-14 | Compatibilidad API | Compatibilidad | API funciona con diferentes clientes (web, móvil, escritorio). | Validación de contratos API y pruebas de integración. | 200 con datos esperados y formato consistente en todos los clientes. |
| RF-14 | Recuperación bajo fallo | Fiabilidad | Reintentos y timeouts no dejan proceso inconsistente. | Lógica de servicio de envío de correo y HTTP client. | Operación reintentable; estado limpio tras error transitorio. |
| RF-15 | Verificación previa | Seguridad | Acción sensible se ejecuta solo con código validado. | Middleware/servicio de verificación de 2FA antes de acción crítica. | Rechazo 403 sin código o con código inválido. |
| RF-15 | Límite de intentos | Fiabilidad | El sistema bloquea o ralentiza tras intentos inválidos repetidos. | Lógica de contador de intentos y bloqueo temporal. | 5 intentos inválidos generan bloqueo temporal (o similar). |
| RF-15 | Retroalimentación al usuario | Usabilidad | Mensajes claros de error: inválido, expirado, intentos excedidos. | UI de entrada de código y respuesta API. | Mensajes específicos y consistentes según causa. |

---

## 3. Mini revisión aplicada (1 por requisito)

### Mini revisión 1 (RF-12)
- ¿Qué se revisará?: Validación y revocación de token de restablecimiento (un solo uso y caducidad).
- ¿Cómo se revisará?:
  1. Generar un token válido e intentar usarlo.
  2. Volver a usarlo en segunda ocasión.
  3. Usar un token expirado.
- Evidencia de cumplimiento:
  - Primera solicitud exitosa; segunda solicitud rechazada con error `token inválido o usado`; token expirado rechazado.
- Evidencia de incumplimiento:
  - Token aceptado más de una vez; token expirado aún permite restablecer.

### Mini revisión 2 (RF-14)
- ¿Qué se revisará?: Consistencia multiplataforma del flujo de recuperación de contraseña.
- ¿Cómo se revisará?:
  1. Ejecutar flujo de restablecimiento en web (front-vite).
  2. Ejecutar en Flutter (móvil).
  3. Verificar misma respuesta funcional y UX mínima entre clientes.
- Evidencia de cumplimiento:
  - En todas las plataformas se genera token, se notifica y se actualiza contraseña correctamente.
- Evidencia de incumplimiento:
  - Alguna plataforma falla, queda bloqueada en paso distinto o muestra mensaje inconsistente.

### Mini revisión 3 (RF-15)
- ¿Qué se revisará?: Verificación de identidad antes de acción crítica (p. ej. cambio de contraseña).
- ¿Cómo se revisará?:
  1. Solicitar acción sensible.
  2. Ingresar código correcto → debería aplicar acción.
  3. Ingresar código inválido, expirado o reuso → debería rechazar y registrar.
- Evidencia de cumplimiento:
  - Acción permitida solo con código válido; rechaza con motivos; eventos registrados.
- Evidencia de incumplimiento:
  - Acción se ejecuta sin verificación correcta; código inválido es aceptado.

---

## 4. Cierre reflexivo

1. ¿Por qué no basta con implementar una función sin revisar su calidad?
   - Porque la implementación puede cumplir un comportamiento nominal pero tener fallos de seguridad, confiabilidad, portabilidad o usabilidad. Revisar calidad previene vulnerabilidades, reduce retrabajo y asegura satisfacción de usuarios.

2. ¿Cómo ayuda pensar “qué revisar” y “dónde revisarlo” antes de probar un sistema?
   - Permite enfocar pruebas en riesgos reales, cubrir áreas críticas del diseño y crear casos de prueba con resultados observables. Evita pruebas dispersas y detecta errores temprano en el ciclo de vida (Modelo en V).

3. ¿Qué atributo de calidad consideras más crítico en RF-15 y por qué?
   - Seguridad. Porque RF-15 protege acciones sensibles y controla identidad; un fallo aquí permite acceso no autorizado y compromete todo el sistema.

---

## 5. Referencias (breve)
- RF-12: restablecimiento seguro por enlace temporal.
- RF-14: cliente multiplataforma.
- RF-15: verificación de identidad previa a acciones críticas.
