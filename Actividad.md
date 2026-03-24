Actividad
4. Diseño inicial de pruebas con el Modelo en V

Detalle
Inicia:

20/mar/2026 - 10:00 hrs

Termina:

20/mar/2026 - 11:00 hrs

Valor:

100

Prerrequisitos

---

Descripción
Estimados estudiantes destacados:

Tal y como se acordó con su grupo. El día de hoy 20 de marzo del 2026, se atenderá dentro del horario de clase la práctica introductoria aplicada al Modelo en V a partir de RF-12, RF-14 y RF-15. 

Nota: hay dos avisos importante, el próximo viernes (27 de marzo) en horario de clase se aplicará el examen teórico y regresando de vacaciones el examen práctico (miércoles 8 de abril).

Se comparte algunas consideraciones importantes de la práctica de hoy.:

Tema: Introducción aplicada al Modelo en V a partir del análisis de requerimientos y atributos de calidad
Duración: aproximadamente 35 a 45 minutos.
Modalidad: Individual
Objetivo: Analizar los requerimientos RF-12, RF-14 y RF-15 para identificar su función principal, los riesgos de una mala implementación y los aspectos de calidad que deben revisarse en la solución, utilizando como apoyo atributos de la ISO 25010 y una aproximación introductoria a la lógica del Modelo en V.
Propósito formativo: Que el estudiante comprenda que un requerimiento no solo expresa una función del sistema, sino que también implica aspectos de calidad que deben revisarse de forma planificada. Además, que reconozca, de manera inicial, que en una solución de software hay distintas partes donde tiene sentido revisar el cumplimiento de un requerimiento.
Competencia que favorece: El estudiante identifica la relación entre requerimientos, calidad del software y revisión de la solución, desarrollando una primera noción de trazabilidad que posteriormente se vinculará con el Modelo en V y con el diseño formal de pruebas.
Contexto de la práctica: Se parte de tres requerimientos previamente trabajados y revisados en clase:

RF-12: funcionalidad base de acceso, autenticación o gestión principal de cuenta.
RF-14: cliente multiplataforma para gestión de cuenta y recuperación de contraseña.
RF-15: verificación de identidad y gestión segura de acceso a la cuenta.
A partir de estos requerimientos, se busca que el estudiante reflexione sobre:

¿Qué función cumple cada uno?
¿Qué riesgos existen si se implementan incorrectamente?
¿Qué atributos de calidad están involucrados? y 
¿En qué parte de la solución tendría sentido revisar cada aspecto?
Fundamento teórico breve: En el desarrollo de software, un requerimiento no debe verse únicamente como una instrucción para programar una función. También debe entenderse como una base para revisar si la solución realmente cumple lo esperado. Esta revisión puede centrarse en distintos aspectos, por ejemplo:

si la función resuelve la necesidad planteada,
si el comportamiento es correcto en todo el proceso,
si la interacción entre partes del sistema funciona adecuadamente,
o si un componente específico opera como debería.
Esta lógica se relaciona con el Modelo en V, el cual muestra que lo que se define durante el análisis y diseño debe relacionarse posteriormente con actividades de revisión y validación. En esta práctica no se pide aún distinguir formalmente los tipos técnicos de prueba; por ahora, el interés está en que el estudiante piense qué revisar, por qué revisarlo y dónde tendría sentido hacerlo.

Materiales:

Descripción de los requerimientos RF-12, RF-14 y RF-15 (previamente proporcionados e implementados)
Hoja de trabajo impresa o archivo digital
Bolígrafo y/o equipo de cómputo
---------------------------------------------- Desarrollo de la práctica ----------------------------------------------

Instrucción: Analiza los requerimientos RF-12, RF-14 y RF-15. Primero, identifica su función principal, el riesgo de una mala implementación y el atributo de calidad más comprometido. Después, para cada requerimiento, selecciona 3 aspectos de calidad, escribe qué debe comprobarse y señala en qué parte de la solución tendría sentido revisarlo. Finalmente, redacta una mini revisión por requerimiento y responde una breve reflexión sobre la importancia de revisar la calidad del software.

Actividad 1. Identificación inicial de los requerimientos
Duración: 10 minutos
Instrucción: Lee cuidadosamente los requerimientos RF-12, RF-14 y RF-15 y completa la siguiente tabla. Debes identificar de forma breve la función principal de cada requerimiento, el riesgo que podría presentarse si se implementa mal y el atributo de calidad que consideres más comprometido.

Formato de trabajo:



Orientación: Para responder esta actividad, piensa en preguntas como las siguientes:

¿Qué intenta lograr el requerimiento?
¿Qué podría salir mal si la implementación es incorrecta?
¿Qué aspecto de calidad parece más delicado: seguridad, usabilidad, fiabilidad, portabilidad u otro?
Resultado esperado:  Se espera que el estudiante logre identificar de manera general:

la intención funcional de cada requerimiento,
un posible riesgo asociado,
y un atributo de calidad relevante.
Actividad 2. Relación entre requerimientos y aspectos a revisar
Duración: 15 minutos
Instrucción: Para cada requerimiento (RF-12, RF-14 y RF-15), identifica 3 aspectos relevantes de calidad. Para cada aspecto:

