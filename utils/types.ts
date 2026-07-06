
//===================================================================
// TIPOS — Tablas
// ============================================================================

export interface User {
  /** UUID de auth.users */
  id: string;

  email: string | null;

  phone: string | null;
}

export interface Profile {
  /** Primary key, not nullable. */
  id: number;
  /** UUID referencing auth.users.id, not nullable. */
  auth_user: User;
  /** Name, not nullable. */
  name: string;
  /** May be null. */
  user_role: string | null;
  /** May be null. ISO date (YYYY-MM-DD). */
  updated_at: string | null;
}

/**
 * workers table. The DB had profile_id FK → replaced with nested Profile.
 */
export interface Worker {
  /** Primary key, not nullable. */
  id: number;
  /** Foreign key replaced by the referenced Profile object, not nullable. */
  profile: Profile;
  /** Commission rate, not nullable. */
  commission_rate: number;
  /** May be null. */
  is_active: boolean | null;
  /** May be null. ISO date (YYYY-MM-DD). */
  updated_at: string | null;
}

/**
 * worker_availability table. worker_id FK -> nested Worker.
 */
export interface WorkerAvailability {
  /** Primary key, not nullable. */
  id: number;
  /** Referenced Worker object, not nullable. */
  worker: Worker;
  /** Day of week (0 = Sunday .. 6 = Saturday), not nullable. */
  day_of_week: number;
  /** Time string (HH:MM:SS), not nullable. */
  start_time: string;
  /** Time string (HH:MM:SS), not nullable. */
  end_time: string;
}

/**
 * service_objects table
 */
export interface ServiceObject {
  /** Primary key (bigint), not nullable. */
  id: number;
  /** Name, not nullable. */
  name: string;
  /** Not nullable. */
  is_active: boolean;
}

/**
 * combos table. service_object accessed via object_combos junction.
 * getServiceCombos() flattens object_combos[0].service_object → service_object.
 * Raw DB queries return object_combos[{ service_object }] instead.
 */
export interface ServiceCombo {
  /** Primary key (bigint), not nullable. */
  id: number;
  /** IDs of all service_objects this combo belongs to (from object_combos junction). */
  object_ids: number[];
  /** Name, not nullable. */
  name: string;
  /** May be null. */
  description: string | null;
  /** Not nullable. */
  is_active: boolean;
  /** May be null. */
  precio: number | null;
}

/**
 * appointment_statuses table
 */
export const AppointmentStatus = {
  CANCELADO: 0,
  PENDIENTE: 1,
  EN_PROCESO: 2,
  COMPLETO: 3,
  PENDIENTE_REPASO: 4,
  EN_PROCESO_REPASO: 5,
  COMPLETO_REPASO: 6,
} as const;


/**
 * salaries table. profile_id FK -> nested Profile.
 */
export interface Salary {
  /** Primary key, not nullable. */
  id: number;
  /** Referenced Profile object, not nullable. */
  profile: Profile;
  /** Amount, not nullable. */
  amount: number;
  /** Month (1-12), not nullable. */
  month: number;
  /** Year, not nullable. */
  year: number;
}

/**
 * clients table
 */
export interface Client {
  /** Primary key, not nullable. */
  id: number;
  /** Name, not nullable. */
  name: string;
  /** Phone number, not nullable. */
  phone_number: string;
  /** May be null. ISO timestamp (no timezone) represented as string. */
  last_appointment_at: string | null;
}

/**
 * appointments table.
 *
 * Note: admin_id in DB had no explicit FK in the provided model, so it is kept as number.
 * Other FK columns are replaced with nested types.
 */
export interface Appointment {
  /** Primary key, not nullable. */
  id: number;
  /** May be null. */
  address: string | null;
  /** Admin user/profile id (no FK in model), not nullable. */
  admin_id: number;
  /** Referenced Worker object, not nullable. */
  worker: Worker;
  /** Referenced Client object, may be null. */
  client: Client | null;
  /** Estimate time (minutes?), may be null. */
  estimate_time: number | null;
  /** Cost, may be null. */
  cost: number | null;
  /** May be null. */
  has_retouches: boolean | null;
  /** May be null. */
  commission_rate: number | null;
  /** May be null. */
  payment_method: string | null;
  /** May be null. */
  notes: string | null;
  /** May be null. */
  paid_to_worker: boolean | null;
  /** ISO timestamp (no timezone), not nullable. */
  date: string;
  /** Referenced appointment status, not nullable. */
  status: typeof AppointmentStatus;
}

/**
 * retouches table. appointment_id -> Appointment, worker_id -> Worker, status -> AppointmentStatus.
 */
export interface Retouch {
  /** Primary key, not nullable. */
  id: number;
  /** Referenced Appointment object, not nullable. */
  appointment: Appointment;
  /** Referenced Worker object, not nullable. */
  worker: Worker | null;
  /** Reason, not nullable. */
  reason: string;
  /** May be null. ISO timestamp (no timezone) represented as string. */
  time: string | null;
  /** May be null. */
  address: string | null;
  /** Estimate time (minutes?), may be null. */
  estimate_time: number | null;
  /** Referenced appointment status, may be null. */
  status: typeof AppointmentStatus | null;
}

/**
 * appointment_items table. appointment_id -> Appointment, service_combo_id -> combos.
 * Service object accessed transitively via service_combo.object_combos[0].service_object (DB)
 * or flattened service_combo.service_object (from getServiceCombos).
 */
export interface AppointmentItem {
  /** Primary key (bigint), not nullable. */
  id: number;
  /** ISO timestamp with timezone, not nullable. */
  created_at: string;
  /** Referenced Appointment object, not nullable. */
  appointment: Appointment;
  /** Referenced ServiceCombo object, not nullable. */
  service_combo: ServiceCombo;
  /** May be null. */
  description: string | null;
  /** Quantity (default 1). */
  cantidad: number | null;
  /** Per-item cost, may be null. */
  cost: number | null;
}

/**
 * month_summaries table
 */
export interface MonthSummary {
  /** Primary key, not nullable. */
  id: number;
  /** Month (1-12), not nullable. */
  month: number;
  /** Year, not nullable. */
  year: number;
  /** May be null. */
  total_income: number | null;
  /** May be null. */
  total_expenses: number | null;
  /** May be null. */
  total_salaries: number | null;
  /** May be null. */
  total_profit: number | null;
  /** May be null. */
  total_appointments: number | null;
  /** May be null. */
  total_retouches: number | null;
}

/**
 * expenses table
 */
export interface Expense {
  /** Primary key, not nullable. */
  id: number;
  /** Description, not nullable. */
  description: string;
  /** Amount, not nullable. */
  amount: number;
  /** ISO date (YYYY-MM-DD), not nullable. */
  date: string;
  /** Category key (fuel, advertising, supplies, maintenance, other). */
  category?: string;
}



//===================================================================
// Dashboard Types
// ============================================================================

export type DashboardStats = {
  todayAppointments: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  completedToday: number;
};

export type DashboardTodayAppointment = {
  id: string;
  time: string;
  customer: string;
  worker: string;
  status: string; 
  paymentMethod: string | null;
};


export type ServiceObjectWithCombos = ServiceObject & {
  combos: ServiceCombo[];
};

export type ServiceOption = {

}


