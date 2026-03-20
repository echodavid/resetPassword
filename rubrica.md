# Rúbrica de evaluación — Portabilidad (ISO 25010)

## Práctica: Evaluación de Portabilidad del requerimiento incremental

### Datos generales

| Campo | Información |
|---|---|
| Nombre del estudiante / equipo | |
| Grupo | |
| Sistema / módulo evaluado | |
| Fecha | |
| Revisor | |

---

## Escala de desempeño

| Nivel | Valor | Descripción general |
|---|---:|---|
| Excelente | 4 | Cumple completamente, con evidencia clara, técnica y consistente |
| Bueno | 3 | Cumple en lo esencial, con evidencia suficiente pero mejorable |
| Suficiente | 2 | Cumplimiento parcial, evidencia incompleta o débil |
| Insuficiente | 1 | No cumple o no presenta evidencia verificable |

---

## Tabla de validación / rúbrica analítica

| Criterio | Qué se revisa | 4 Excelente | 3 Bueno | 2 Suficiente | 1 Insuficiente | Puntaje |
|---|---|---|---|---|---|---:|
| **1. Adaptabilidad de clientes** | El sistema puede ejecutarse desde al menos dos plataformas cliente sin modificar la lógica central | Funciona en 2 o más clientes claramente diferenciados y se demuestra que consumen el mismo backend/API sin cambios de lógica | Funciona en 2 clientes, aunque la evidencia técnica es parcial | Solo funciona en 1 cliente o el segundo está incompleto o simulado | No hay evidencia funcional de clientes múltiples | |
| **2. Independencia del backend** | Los clientes usan los mismos endpoints y contratos | Se demuestra reutilización completa de endpoints, métodos y formato de respuesta | Hay consistencia general, con pequeñas diferencias no críticas | Existen inconsistencias importantes entre clientes | Cada cliente depende de lógica distinta o interfaces incompatibles | |
| **3. Configuración externa del entorno** | URL, puerto, variables de entorno o archivo de configuración externos al código | Toda la configuración crítica está externalizada y documentada | La mayor parte está externalizada, con mínimos valores fijos | Parte importante sigue embebida en el código | La configuración depende del código fuente | |
| **4. Adaptación a diferentes entornos** | El sistema puede apuntar a distintos ambientes (local, pruebas, producción) sin reescritura | Se demuestra cambio de entorno solo por configuración y con evidencia de ejecución | Se demuestra el cambio, aunque con ajustes manuales menores | El cambio de entorno requiere modificaciones importantes | No puede cambiar de entorno sin alterar código | |
| **5. Instalabilidad** | Existencia de instrucciones claras y reproducibles de instalación o despliegue | El despliegue está documentado paso a paso, es reproducible y verificable | La guía existe y funciona, pero tiene omisiones menores | La instalación es parcialmente reproducible o ambigua | No existe guía clara o no funciona | |
| **6. Compatibilidad de ejecución** | El cliente o backend corre en distintos sistemas operativos o plataformas | Se demuestra ejecución real en al menos 2 plataformas o sistemas operativos | Se afirma y documenta compatibilidad, pero con evidencia limitada | Solo hay compatibilidad teórica o parcial | No se demuestra compatibilidad | |
| **7. Reemplazabilidad de clientes** | Un cliente puede sustituirse por otro sin afectar el backend | El backend permanece intacto al cambiar de cliente y se demuestra técnicamente | El reemplazo es posible con ajustes menores no estructurales | El cambio de cliente requiere cambios significativos en backend | El sistema está acoplado a un único cliente | |
| **8. Reemplazabilidad de infraestructura** | Posibilidad de cambiar servidor, dominio o entorno sin reescribir lógica | El cambio se realiza solo por configuración y queda documentado | El cambio es viable con mínimos ajustes | Requiere varios cambios manuales no deseables | No es viable sin reprogramar | |
| **9. Evidencia técnica presentada** | Calidad de capturas, logs, configuración, pruebas o scripts | Evidencia completa, organizada y trazable | Evidencia suficiente pero no totalmente ordenada | Evidencia parcial o poco concluyente | No hay evidencia verificable | |
| **10. Coherencia arquitectónica** | La solución muestra separación cliente-servidor y bajo acoplamiento | La arquitectura es clara, modular y consistente con portabilidad | La arquitectura es aceptable con ligeras debilidades | La arquitectura presenta acoplamientos importantes | La arquitectura contradice el objetivo de portabilidad | |

---

## Ponderación sugerida

| Criterio | Peso |
|---|---:|
| Adaptabilidad de clientes | 15% |
| Independencia del backend | 15% |
| Configuración externa del entorno | 15% |
| Adaptación a diferentes entornos | 10% |
| Instalabilidad | 10% |
| Compatibilidad de ejecución | 10% |
| Reemplazabilidad de clientes | 10% |
| Reemplazabilidad de infraestructura | 5% |
| Evidencia técnica presentada | 5% |
| Coherencia arquitectónica | 5% |

**Total: 100%**
