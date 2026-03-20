Actividad
3. Requerimiento incremental

Detalle
Inicia:

13/mar/2026 - 00:00 hrs

Termina:

19/mar/2026 - 23:45 hrs

Valor:

100

Prerrequisitos

---

Descripción
Estimados estudiantes destacados:

Además de agradecerles su participación activa en ésta EE; felicitarlos por su esfuerzo y dedicación a completar las entregas. Bajo ésta misma forma de trabajo, procederemos al RF-15: Verificación de identidad y gestión segura de acceso a la cuenta. A continuació, se detalla los elementos de ésta actividad/práctica.

Descripción general del RF:15:

El sistema deberá permitir que el usuario valide su identidad al realizar acciones sensibles sobre su cuenta, tales como cambio de contraseña, recuperación de contraseña, actualización de correo electrónico, cierre de sesiones activas y desbloqueo de cuenta, mediante un mecanismo de verificación temporal compatible con el cliente multiplataforma.
Propósito: Extender la funcionalidad de gestión de cuenta y recuperación de contraseña ya cubierta por RF-12 y RF-14, incorporando controles adicionales para proteger la cuenta del usuario y asegurar una interacción consistente en distintas plataformas.

Relación incremental con los requerimientos previos

RF-12: sirve como base para autenticación, acceso o administración principal de la cuenta.
RF-14: aporta el cliente multiplataforma y el flujo de recuperación de contraseña.
RF-15: agrega una capa de control para validar identidad y proteger operaciones críticas de cuenta.
Especificación del nuevo requerimiento:

Identificador: RF-15
Nombre: Verificación de identidad y gestión segura de acceso
Tipo: Funcional incremental
Prioridad: Alta
Entradas:

Correo electrónico, número telefónico o identificador de cuenta.
Código temporal de verificación o confirmación del medio registrado.
Solicitud de acción sensible sobre la cuenta.
Proceso. El sistema deberá:

Solicitar validación de identidad antes de ejecutar acciones críticas de cuenta.
Generar y enviar un código temporal de verificación al medio registrado del usuario.
Validar que el código ingresado sea correcto, vigente y no reutilizado.
Permitir la ejecución de la acción solicitada únicamente si la validación fue exitosa.
Registrar el evento de verificación y la operación realizada.
Mostrar mensajes claros al usuario en caso de éxito, error, expiración o intento excedido.
Salidas:

Confirmación de identidad validada.
Ejecución o rechazo de la acción solicitada.
Mensaje de estado del proceso.
Registro de auditoría del evento.
Reglas de negocio:

El código de verificación deberá tener vigencia limitada.
El número de intentos fallidos consecutivos deberá estar restringido.
Un código expirado o ya utilizado no podrá volver a aceptarse.
Toda acción sensible deberá quedar registrada con fecha, hora y tipo de operación.
El flujo deberá comportarse de forma equivalente en web, móvil o escritorio, según aplique al cliente multiplataforma.
Criterios de aceptación

Dado un usuario autenticado o en proceso de recuperación, cuando solicite una acción sensible, entonces el sistema deberá exigir verificación de identidad previa.
Dado un código válido y vigente, cuando el usuario lo capture correctamente, entonces el sistema deberá autorizar la acción solicitada.
Dado un código incorrecto o expirado, cuando el usuario intente validarlo, entonces el sistema deberá rechazar la operación e informar el motivo.
Dado que el usuario exceda el máximo de intentos permitidos, entonces el sistema deberá bloquear temporalmente el flujo o aplicar una medida de protección.
Dado un acceso desde distintas plataformas compatibles, entonces el flujo deberá conservar la misma lógica funcional y consistencia de resultados.


Tres atributos de calidad ISO/IEC 25010 considerados para esta nueva entrega:

Seguridad. 
Justificación: El requerimiento trata operaciones críticas de cuenta; por tanto, debe reducir el riesgo de acceso no autorizado.
Subcaracterísticas relacionadas:
Autenticidad
Confidencialidad
Responsabilidad
Criterios verificables:
El sistema no deberá permitir cambios de contraseña o datos sensibles sin validación previa.
Los códigos temporales deberán invalidarse después de su uso o expiración.
Cada evento deberá quedar registrado para fines de auditoría.
Usabilidad:
Justificación: La recuperación y gestión de cuenta son procesos sensibles; deben ser comprensibles y fáciles de completar por el usuario.
Subcaracterísticas relacionadas:
Operabilidad
Protección contra errores de usuario
Reconocibilidad de la adecuación
Criterios verificables:
El usuario deberá entender qué paso sigue y por qué se solicita la verificación.
Los mensajes de error deberán indicar si el código fue incorrecto, expiró o excedió intentos.
El flujo no deberá requerir pasos innecesarios ni ambiguos.
Fiabilidad
Justificación: El proceso debe ejecutarse correctamente incluso ante errores de captura, expiración del código o interrupciones parciales.
Subcaracterísticas relacionadas:
Madurez
Tolerancia a fallos
Recuperabilidad
Criterios verificables:
El sistema deberá manejar correctamente códigos inválidos sin comprometer la cuenta.
Si ocurre un fallo temporal en el envío o validación, el usuario deberá poder reintentar el proceso de forma controlada.
La operación no deberá quedar en estado inconsistente tras un error.


Nota: para completar la entrega, primero se revisará la implementación por un revisor (Fecha: Jueves 19) y posteriormente en otra actividad se aplicará una rúbrica de aceptación de calidad por un auditor.

Atte. Profesor Mancilla.



