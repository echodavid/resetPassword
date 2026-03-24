Con base en el RF-15, el revisor debe centrarse en verificar que la implementación realmente cumpla el
requerimiento funcional y los tres atributos de calidad ISO 25010 asociados: seguridad, usabilidad y
fiabilidad.
1. Revisar que el flujo de validación exista en todas las acciones sensibles: El revisor debe comprobar
que el sistema sí exige verificación de identidad antes de ejecutar acciones como:
• cambio de contraseña,
• recuperación de contraseña,
• cambio de correo,
• desbloqueo de cuenta,
• cierre de sesiones activas.
¿Qué revisar?
• que no exista forma de saltarse la validación;
• que la verificación ocurra antes de confirmar la acción;
• que el flujo aplique igual en las plataformas definidas.
2. Revisar la generación y envío del código temporal: El revisor debe validar que el sistema genere
correctamente el código de verificación y lo envíe al medio registrado del usuario.
¿Qué revisar?
• que el código sea único por solicitud;
• que tenga vigencia limitada;
• que no pueda reutilizarse;
• que se envíe al correo o teléfono correcto;
• que no quede expuesto en logs, pantalla o URLs.
3. Revisar la validación del código: El revisor debe verificar que el sistema compare correctamente el
código ingresado por el usuario.
¿Qué revisar?
• aceptación de códigos válidos y vigentes;
• rechazo de códigos incorrectos;
• rechazo de códigos expirados;
• rechazo de códigos ya usados;
• control del número máximo de intentos.
4. Revisar controles de seguridad: Aquí el revisor valida que la implementación realmente proteja la
cuenta.
¿Qué revisar?
EE: Fundamentos de Pruebas de Software Página 1 de 2
Acciones de revisión en la implementación
• que una acción sensible no se ejecute sin validación previa;
• que después de varios intentos fallidos se aplique bloqueo temporal o medida equivalente;
• que no se filtre información sensible en mensajes de error;
• que el sistema registre eventos relevantes de auditoría;
• que los datos sensibles estén protegidos en tránsito y en almacenamiento, según el alcance del
proyecto.
5. Revisar consistencia del estado del sistema: El revisor debe comprobar que la cuenta no quede en
estado inconsistente si ocurre un error.
¿Qué revisar?
• que si la verificación falla, no se aplique la acción solicitada;
• que si el código expira durante el proceso, el sistema lo maneje correctamente;
• que si hay error de envío, el flujo permita reintento controlado;
• que no se generen cambios parciales en la cuenta.
6. Revisar mensajes y retroalimentación al usuario: Esto se relaciona con usabilidad.
¿Qué revisar?
• que el sistema informe claramente qué debe hacer el usuario;
• que los mensajes indiquen si el código fue incorrecto, expirado o excedió intentos;
• que no haya mensajes ambiguos;
• que el flujo sea entendible y fácil de completar.
7. Revisar la trazabilidad y auditoría: El revisor debe validar que existan evidencias de las operaciones
críticas.
¿Qué revisar?
• registro de fecha y hora;
• tipo de acción ejecutada;
• resultado del intento;
• identificación del evento sin comprometer datos sensibles;
• posibilidad de rastrear incidencias.
8. Revisar comportamiento multiplataforma: Dado que RF-15 extiende un cliente multiplataforma, el
revisor debe verificar consistencia entre implementaciones.
¿Qué revisar?
• mismo orden lógico del flujo;
• mismos controles de validación;
• mismos mensajes esenciales;
• mismos criterios de bloqueo, expiración y confirmación.
EE: Fundamentos de Pruebas de Software Página 2 de 2