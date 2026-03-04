# Módulo: Restablecimiento de Contraseña

## RF-12: Restablecimiento seguro de contraseña mediante enlace temporal

**Descripción:** El sistema debe permitir que un usuario registrado restablezca su contraseña usando un enlace temporal enviado a su correo institucional, sin intervención del personal de soporte.

**Actor:** Usuario registrado (estudiante o personal).

**Disparador:** El usuario selecciona "¿Olvidaste tu contraseña?" e ingresa su correo.

---

## Precondiciones

- El usuario existe en el sistema y su cuenta está activa.
- El correo registrado es válido.

---

## Flujo Principal

1. El usuario ingresa su correo.
2. El sistema no revela si el correo existe o no; responde con un mensaje genérico.
3. Si el correo corresponde a una cuenta activa:
   - Genera un token de restablecimiento de un solo uso.
   - Envía un correo con enlace: `/reset?token=...`
4. El usuario abre el enlace, ingresa nueva contraseña y confirmación.
5. El sistema valida el token, valida la política de contraseña, actualiza credenciales y revoca el token.
6. El sistema cierra sesiones activas y registra evento de seguridad.

---

## Reglas de Negocio (RB)

> **Nota:** En la segunda imagen se alcanza a ver una sección de Reglas de Negocio a la derecha, aunque está parcialmente cortada. Se distinguen puntos como:

- La longitud de la contraseña debe ser ≥ 12 caracteres.
- Cierre de sesiones activas tras el restablecimiento.