selecciona un atributo de calidad de la ISO 25010,
redacta qué debe comprobarse de manera concreta y observable,
e indica en qué parte de la solución tendría sentido revisarlo.
Regla obligatoria de la actividad: Para cada requerimiento debes completar 3 registros en la tabla.
Es decir, en cada registro debes incluir:

1 atributo de calidad ISO 25010
1 comprobación concreta y observable
1 ubicación de revisión en la solución
Esto significa que debes completar:

3 registros para RF-12
3 registros para RF-14
3 registros para RF-15
Total de la actividad: 9 registros completos en la tabla.

Atributos de calidad disponibles de ISO 25010. Selecciona únicamente de esta lista:

Adecuación funcional
Eficiencia del desempeño
Compatibilidad
Usabilidad
Fiabilidad
Seguridad
Mantenibilidad
Portabilidad
Opciones guiadas para la columna “¿Dónde tendría sentido revisarlo?”
Selecciona o redacta una opción similar a las siguientes:

En una función o componente específico
En la interacción entre dos partes del sistema
En el funcionamiento completo del proceso
En la validación de la necesidad del usuario
Formato de trabajo:



Guía de apoyo para orientar la selección:

RF-12 suele relacionarse con mayor frecuencia con:
Adecuación funcional
Seguridad
Usabilidad
RF-14 suele relacionarse con mayor frecuencia con:
Portabilidad
Compatibilidad
Fiabilidad
RF-15 suele relacionarse con mayor frecuencia con:
Seguridad
Fiabilidad
Usabiulidad
Ejemplo orientador: No copiar literalmente; solo sirve como ejemplo de estructura.



Criterio esperado: Cada registro debe mostrar:

un atributo pertinente al requerimiento,
una comprobación clara y verificable,
una ubicación lógica de revisión,
y una evidencia observable.
Actividad 3. Mini revisión aplicada de la solución
Duración: 10 minutos
Instrucción: Selecciona uno de los registros que redactaste en la Actividad 2 para cada requerimiento. Con base en ello, escribe una mini revisión práctica. En total debes elaborar 3 mini revisiones, una para RF-12, una para RF-14 y una para RF-15.

Cada mini revisión debe responder estas cuatro preguntas:

¿Qué se revisará?
¿Cómo se revisará?
¿Qué evidencia indicaría que sí cumple?
¿Qué evidencia indicaría que no cumple?
Formato de trabajo:

Mini revisión 1. Requerimiento asociado: RF-12

¿Qué se revisará?:
¿Cómo se revisará?:
Evidencia de cumplimiento:
Evidencia de incumplimiento:
Mini revisión 2. Requerimiento asociado: RF-14

¿Qué se revisará?:
¿Cómo se revisará?:
Evidencia de cumplimiento:
Evidencia de incumplimiento:
Mini revisión 3. Requerimiento asociado: RF-15

¿Qué se revisará?:
¿Cómo se revisará?:
Evidencia de cumplimiento:
Evidencia de incumplimiento:
Ejemplo orientador. Requerimiento asociado: RF-15:

¿Qué se revisará?: Que el cambio de contraseña requiera validación previa de identidad.
¿Cómo se revisará?: Intentando cambiar la contraseña sin capturar un código válido.
Evidencia de cumplimiento: El sistema impide la acción y muestra un mensaje claro.
Evidencia de incumplimiento: El sistema permite el cambio sin validación.
Resultado esperado: El estudiante debe demostrar que sabe transformar un requerimiento en un punto concreto de revisión.

Actividad 4. Cierre reflexivo
Duración: 5 minutos
Instrucción: Responde brevemente las siguientes preguntas:

¿Por qué no basta con implementar una función sin revisar su calidad?
¿Cómo ayuda pensar “qué revisar” y “dónde revisarlo” antes de probar un sistema?
¿Qué atributo de calidad consideras más crítico en RF-15 y por qué?
--------------------------------------------------- FIN de práctica  ---------------------------------------------

Consideraciones para el entregable/subir a Eminus:

Archivo PDF con la nomenclatura acordada: NRC_NombreApellidos_No.Actividad.pdf
¿Qué debe incluir el contenido del archivo PDF?
Nombre del estudiante, grado, matricula, PE, EE y fecha de entrega
La tabla completa de la Actividad 1
La tabla completa de la Actividad 2 con 9 registros
Las 3 mini revisiones de la Actividad 3
Las respuestas de la Actividad 4
En el píe de página ademas, del número de página y total de páginas, debe llevar el nombre del estudiante y en el encabezado el nombre de la práctica con el NRC de la EE.
Resultado de aprendizaje esperado: Al finalizar la práctica, el estudiante será capaz de reconocer que un requerimiento de software implica no solo una función, sino también criterios de calidad y puntos concretos de revisión, comprendiendo de manera introductoria la lógica que posteriormente se formalizará mediante el Modelo en V.

Atte. Profesor Mancilla.

The more effort I put into testing the product conceptually at the start of the process, the less effort I had to put into manually testing the product at the end because fewer bugs would emerge as a result.” – Trish Khoo

