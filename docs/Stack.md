# Proposed Stack – Scheduling Mobile Application (Upholstery Cleaning Business)

## Objective

Cross-platform mobile application designed to manage daily schedules and assign service appointments to employees.  
The system supports offline operation with automatic synchronization when network connectivity is restored, preventing scheduling conflicts.

---

## Frontend (Mobile App)
**React Native + Expo**

- Single codebase for Android and iOS
- Strong support for offline usage
- Mature and stable ecosystem
- Simple integration with local storage and network services

---

## Local Persistence (Offline)
**SQLite (On-device database)**

- Local storage for:
  - employees
  - service appointments
  - pending synchronization events
- The application remains fully functional without internet access
- Data is synchronized automatically when connectivity is available

---

## Synchronization Model
**Offline-first architecture with event queue**

- All changes are stored locally first
- Each operation is recorded in a synchronization queue
- When a connection is detected:
  - local changes are sent to the backend
  - business rules are validated server-side
  - local state is updated accordingly

This approach minimizes data loss and avoids scheduling conflicts.

---

## Remote Database
**PostgreSQL**

- Relational database
- Reliable handling of dates and time ranges
- Transaction support and data constraints
- Prevention of overlapping appointments per employee

---
