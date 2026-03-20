RELIABILITY

disponibilidad: el flujo debe funcionar incluso con fallos parciales
Tolerancia a fallos: el sistema debe funcionar correctamente incluso con fallos parciales
recuperacion: el sistema debe poder recuperarse de fallos parciales
madurez: el sistema debe ser estable y no tener errores graves

Seguridad:
Confidencialidad: no filtrar existencia de usuarios
integridad: el token no debe poder alterarse o forzarse
Autenticidad: asegurar que el establecimiento corresponde al propietario del correo
No repudio: evidencia de acciones

# controles minimos: obligatorio
- Token criptográficamente aleatorios: almacenados como hash
- Expiracion y uso único
- Rate limitign por cuenta e IP
- Politica de contraseñas: 1 especial, 1 numero, 1 letras mayuscula, 1 minuscula, 12 caracteres
- Invalidacion de sesiones
- Auditoria y logs sin guardar contraseña ni tken en claro (cifrar)
- Mensajes genericos ("el correo existe") para evitar enumeracion


# pruebas
- reutilizar el token debe fallar
- token expirado debe fallar
- ataque de fuerza bruta a tokens (Simulado, deteccion y bloqueo por rate limit)
- enumeracion de cuentas (Verificar que la UI responde igual para correos existentes y no existentes)