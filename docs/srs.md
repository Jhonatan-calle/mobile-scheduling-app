## 1 Objetivo del sistema

El objetivo del sistema es optimizar la gestión interna de un negocio de limpieza de tapizados, facilitando:

- La administración de turnos  
- La asignación de trabajos a empleados  
- El seguimiento del estado de cada servicio  
- El control contable mensual del negocio  

---

## 2 Actores del sistema

Se identifican dos actores principales.

### 2.1 Administrador

Persona encargada de:

- Gestionar la agenda  
- Comunicarse con los clientes  
- Asignar turnos a los trabajadores  
- Controlar pagos y contabilidad  

### 2.2 Trabajador

Persona encargada de:

- Realizar los servicios de limpieza  
- Consultar y gestionar sus turnos asignados  
- Informar el estado de los servicios  

> En esta primera entrega, el cliente no se modela como actor directo del sistema.

---

## 3 Requerimientos funcionales

### 3.1 Requerimientos funcionales del Administrador

#### RF-A01
El sistema debe permitir al administrador visualizar los horarios disponibles para ofrecer turnos a los clientes.

#### RF-A02
El sistema debe permitir al administrador registrar un turno, incluyendo como mínimo:

- Fecha y hora
- Monto a cobrar al cliente
- Descripción de los objetos a limpiar
- Tiempo estimado del servicio
- Información de contacto del cliente

#### RF-A03
El sistema debe permitir al administrador asignar un turno a un trabajador.

#### RF-A04
El sistema debe permitir al administrador reasignar un turno a otro trabajador.

#### RF-A05
El sistema debe permitir marcar un turno como realizado.

#### RF-A06
El sistema debe permitir indicar si un turno fue abonado por el cliente.

#### RF-A07
El sistema debe permitir registrar si el pago correspondiente al trabajador fue realizado o si existe una deuda pendiente.

#### RF-A08
El sistema debe permitir configurar el porcentaje de ganancia que recibe cada trabajador por turno, permitiendo que dicho porcentaje pueda modificarse en el tiempo.

#### RF-A09
El sistema debe permitir acceder a resúmenes contables mensuales.

#### RF-A10
El sistema debe permitir acceder a un resumen contable del mes en curso hasta la fecha actual.

#### RF-A11
El sistema debe permitir registrar un repaso asociado a un turno ya realizado.

#### RF-A12
El sistema debe permitir que los repasos no generen cobro adicional al cliente.

#### RF-A13
El sistema debe permitir mantener información del trabajador que realizó el turno original y del cliente que solicitó el repaso.

#### RF-A14
El sistema debe permitir almacenar información de los clientes para posibles recontactos con fines de marketing.

#### RF-A15
El sistema debe permitir al administrador conocer el estado actual de los turnos de cada trabajador, para estimar en qué turno se encuentra en tiempo real.

---

### 3.2 Requerimientos funcionales del Trabajador

#### RF-T01
El sistema debe permitir al trabajador acceder a la lista de turnos que tiene asignados.

#### RF-T02
El sistema debe permitir al trabajador definir sus horarios disponibles para trabajar.

#### RF-T03
El sistema debe permitir al trabajador acceder a toda la información asociada a cada turno asignado.

#### RF-T04
El sistema debe permitir al trabajador enviar un turno asignado a otro trabajador.

#### RF-T05
El sistema debe permitir al trabajador aceptar o rechazar un turno enviado por otro trabajador.

#### RF-T06
El sistema debe permitir al trabajador marcar un turno como realizado.

#### RF-T07
El sistema debe permitir al trabajador indicar que un turno fue cobrado exitosamente.

---

## 4 Requerimientos funcionales de contabilidad

Estos aplican a todo el sistema:

#### RF-C01
El sistema debe permitir registrar quién posee el dinero correspondiente a cada turno.

#### RF-C02
El sistema debe permitir determinar si el trabajador adeuda dinero al negocio o si el negocio adeuda dinero al trabajador.

#### RF-C03
El sistema debe permitir reflejar esta información en los resúmenes contables.

---

## 5 Requerimientos no funcionales

#### RNF01
La aplicación debe ejecutarse en dispositivos Android.

#### RNF02
La interfaz debe ser clara y permitir una lectura rápida de la información de los turnos.

#### RNF03
El sistema debe persistir la información de turnos, trabajadores y clientes.

#### RNF04
El acceso a las funcionalidades debe depender del rol del usuario (administrador o trabajador).

---

## 6 Alcance de la primera entrega

### 6.1 Incluye

- Gestión básica de turnos
- Asignación y reasignación de turnos
- Visualización de turnos por trabajador
- Registro del estado del turno (realizado / cobrado)
- Registro básico de clientes
- Resumen contable mensual simple

### 6.2 No incluye

- Automatización de pagos
- Notificaciones automáticas
- Acceso del cliente al sistema
- Funcionalidades avanzadas de marketing
