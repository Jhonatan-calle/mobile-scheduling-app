export const APPOINTMENT_STATUS = {
  PENDIENTE: 1,
  EN_PROCESO: 2,
  COMPLETO: 3,
  PENDIENTE_REPASO: 4,
  EN_PROCESO_REPASO: 5,
  COMPLETO_REPASO: 6,
} as const;

//===================================================================
// TIPOS — Servicios
// ============================================================================

export type ServiceObject = {
  id: number;
  objeto: string;
  is_active: boolean;
};

export type ServiceCombo = {
  id: number;
  object_id: number;
  name: string;
  description: string | null;
  precio: number | null;
  is_active: boolean;
};

export type ServiceObjectWithCombos = ServiceObject & {
  combos: ServiceCombo[];
};

export type AppointmentItem = {
  service_object_id: number;
  service_combo_id: number | null;
  description: string | null;
};

// Tipo legacy mantenido para compatibilidad con componentes que aún lo usan
export type ServiceOption = {
  id: number;
  objeto: string;
  combo: string | null;
  description: string | null;
  is_active: boolean | null;
};

// ============================================================================
// TIPOS — Workers, Clients, Appointments
// ============================================================================

export type WorkerOption = {
  id: number;
  commission_rate: number;
  profile: {
    id: number;
    name: string;
    auth_user_id?: string;
    user_role?: string | null;
    phone?: string | null;
  };
};

export type ClientOption = {
  id: number;
  name: string;
  phone_number: string;
  last_appointment_at: string | null;
};

export type AppointmentFeedItem = {
  id: string;
  type: "appointment" | "retouch";
  time: string;
  date: string;
  dateForSearch: string;
  customer: string;
  service: string;
  worker: string;
  status: string;
  amount: number;
  rawDate: Date;
  reason?: string;
};

export type AppointmentDetail = {
  id: number;
  admin_id: number;
  worker_id: number;
  client_id: number | null;
  address: string | null;
  date: string;
  estimate_time: number | null;
  cost: number | null;
  commission_rate: number | null;
  status: number;
  has_retouches: boolean | null;
  paid_to_worker: boolean | null;
  payment_method: string | null;
  notes: string | null;
  client: ClientOption | null;
  worker: WorkerOption | null;
  items: AppointmentItem[];
  retouches?: any[];
};

export type RetouchDetail = {
  id: number;
  appointment_id: number;
  worker_id: number;
  time: string;
  address: string | null;
  reason: string;
  estimate_time: number | null;
  status: number | null;
  appointment: {
    id: number;
    client: { name: string; phone_number: string } | null;
    notes: string | null;
  } | null;
  worker: WorkerOption | null;
};

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

