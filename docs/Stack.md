# Stack propuesto – Aplicación móvil de agenda (negocio de limpieza de tapizados)

## Objetivo
Aplicación móvil multiplataforma para gestionar agendas diarias y asignar turnos a personal, con funcionamiento offline y sincronización automática al recuperar conexión, evitando conflictos de horarios.

---

## Frontend (App móvil)
**React Native + Expo**

- Un solo código para Android y iOS
- Buen soporte offline
- Ecosistema maduro
- Integración simple con almacenamiento local y red

---

## Persistencia local (offline)
**SQLite (en el dispositivo)**

- Almacenamiento local de:
  - empleados
  - turnos
  - cola de cambios pendientes
- La app funciona sin conexión
- Los datos se sincronizan cuando hay red

---

## Modelo de sincronización
**Offline-first con cola de eventos**

- Cada cambio se guarda localmente
- Se registra en una tabla de sincronización
- Al detectar conexión:
  - se envían los cambios al backend
  - el backend valida reglas de negocio
  - se actualiza el estado local

---

## Backend
**Node.js + TypeScript**

- API REST
- Validación centralizada de horarios
- Resolución de conflictos
- Fuente de verdad de los datos
- Fácil mantenimiento y escalabilidad

---

## Base de datos remota
**PostgreSQL**

- Base de datos relacional
- Manejo confiable de fechas y rangos horarios
- Transacciones y restricciones
- Prevención de turnos superpuestos por empleado

---



