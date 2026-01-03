```mermaid
erDiagram
    PROFILES {
        int id PK
        string name
    }

    WORKERS {
        int id PK
        decimal commission_rate
        decimal balance_due
    }

    WORKER_AVAILABILITY {
        int id PK
        int worker_id FK
        int day_of_week
        time start_time
        time end_time
    }

    ADMINS {
        int id PK
    }

    CLIENTS {
        int id PK
        string name
        string phone_number
        datetime last_appointment_at
    }

    APPOINTMENTS {
        int id PK
        datetime time
        string address
        int admin_id FK
        int worker_id FK
        int client_id FK
        int estimate_time
        decimal cost
        string status  // pending | in_progress | completed | cancelled
        boolean has_retouches
        datetime created_at
        datetime updated_at
    }

    RETROUCHES {
        int id PK
        int appointment_id FK
        int worker_id FK
        string reason
        datetime created_at
    }

    MONTH_SUMMARIES {
        int id PK
        int month
        int year
        decimal total_income
        decimal total_expenses
        decimal total_salaries
        decimal total_profit
        int total_appointments
    }

    EXPENSES {
        int id PK
        string description
        decimal amount
        date date
    }

    SALARIES {
        int id PK
        int profile_id FK
        decimal amount
        date date
    }

    PROFILES ||--o| WORKERS : is
    PROFILES ||--o| ADMINS : is

    WORKERS ||--o{ APPOINTMENTS : attends
    WORKERS ||--o{ WORKER_AVAILABILITY : has
    WORKERS ||--o{ RETROUCHES : performs

    ADMINS ||--o{ APPOINTMENTS : manages
    CLIENTS ||--o{ APPOINTMENTS : books

    APPOINTMENTS ||--o{ RETROUCHES : has

    PROFILES ||--o{ SALARIES : receives
