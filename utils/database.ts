import { supabase } from "../supabase/supabase";

export const APPOINTMENT_STATUS = {
  PENDIENTE: 1,
  EN_PROCESO: 2,
  COMPLETO: 3,
  PENDIENTE_REPASO: 4,
  EN_PROCESO_REPASO: 5,
  COMPLETO_REPASO: 6,
} as const;

function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

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
  service: string;
  worker: string;
  status: string; 
  paymentMethod: string | null;
};

export async function getAdminDashboardData() {
  const locale = "es-AR";

  // rango "hoy" en hora local
  const todayStart = startOfLocalDay(new Date());
  const tomorrowStart = addDays(todayStart, 1);

  // 1) Turnos de hoy (del admin)
  const { data: todayRows, error: todayErr } = await supabase
    .from("appointments")
    .select(
      `
      id,
      date,
      cost,
      payment_method,
      status,
      client:clients(id, name, phone_number),
      worker:workers(
        id,
        profile:profiles(id, name)
      ),
      service:services(id, objeto, description)
    `,
    )
    .gte("date", todayStart.toISOString())
    .lt("date", tomorrowStart.toISOString())
    .order("date", { ascending: true });

  if (todayErr) throw todayErr;

  const todayAppointmentsRaw = todayRows ?? [];

  // 2) Pendientes (global, del admin) => status 1 o 4 (pendiente - repaso)
  const { count: pendingCount, error: pendingErr } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true }) 
    .in("status", [
      APPOINTMENT_STATUS.PENDIENTE,
      APPOINTMENT_STATUS.PENDIENTE_REPASO,
    ]);

  if (pendingErr) throw pendingErr;

  // 3) Completadas hoy => status 3 o 5
  const completedToday = todayAppointmentsRaw.filter((apt: any) =>
    [APPOINTMENT_STATUS.COMPLETO, APPOINTMENT_STATUS.COMPLETO_REPASO].includes(
      apt.status,
    ),
  ).length;

  // 4) Ingresos del mes: desde month_summaries (si querés, esto luego lo filtramos por admin si tu tabla lo soporta)
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: monthSummary, error: msErr } = await supabase
    .from("month_summaries")
    .select("total_income")
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (msErr) throw msErr;

  const monthlyRevenue = Number(monthSummary?.total_income ?? 0);

  // 5) Transformación para UI
  const todayAppointments: DashboardTodayAppointment[] =
    todayAppointmentsRaw.map((apt: any) => ({
      id: String(apt.id),
      time: new Date(apt.date).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      customer: apt.client?.name ?? "Sin cliente",
      service: apt.service?.description ?? apt.service?.objeto ?? "Servicio",
      worker: apt.worker?.profile?.name ?? "Sin asignar",
      status: String(apt.status), // o mapea a "pending/in-progress/completed" si tu card lo necesita
      paymentMethod: apt.payment_method ?? null,
    }));

  const stats: DashboardStats = {
    todayAppointments: todayAppointmentsRaw.length,
    pendingAppointments: pendingCount ?? 0,
    completedToday,
    monthlyRevenue,
  };

  return { stats, todayAppointments };
}
