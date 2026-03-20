module.exports = {
  // Expiración de token: 10 minutos (600000 ms)
  TOKEN_EXPIRATION: 600000,
  // Expiración de código de verificación: 5 minutos
  VERIFICATION_CODE_EXPIRATION: 5 * 60 * 1000,
  // Máximo intentos fallidos para código de verificación
  VERIFICATION_MAX_ATTEMPTS: 5,
  // Expiración del token de acción (post-verificación)
  ACTION_TOKEN_EXPIRATION: 10 * 60 * 1000,
  // Duración de sesión en ms (opcional; usada si se implementa sesiones)
  SESSION_EXPIRATION: 24 * 60 * 60 * 1000,
  // Política de contraseña: mínimo 12 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 especial
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, 
  RATE_LIMIT_WINDOW: 3600000,
  RATE_LIMIT_MAX: 5
};
