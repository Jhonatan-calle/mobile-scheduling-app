import { supabase } from "../supabase/supabase";
import {
  APPOINTMENT_STATUS,
  DashboardStats,
  DashboardTodayAppointment,
} from "./types";

function startOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function getAdminDashboardData(): Promise<{
  stats: DashboardStats;
  todayAppointments: DashboardTodayAppointment[];
}> {
  const locale: string = "es-AR";

  // rango "hoy" en hora local
  const todayStart: Date = startOfLocalDay(new Date());
  const tomorrowStart: Date = addDays(todayStart, 1);

  const { data: todayRows, error: todayErr } = await supabase
    .from("appointments")
    .select("id,status")
    .gte("date", todayStart.toISOString())
    .lt("date", tomorrowStart.toISOString())
    .order("date", { ascending: true });

  if (todayErr) throw todayErr;

  const todayAppointmentsRaw = todayRows ?? [];

  // 2) Pendientes (global, del admin) => status 1 o 4 (pendiente - repaso)

  const pendingToday = todayAppointmentsRaw.filter((apt: any) =>
    [
      APPOINTMENT_STATUS.PENDIENTE,
      APPOINTMENT_STATUS.PENDIENTE_REPASO,
    ].includes(apt.status),
  ).length;
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
      worker: apt.worker?.profile?.name ?? "Sin asignar",
      status: String(apt.status), // o mapea a "pending/in-progress/completed" si tu card lo necesita
      paymentMethod: apt.payment_method ?? null,
    }));

  const stats: DashboardStats = {
    todayAppointments: todayAppointmentsRaw.length,
    pendingAppointments: pendingToday ?? 0,
    completedToday:  completedToday ?? 0,
    monthlyRevenue: monthlyRevenue ?? 0,
  };

  return { stats, todayAppointments };
}
