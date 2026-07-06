import { supabase } from "../supabase/supabase";
import { addDays, formatTime, startOfLocalDay } from "./helpers";
import { getAppointmentStatusKey } from "./lookups";
import { pickItemsLabel } from "./adminData";
import {
  AppointmentStatus,
  DashboardStats,
  DashboardTodayAppointment,
} from "./types";

export async function getAdminDashboardData(): Promise<{
  stats: DashboardStats;
  todayAppointments: DashboardTodayAppointment[];
}> {

  // rango "hoy" en hora local
  const todayStart: Date = startOfLocalDay(new Date());
  const tomorrowStart: Date = addDays(todayStart, 1);

  const { data: todayRows, error: todayErr } = await supabase
    .from("appointments")
    .select(
      `id, date, cost, estimate_time, status, payment_method,
       client:clients(name),
       worker:workers(id, profile:profiles(name)),
       items:appointment_items(
         description, cantidad,
         service_combo:combos(id, name,
           object_combos(service_object:service_objects(id, name)))
       )`,
    )
    .gte("date", todayStart.toISOString())
    .lt("date", tomorrowStart.toISOString())
    .order("date", { ascending: true });

  if (todayErr) throw todayErr;

  const todayAppointmentsRaw = todayRows ?? [];

  // 2) Pendientes (global, del admin) => status 1 o 4 (pendiente - repaso)
  const pendingToday = todayAppointmentsRaw.filter((apt: any) =>
    [
      AppointmentStatus.PENDIENTE,
      AppointmentStatus.PENDIENTE_REPASO,
    ].includes(apt.status),
  ).length;

  // 3) Completadas hoy => status 3 o 5
  const completedToday = todayAppointmentsRaw.filter((apt: any) =>
    [
      AppointmentStatus.COMPLETO,
      AppointmentStatus.COMPLETO_REPASO,
    ].includes(apt.status),
  ).length;

  // 4) Ingresos del mes: desde month_summaries
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
    todayAppointmentsRaw.map((apt: any) => {
      const startTime = new Date(apt.date);
      const endTime = new Date(
        startTime.getTime() + (apt.estimate_time ?? 120) * 60000,
      );
      return {
        id: String(apt.id),
        time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        customer: apt.client?.name ?? "Sin cliente",
        service: pickItemsLabel(apt.items ?? []),
        worker: apt.worker?.profile?.name ?? "Sin asignar",
        amount: Number(apt.cost),
        status: getAppointmentStatusKey(apt.status),
        paymentMethod: apt.payment_method ?? null,
      };
    });

  const stats: DashboardStats = {
    todayAppointments: todayAppointmentsRaw.length,
    pendingAppointments: pendingToday ?? 0,
    completedToday: completedToday ?? 0,
    monthlyRevenue: monthlyRevenue ?? 0,
  };

  return { stats, todayAppointments };
}
