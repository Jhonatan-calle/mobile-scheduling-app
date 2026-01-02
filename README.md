# Upholstery Cleaning – Scheduling Mobile App

## Overview

This project is a mobile application designed to support the internal operations of an upholstery cleaning business.  
It focuses on managing work schedules, assigning jobs to employees, tracking service status, and providing basic business accounting.

The application follows an **offline-first** approach, allowing full operation without internet connectivity and automatic synchronization when the connection is restored.

---

## Goals

- Manage daily work schedules
- Register and assign service appointments
- Provide clear access to job information for workers
- Track job completion and payments
- Generate monthly business summaries
- Ensure reliable offline operation

---

## Tech Stack

### Mobile App
- **React Native + Expo**

### Local Persistence (Offline)
- **SQLite**

### Synchronization Model
- **Offline-first architecture with event queue**

### Backend
- **Node.js + TypeScript**
- REST API

### Remote Database
- **PostgreSQL**

---

## Documentation

Detailed documentation is available in the `docs/` directory:

- `docs/srs.md` — Software Requirements Specification
- `docs/stack.md` — Detailed technology stack and architecture

---

## Project Status

- Requirements definition: completed  
- Stack definition: completed  
- Data modeling: pending  
- Implementation: pending  

---

## Notes

This project is developed as part of a learning process, but it is intended for real-world use.  
The application is designed to support an existing upholstery cleaning business that requires a functional system for managing schedules, workers, and internal operations.

