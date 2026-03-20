# Mantenibilidad
- **Mantenibilidad**: Capacidad de un sistema para ser modificado, corregido, adaptado o mejorado de manera eficiente y efectiva.
- **Mantenibilidad del código**: Capacidad de un código para ser modificado, corregido, adaptado o mejorado de manera eficiente y efectiva.

## Principios de Mantenibilidad
1. **Modularidad**: Dividir el sistema en módulos independientes y cohesivos.
2. **Abstracción**: Ocultar los detalles de implementación y exponer solo lo necesario.
3. **Encapsulamiento**: Proteger los datos y métodos de un módulo para evitar que sean modificados directamente.
4. **Cohesión**: Medir la relación entre las responsabilidades de un módulo.
5. **Acoplamiento**: Medir la dependencia entre los módulos.

## Métricas de Mantenibilidad
- **Complejidad Ciclomática**: Mide la complejidad de un programa.
- **Complejidad de Halstead**: Mide la complejidad de un programa.
- **Métricas de Cohesión y Acoplamiento**: Miden la relación entre los módulos.


# Reglas tecnicas minimas
 - Diseño por capas o componentes (PasswordResetService, TokenService, Auditervice, RateLimiter)
 - Contratos claves (interfaces, inyeccion de dependencias o equivalente)
 - pruebas unitarias y de integraicón


 # Evidencias
 - Cobertura de prueba del modulo >= 80%
 - Cambiar RB1 expiracion (15 minutos a 10 minutos), sin tocar lógica, solo config
 - Cmabiar regex de la contraseña