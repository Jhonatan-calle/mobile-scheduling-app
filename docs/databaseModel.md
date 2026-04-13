```mermaid
erDiagram
    
    AUTH.USERS {
        int id PK
        string role
        string email
        string phone
    }

    PROFILES {
        int id PK
        int user_id FK
        string name
    }

    WORKERS {
        int id PK
        int profile_id FK
        decimal commission_rate
        boolean is_active
    }

    SERVICE_OBJECTS {
        int id PK
        string objeto
        boolean is_active
    }

    SERVICE_COMBOS {
        int id PK
        int object_id FK
        string name
        string description
        int precio
        boolean is_active
    }

    APPOINTMENT_ITEMS{
        int id PK
        int appointment_id FK
        int service_objet_id FK
        int service_combo_id FK
        string notes
    }

    APPOINTMENT_STATUSES {
        int id PK
        string name
    }

    WORKER_AVAILABILITY {
        int id PK
        int worker_id FK
        int day_of_week
        time start_time
        time end_time
    }

    CLIENTS {
        int id PK
        string name
        string phone_number
        datetime last_appointment_at
    }

    APPOINTMENTS {
        int id PK
        datetime date
        string address
        int admin_id FK
        int worker_id FK
        int client_id FK
        int appointment_items_id FK
        int status_id FK
        int estimate_time
        string notes
        boolean paid_to_worker
        decimal commission_rate
        string payment_method
        decimal cost
        boolean has_retouches
    }

    RETOUCHES {
        datetime time
        string address
        int id PK
        int appointment_id FK
        int worker_id FK
        string reason
        int estimate_time
        int status_id FK
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
        int total_retouches
    }

    EXPENSES {
        int id PK
        string description
        decimal amount
        date date
    }

    SALARIES {
        int id PK
        int user_id FK
        decimal amount
        int month
        int year
    }

    AUTH.USERS ||--o| PROFILES : is
    PROFILES ||--o| WORKERS : is
    PROFILES ||--o{ SALARIES : receives
    WORKERS ||--o{ APPOINTMENTS : attends
    WORKERS ||--o{ WORKER_AVAILABILITY : has
    WORKERS ||--o{ RETOUCHES : performs
    CLIENTS ||--o{ APPOINTMENTS : books
    APPOINTMENT_STATUSES ||--o{ APPOINTMENTS : defines
    APPOINTMENT_STATUSES ||--o{ RETOUCHES : defines
    APPOINTMENTS ||--o{ RETOUCHES : has
    SERVICE_OBJECTS ||--o{ SERVICE_COMBOS : has
    SERVICE_OBJECTS ||--o{ APPOINTMENT_ITEMS : includes
    SERVICE_COMBOS ||--o{ APPOINTMENT_ITEMS : specifies
    PROFILES ||--o{ SALARIES : receives
    APPOINTMENTS ||--o{ APPOINTMENT_ITEMS : contains

