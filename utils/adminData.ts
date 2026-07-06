import { supabase } from "../supabase/supabase";
import {
  addDays,
  endOfLocalMonth,
  formatDateNumeric,
  formatTime,
  locale,
  startOfLocalDay,
  startOfLocalMonth,
} from "./helpers";
import {
  getAppointmentStatusKey,
  getPaymentMethodConfig,
  getExpenseCategoryConfig,
  getServiceIcon,
  DAY_NAMES,
} from "./lookups";
import {
  DashboardStats,
  ServiceCombo,
  ServiceObject,
  ServiceObjectWithCombos,
  Client,
  MonthSummary,
} from "./types";

// Genera un label legible para un turno a partir de sus items
function pickItemsLabel(items: any[]): string {
  if (!items || items.length === 0) return "Servicio";
  return items
    .map((item: any) => {
      const objeto =
        item.service_combo?.service_object?.name ??
        item.service_combo?.object_combos?.[0]?.service_object
          ?.name ??
        "Objeto";
      const combo = item.service_combo?.name;
      return combo ? `${objeto} (${combo})` : objeto;
    })
    .join(", ");
}

// ============================================================================
// SERVICIOS
// ============================================================================

export async function getServiceObjects(): Promise<ServiceObject[]> {
  const { data, error } = await supabase
    .from("service_objects")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ServiceObject[];
}

export async function getServiceCombos(): Promise<ServiceCombo[]> {
  const { data, error } = await supabase
    .from("combos")
    .select(
      `
      id,
      name,
      description,
      is_active,
      precio,
      object_combos(
        service_object:service_objects(id, name)
      )
    `,
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((combo: any) => ({
    id: combo.id,
    name: combo.name,
    description: combo.description,
    is_active: combo.is_active,
    precio: combo.precio,
    object_ids: (combo.object_combos ?? [])
      .map((oc: any) => oc.service_object?.id)
      .filter((id: any) => id != null),
  }));
}

export async function getServiceObjectsWithCombos(): Promise<
  ServiceObjectWithCombos[]
> {
  const [objects, combos] = await Promise.all([
    getServiceObjects(),
    getServiceCombos(),
  ]);

  return objects.map((obj) => ({
    ...obj,
    combos: combos.filter((c) => c.object_ids.includes(obj.id)),
  }));
}

// Mantenido por compatibilidad — devuelve datos de la nueva estructura
// con el mismo shape que antes para no romper componentes que usen ServiceOption
export async function getServices(): Promise<
  ServiceObjectWithCombos[]
> {
  const withCombos = await getServiceObjectsWithCombos();
  const result: ServiceObjectWithCombos[] = [];

  withCombos.forEach((obj) => {
    if (obj.combos.length === 0) {
      result.push({
        id: obj.id,
        objeto: obj.name,
        combo: null,
        description: null,
        is_active: obj.is_active,
      });
    } else {
      obj.combos.forEach((combo) => {
        result.push({
          id: combo.id,
          objeto: obj.name,
          combo: combo.name,
          description: combo.description,
          is_active: combo.is_active,
        });
      });
    }
  });

  return result;
}

// ============================================================================
// CLIENTES
// ============================================================================

export async function getClients(
  searchText?: string,
): Promise<Client[]> {
  let query = supabase
    .from("clients")
    .select("id, name, phone_number, last_appointment_at")
    .order("name", { ascending: true });

  if (searchText) {
    const clean = searchText.trim();
    if (clean) {
      query = query.or(
        `name.ilike.%${clean}%,phone_number.ilike.%${clean}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function findOrCreateClient(input: {
  name: string;
  phone_number: string;
}): Promise<ClientOption> {
  const { data: existing, error: findError } = await supabase
    .from("clients")
    .select("id, name, phone_number, last_appointment_at")
    .eq("phone_number", input.phone_number)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing as ClientOption;

  const { data, error } = await supabase
    .from("clients")
    .insert({ name: input.name, phone_number: input.phone_number })
    .select("id, name, phone_number, last_appointment_at")
    .single();

  if (error) throw error;
  return data as ClientOption;
}

export async function updateClient(
  id: number | string,
  input: Partial<ClientOption>,
) {
  const { error } = await supabase
    .from("clients")
    .update({
      name: input.name,
      phone_number: input.phone_number,
      last_appointment_at: input.last_appointment_at,
    })
    .eq("id", Number(id));

  if (error) throw error;
}

// ============================================================================
// WORKERS
// ============================================================================

export async function getWorkers(): Promise<WorkerOption[]> {
  const { data: workers, error: workersError } = await supabase
    .from("workers")
    .select("id, profile_id, commission_rate")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (workersError) throw workersError;

  const profileIds = (workers ?? []).map(
    (worker: any) => worker.profile_id,
  );
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, auth_user_id, user_role")
    .in("id", profileIds.length ? profileIds : [-1]);

  if (profileError) throw profileError;

  const profileMap = new Map<number, any>(
    (profiles ?? []).map((profile: any) => [profile.id, profile]),
  );

  return (workers ?? []).map((worker: any) => ({
    id: Number(worker.id),
    commission_rate: Number(worker.commission_rate ?? 0),
    profile: profileMap.get(worker.profile_id) ?? {
      id: worker.profile_id,
      name: "Sin nombre",
    },
  }));
}

export async function getWorkerById(workerId: number) {
  const { data: worker, error: workerError } = await supabase
    .from("workers")
    .select("id, profile_id, commission_rate")
    .eq("id", workerId)
    .single();

  if (workerError) throw workerError;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, auth_user_id, user_role")
    .eq("id", worker.profile_id)
    .single();

  if (profileError) throw profileError;

  return {
    id: Number(worker.id),
    commission_rate: Number(worker.commission_rate ?? 0),
    profile,
  } as WorkerOption;
}

export async function getAllWorkers(): Promise<WorkerOption[]> {
  const { data: workers, error: workersError } = await supabase
    .from("workers")
    .select("id, profile_id, commission_rate, is_active")
    .order("id", { ascending: true });

  if (workersError) throw workersError;

  const profileIds = (workers ?? []).map(
    (worker: any) => worker.profile_id,
  );
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, auth_user_id, user_role")
    .in("id", profileIds.length ? profileIds : [-1]);

  if (profileError) throw profileError;

  const profileMap = new Map<number, any>(
    (profiles ?? []).map((profile: any) => [profile.id, profile]),
  );

  return (workers ?? []).map((worker: any) => ({
    id: Number(worker.id),
    commission_rate: Number(worker.commission_rate ?? 0),
    is_active: worker.is_active ?? true,
    profile: profileMap.get(worker.profile_id) ?? {
      id: worker.profile_id,
      name: "Sin nombre",
    },
  }));
}

export async function createWorker(input: {
  name: string;
  commission_rate: number;
}) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({ name: input.name, user_role: "worker", auth_user_id: null })
    .select("id")
    .single();

  if (profileError) throw profileError;

  const { data: worker, error: workerError } = await supabase
    .from("workers")
    .insert({
      profile_id: profile.id,
      commission_rate: input.commission_rate,
    })
    .select("id, profile_id, commission_rate, is_active")
    .single();

  if (workerError) {
    await supabase.from("profiles").delete().eq("id", profile.id);
    throw workerError;
  }

  return {
    id: Number(worker.id),
    commission_rate: Number(worker.commission_rate ?? 0),
    is_active: worker.is_active ?? true,
    profile: { id: profile.id, name: input.name },
  };
}

export async function updateWorker(
  id: number,
  input: {
    name?: string;
    commission_rate?: number;
    is_active?: boolean;
  },
) {
  if (
    input.commission_rate !== undefined ||
    input.is_active !== undefined
  ) {
    const updateData: Record<string, any> = {};
    if (input.commission_rate !== undefined)
      updateData.commission_rate = input.commission_rate;
    if (input.is_active !== undefined)
      updateData.is_active = input.is_active;

    const { error: workerError } = await supabase
      .from("workers")
      .update(updateData)
      .eq("id", id);

    if (workerError) throw workerError;
  }

  if (input.name !== undefined) {
    const { data: worker } = await supabase
      .from("workers")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (worker) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: input.name })
        .eq("id", worker.profile_id);

      if (profileError) throw profileError;
    }
  }

  return getWorkerById(id);
}

export async function archiveWorker(id: number) {
  const { error } = await supabase
    .from("workers")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteWorker(id: number) {
  const { count: apptCount, error: apptError } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("worker_id", id);

  if (apptError) throw apptError;

  const { count: retouchCount, error: retouchError } = await supabase
    .from("retouches")
    .select("id", { count: "exact", head: true })
    .eq("worker_id", id);

  if (retouchError) throw retouchError;

  const total = (apptCount ?? 0) + (retouchCount ?? 0);

  if (total > 0) {
    return {
      deleted: false,
      reason: `Tiene ${total} turno(s) asignado(s), solo puede archivarse`,
    };
  }

  const { error: deleteError } = await supabase
    .from("workers")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;

  return { deleted: true };
}

// ============================================================================
// TURNOS — Feed
// ============================================================================

export async function getAppointmentsFeed(): Promise<
  AppointmentFeedItem[]
> {
  const todayStart = startOfLocalDay(new Date());
  const pastRange = addDays(todayStart, -120);
  const futureRange = addDays(todayStart, 30);

  const [
    { data: appointments, error: appointmentsError },
    { data: retouches, error: retouchesError },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        `id, date, cost, status, notes, address, payment_method, estimate_time,
         client:clients(id, name, phone_number),
         worker:workers(id, commission_rate, profile:profiles(id, name)),
          items:appointment_items(
            description,
            service_combo:combos(id, name, object_combos(service_object:service_objects(id, name)))
          )`,
      )
      .gte("date", pastRange.toISOString())
      .lte("date", futureRange.toISOString())
      .order("date", { ascending: true }),
    supabase
      .from("retouches")
      .select(
        `id, time, reason, estimate_time, status, appointment_id, address,
           appointment:appointments(
             id, date, notes,
             client:clients(id, name, phone_number),
             items:appointment_items(
               service_combo:combos(id, name, object_combos(service_object:service_objects(id, name)))
           )
         ),
         worker:workers(id, commission_rate, profile:profiles(id, name))`,
      )
      .gte("time", pastRange.toISOString())
      .lte("time", futureRange.toISOString())
      .order("time", { ascending: true }),
  ]);

  if (appointmentsError) throw appointmentsError;
  if (retouchesError) throw retouchesError;

  const transformedAppointments = (appointments ?? []).map(
    (apt: any) => {
      const startTime = new Date(apt.date);
      const endTime = new Date(
        startTime.getTime() + (apt.estimate_time ?? 120) * 60000,
      );
      return {
        id: String(apt.id),
        type: "appointment" as const,
        time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        date: new Date(apt.date).toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
        }),
        dateForSearch: formatDateNumeric(new Date(apt.date)),
        customer: apt.client?.name ?? "Sin cliente",
        customerPhone: apt.client?.phone_number ?? "",
        address: apt.address ?? "",
        service: pickItemsLabel(apt.items ?? []),
        worker: apt.worker?.profile?.name ?? "Sin asignar",
        status: getAppointmentStatusKey(apt.status),
        amount: Number(apt.cost),
        rawDate: new Date(apt.date),
      };
    },
  );

  const transformedRetouches = (retouches ?? []).map(
    (retouch: any) => {
      const startTime = new Date(retouch.time);
      const endTime = new Date(
        startTime.getTime() + (retouch.estimate_time ?? 120) * 60000,
      );
      return {
        id: String(retouch.id),
        type: "retouch" as const,
        time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        date: new Date(retouch.time).toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
        }),
        dateForSearch: formatDateNumeric(new Date(retouch.time)),
        customer: retouch.appointment?.client?.name ?? "Sin cliente",
        customerPhone:
          retouch.appointment?.client?.phone_number ?? "",
        service: `🔄 Repaso: ${pickItemsLabel(retouch.appointment?.items ?? [])}`,
        address:
          retouch.address ?? retouch.appointment?.address ?? "",
        worker: retouch.worker?.profile?.name ?? "Sin asignar",
        status: getAppointmentStatusKey(retouch.status),
        amount: 0,
        rawDate: new Date(retouch.time),
        reason: retouch.reason,
      };
    },
  );

  return [...transformedAppointments, ...transformedRetouches].sort(
    (a, b) => a.rawDate.getTime() - b.rawDate.getTime(),
  );
}

// ============================================================================
// TURNOS — CRUD
// ============================================================================

export async function getAppointmentById(
  id: number | string,
): Promise<AppointmentDetail> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `id, admin_id, worker_id, client_id, notes, address, date,
       estimate_time, cost, commission_rate, status, has_retouches,
       paid_to_worker, payment_method,
       client:clients(id, name, phone_number, last_appointment_at),
       worker:workers(id, commission_rate, profile:profiles(id, name, auth_user_id, user_role)),
       items:appointment_items(
          service_combo_id, description,
          service_combo:combos(id, name, description, precio,
            object_combos(service_object:service_objects(id, name)))
        ),
       retouches:retouches(
         id, appointment_id, worker_id, time, address, reason,
         estimate_time, status,
         worker:workers(id, profile:profiles(id, name))
       )`,
    )
    .eq("id", Number(id))
    .single();

  if (error) throw error;
  return data as any as AppointmentDetail;
}

export async function updateAppointment(
  id: number | string,
  input: Partial<AppointmentDetail>,
) {
  const payload: any = { ...input };
  const items = payload.items;
  delete payload.items;
  delete payload.client;
  delete payload.worker;
  delete payload.retouches;

  const { error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", Number(id));

  if (error) throw error;

  if (items) {
    const { error: delError } = await supabase
      .from("appointment_items")
      .delete()
      .eq("appointment_id", Number(id));
    if (delError) throw delError;

    if (items.length > 0) {
      const { error: insError } = await supabase
        .from("appointment_items")
        .insert(
          items.map((item: any) => ({
            appointment_id: Number(id),
            service_combo_id: item.service_combo_id,
            description: item.description ?? null,
            cantidad: item.cantidad ?? null,
            cost: item.cost ?? null,
          })),
        );
      if (insError) throw insError;
    }
  }
}

export async function createAppointment(input: {
  admin_id: number;
  worker_id: number | null;
  client_id: number;
  address?: string | null;
  date: string;
  estimate_time: number;
  cost: number;
  commission_rate: number;
  notes?: string | null;
  status?: number;
  has_retouches?: boolean;
  paid_to_worker?: boolean;
  payment_method?: string | null;
  items: {
    service_combo_id: number;
    description: string | null;
    cantidad?: number | null;
    cost?: number | null;
  }[];
}) {
  // 1) Crear el turno
  const { error: aptError, data: aptData } = await supabase
    .from("appointments")
    .insert({
      admin_id: input.admin_id,
      worker_id: input.worker_id,
      client_id: input.client_id,
      address: input.address ?? null,
      date: input.date,
      estimate_time: input.estimate_time,
      cost: input.cost,
      commission_rate: input.commission_rate,
      notes: input.notes ?? null,
      status: input.status ?? 1,
      has_retouches: input.has_retouches ?? false,
      paid_to_worker: input.paid_to_worker ?? false,
      payment_method: input.payment_method ?? null,
    })
    .select("id")
    .single();

  if (aptError) throw aptError;

  // 2) Insertar los items
  if (input.items.length > 0) {
    const itemRows = input.items.map((item) => ({
      appointment_id: aptData.id,
      service_combo_id: item.service_combo_id,
      description: item.description,
      cantidad: item.cantidad ?? 1,
      cost: item.cost ?? null,
    }));

    const { error: itemsError } = await supabase
      .from("appointment_items")
      .insert(itemRows);

    if (itemsError) throw itemsError;
  }

  return aptData;
}

export async function deleteAppointment(id: number | string) {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", Number(id));
  if (error) throw error;
}

// ============================================================================
// REPASOS
// ============================================================================

export async function getRetouchById(
  id: number | string,
): Promise<RetouchDetail> {
  const { data, error } = await supabase
    .from("retouches")
    .select(
      `id, appointment_id, worker_id, time, address, reason, estimate_time, status,
       appointment:appointments(
         id, notes,
         client:clients(name, phone_number)
       ),
       worker:workers(id, commission_rate, profile:profiles(id, name, auth_user_id, user_role))`,
    )
    .eq("id", Number(id))
    .single();

  if (error) throw error;
  return data as any as RetouchDetail;
}

export async function createRetouch(input: {
  appointment_id: number;
  worker_id: number;
  time: string;
  address?: string | null;
  reason: string;
  estimate_time: number;
  status?: number | null;
}) {
  const { error, data } = await supabase
    .from("retouches")
    .insert({
      appointment_id: input.appointment_id,
      worker_id: input.worker_id,
      time: input.time,
      address: input.address ?? null,
      reason: input.reason,
      estimate_time: input.estimate_time,
      status: input.status ?? 1,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function updateRetouch(
  id: number | string,
  input: Partial<RetouchDetail>,
) {
  const { error } = await supabase
    .from("retouches")
    .update({
      worker_id: input.worker_id,
      time: input.time,
      address: input.address,
      reason: input.reason,
      estimate_time: input.estimate_time,
      status: input.status,
    })
    .eq("id", Number(id));

  if (error) throw error;
}

export async function deleteRetouch(id: number | string) {
  const { error } = await supabase
    .from("retouches")
    .delete()
    .eq("id", Number(id));
  if (error) throw error;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export async function getDashboardData(): Promise<{
  stats: DashboardStats;
  todayAppointments: any[];
}> {
  const todayStart = startOfLocalDay(new Date());
  const tomorrowStart = addDays(todayStart, 1);

  const { data: todayRows, error: todayErr } = await supabase
    .from("appointments")
    .select(
      `id, date, cost, payment_method, status, estimate_time,
       client:clients(id, name, phone_number),
       worker:workers(id, profile:profiles(id, name)),
        items:appointment_items(
          service_combo:combos(id, name,
            object_combos(service_object:service_objects(id, name)))
        )`,
    )
    .gte("date", todayStart.toISOString())
    .lt("date", tomorrowStart.toISOString())
    .order("date", { ascending: true });

  if (todayErr) throw todayErr;

  const { count: pendingCount, error: pendingErr } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .in("status", [1, 4]);

  if (pendingErr) throw pendingErr;

  const completedToday = (todayRows ?? []).filter((apt: any) =>
    [3, 5].includes(apt.status),
  ).length;

  const now = new Date();
  const { data: monthSummary, error: msErr } = await supabase
    .from("month_summaries")
    .select("total_income")
    .eq("month", now.getMonth() + 1)
    .eq("year", now.getFullYear())
    .maybeSingle();

  if (msErr) throw msErr;

  const todayAppointments = (todayRows ?? []).map((apt: any) => {
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
      status: Number(apt.status),
      paymentMethod: apt.payment_method ?? null,
    };
  });

  return {
    stats: {
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingCount ?? 0,
      completedToday,
      monthlyRevenue: Number(monthSummary?.total_income),
    },
    todayAppointments,
  };
}

// ============================================================================
// CONTABILIDAD
// ============================================================================

export async function getExpenses(month = new Date()) {
  const start = startOfLocalMonth(month);
  const end = endOfLocalMonth(month);
  const { data, error } = await supabase
    .from("expenses")
    .select("id, description, amount, date")
    .gte("date", start.toISOString().slice(0, 10))
    .lt("date", end.toISOString().slice(0, 10))
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    category: row.category ?? "other",
    createdBy: row.createdBy ?? "Admin",
  }));
}

export async function createExpense(input: {
  category?: string;
  description: string;
  amount: number;
  date?: string;
}) {
  const payload = {
    description: input.description,
    amount: input.amount,
    date: input.date
      ? input.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  };

  const { error, data } = await supabase
    .from("expenses")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id: number | string) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", Number(id));
  if (error) throw error;
}

export async function getMonthlySummary(month = new Date()) {
  const { data: summaryRow, error: summaryErr } = await supabase
    .from("month_summaries")
    .select("*")
    .eq("month", month.getMonth() + 1)
    .eq("year", month.getFullYear())
    .maybeSingle<MonthSummary>();

  if (summaryErr) {
    throw summaryErr;
  }

  const { data: expenses, error: expensesErr } = await supabase
    .from("expenses")
    .select("amount")
    .gte("date", startOfLocalMonth(month).toISOString().slice(0, 10))
    .lt("date", endOfLocalMonth(month).toISOString().slice(0, 10));
  if (expensesErr) throw expensesErr;

  const totalExpenses = (expenses ?? []).reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const totalIncome = Number(summaryRow?.total_income ?? 0);
  const totalSalaries = Number(summaryRow?.total_salaries ?? 0);
  const grossProfit = Number(summaryRow?.total_profit ?? 0);

  return {
    month: month.getMonth() + 1,
    year: month.getFullYear(),
    totalIncome,
    totalAppointments: Number(summaryRow?.total_appointments ?? 0),
    totalRetouches: Number(summaryRow?.total_retouches ?? 0),
    totalExpenses,
    expenses: {
      fuel: 0,
      advertising: 0,
      supplies: 0,
      maintenance: 0,
      other: totalExpenses,
    },
    totalSalaries,
    workerPayments: [],
    grossProfit,
    netProfit: grossProfit - totalExpenses,
    theoreticalProfit: grossProfit,
  };
}

export async function getDetailedAccountingSummary(
  month = new Date(),
) {
  const [summary, salaries, expenses, appointments] =
    await Promise.all([
      getMonthlySummary(month),
      supabase
        .from("salaries")
        .select("profile_id, amount, profile:profiles(id, name)")
        .eq("month", month.getMonth() + 1)
        .eq("year", month.getFullYear()),
      supabase
        .from("expenses")
        .select("description, amount")
        .gte(
          "date",
          startOfLocalMonth(month).toISOString().slice(0, 10),
        )
        .lt(
          "date",
          endOfLocalMonth(month).toISOString().slice(0, 10),
        ),
      supabase
        .from("appointments")
        .select("id, status, cost, commission_rate")
        .gte("date", startOfLocalMonth(month).toISOString())
        .lt("date", endOfLocalMonth(month).toISOString()),
    ]);

  if (salaries.error) throw salaries.error;
  if (expenses.error) throw expenses.error;
  if (appointments.error) throw appointments.error;

  const salaryRows = (salaries.data ?? []) as any[];
  const expenseRows = (expenses.data ?? []) as any[];
  const appointmentRows = (appointments.data ?? []) as any[];

  const salariesTotalPaid = salaryRows.reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const salariesWorkers = salaryRows.map((row) => ({
    name: row.profile?.name ?? "Sin nombre",
    earned: Number(row.amount),
    paid: Number(row.amount),
    pending: 0,
  }));

  const byCategory = expenseRows.reduce(
    (acc: Record<string, number>, row: any) => {
      const category = row.category ?? "other";
      acc[category] = (acc[category] ?? 0) + Number(row.amount);
      return acc;
    },
    {},
  );
  const normalizedByCategory = {
    fuel: 0,
    advertising: 0,
    supplies: 0,
    maintenance: 0,
    other: 0,
    ...byCategory,
  };

  const completedAppointmentRows = appointmentRows.filter((row) =>
    [3, 5].includes(Number(row.status)),
  );
  const income = completedAppointmentRows.reduce(
    (sum, row) => sum + Number(row.cost),
    0,
  );
  const pendingAppointments = appointmentRows.filter((row) =>
    [1, 4].includes(Number(row.status)),
  ).length;
  const completedAppointments = completedAppointmentRows.length;

  const theoreticalProfit = income - salariesTotalPaid;
  const netProfit =
    income -
    salariesTotalPaid -
    Object.values(byCategory).reduce((s, v) => s + v, 0);

  return {
    month: month.getMonth() + 1,
    year: month.getFullYear(),
    income: { appointments: income, retouches: 0, total: income },
    appointmentDetails: {
      total: appointmentRows.length,
      completed: completedAppointments,
      pending: pendingAppointments,
      cancelled: appointmentRows.filter(
        (row) => Number(row.status) === 0,
      ).length,
    },
    retouchDetails: { total: 0, completed: 0, pending: 0 },
    salaries: {
      workers: salariesWorkers,
      totalEarned: salariesWorkers.reduce(
        (sum, row) => sum + row.earned,
        0,
      ),
      totalPaid: salariesTotalPaid,
      totalPending: 0,
    },
    expenses: {
      byCategory: normalizedByCategory,
      total: Object.values(normalizedByCategory).reduce(
        (sum, value) => sum + value,
        0,
      ),
    },
    grossProfit: theoreticalProfit,
    netProfit,
    theoreticalProfit,
  };
}

export async function getPaymentsOverview(month = new Date()) {
  const [workers, salaries, appointments] = await Promise.all([
    getWorkers(),
    supabase
      .from("salaries")
      .select("profile_id, amount, profile:profiles(id, name)")
      .eq("month", month.getMonth() + 1)
      .eq("year", month.getFullYear()),
    supabase
      .from("appointments")
      .select("worker_id, status, cost, commission_rate")
      .gte("date", startOfLocalMonth(month).toISOString())
      .lt("date", endOfLocalMonth(month).toISOString()),
  ]);

  if (salaries.error) throw salaries.error;
  if (appointments.error) throw appointments.error;

  const salaryRows = (salaries.data ?? []) as any[];
  const appointmentRows = (appointments.data ?? []) as any[];

  const mapByWorker = new Map<
    number,
    { totalEarned: number; totalPaid: number }
  >();

  appointmentRows.forEach((row) => {
    const workerId = Number(row.worker_id);
    const total =
      Number(row.cost) * (Number(row.commission_rate) / 100);
    const current = mapByWorker.get(workerId) ?? {
      totalEarned: 0,
      totalPaid: 0,
    };
    current.totalEarned += total;
    mapByWorker.set(workerId, current);
  });

  workers.forEach((worker) => {
    if (!mapByWorker.has(worker.id))
      mapByWorker.set(worker.id, { totalEarned: 0, totalPaid: 0 });
  });

  salaryRows.forEach((row) => {
    const profileId = Number(row.profile_id);
    const worker = workers.find((w) => w.profile.id === profileId);
    const key = worker?.id ?? profileId;
    const current = mapByWorker.get(key) ?? {
      totalEarned: 0,
      totalPaid: 0,
    };
    current.totalPaid = Number(row.amount);
    mapByWorker.set(key, current);
  });

  return workers.map((worker) => {
    const data = mapByWorker.get(worker.id) ?? {
      totalEarned: 0,
      totalPaid: 0,
    };
    const pending = Math.max(0, data.totalEarned - data.totalPaid);
    const workerAppointments = appointmentRows.filter(
      (row) => Number(row.worker_id) === worker.id,
    );
    return {
      id: worker.id,
      name: worker.profile.name,
      phone: worker.profile.phone ?? "",
      totalEarned: data.totalEarned,
      totalPaid: data.totalPaid,
      pending,
      appointments: workerAppointments.filter((row) =>
        [3, 5].includes(Number(row.status)),
      ).length,
      retouches: 0,
    };
  });
}

// ============================================================================
// WORKERS — Overview y detalle
// ============================================================================

export async function getWorkerAvailability(workerId: number) {
  const { data, error } = await supabase
    .from("worker_availability")
    .select("id, worker_id, day_of_week, start_time, end_time")
    .eq("worker_id", workerId)
    .order("day_of_week", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    day: Number(row.day_of_week),
    start: String(row.start_time).slice(0, 5),
    end: String(row.end_time).slice(0, 5),
    enabled: true,
  }));
}

export async function getWorkerMonthlyStats(
  workerId: number,
  month = new Date(),
) {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `id, date, status, cost, commission_rate,
        items:appointment_items(
          service_combo:combos(id, name,
            object_combos(service_object:service_objects(id, name)))
        )`,
    )
    .eq("worker_id", workerId)
    .gte("date", startOfLocalMonth(month).toISOString())
    .lt("date", endOfLocalMonth(month).toISOString());

  if (error) throw error;

  const rows = (data ?? []) as any[];
  const totalGenerated = rows.reduce(
    (sum, row) => sum + Number(row.cost),
    0,
  );
  const totalEarned = rows.reduce(
    (sum, row) =>
      sum + Number(row.cost) * (Number(row.commission_rate) / 100),
    0,
  );

  return {
    month: month.getMonth() + 1,
    year: month.getFullYear(),
    totalAppointments: rows.length,
    totalRetouches: 0,
    completedAppointments: rows.filter((row) =>
      [3, 5].includes(Number(row.status)),
    ).length,
    pendingAppointments: rows.filter((row) =>
      [1, 4].includes(Number(row.status)),
    ).length,
    totalEarned,
    totalGenerated,
    averagePerAppointment: rows.length
      ? Math.round(totalGenerated / rows.length)
      : 0,
    appointmentsByService: rows.reduce(
      (acc: Record<string, number>, row) => {
        const items: any[] = row.items ?? [];
        const key =
          items
            .map((i: any) => i.service_object?.nombre)
            .filter(Boolean)
            .join(", ") || "Otro";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {},
    ),
  };
}

export async function getWorkersOverview() {
  const todayStart = startOfLocalDay(new Date());
  const tomorrowStart = addDays(todayStart, 1);

  const [workers, todayAppointments] = await Promise.all([
    getWorkers(),
    supabase
      .from("appointments")
      .select(
        `id, date, status, cost, commission_rate, worker_id,
          client:clients(name),
          items:appointment_items(
            service_combo:combos(id, name,
              object_combos(service_object:service_objects(id, name)))
          ),
          worker:workers(id, profile:profiles(id, name))`,
      )
      .gte("date", todayStart.toISOString())
      .lt("date", tomorrowStart.toISOString())
      .order("date", { ascending: true }),
  ]);

  if (todayAppointments.error) throw todayAppointments.error;

  const rows = (todayAppointments.data ?? []) as any[];

  return workers.map((worker) => {
    const workerRows = rows.filter(
      (row) => Number(row.worker_id) === worker.id,
    );
    const currentAppointmentRow =
      workerRows.find((row) => [2].includes(Number(row.status))) ||
      workerRows[0] ||
      null;

    return {
      id: worker.id,
      profile: { id: worker.profile.id, name: worker.profile.name },
      commission_rate: worker.commission_rate,
      status:
        workerRows.length > 0
          ? workerRows.some((row) => Number(row.status) === 2)
            ? "busy"
            : "available"
          : "inactive",
      todayAppointments: workerRows.length,
      completedToday: workerRows.filter((row) =>
        [3, 5].includes(Number(row.status)),
      ).length,
      currentAppointment: currentAppointmentRow
        ? {
            client:
              currentAppointmentRow.client?.name ?? "Sin cliente",
            service: pickItemsLabel(
              currentAppointmentRow.items ?? [],
            ),
          }
        : null,
    };
  });
}

export async function getWorkerDetailData(
  workerId: number,
  month = new Date(),
) {
  const [worker, availability, monthStats] = await Promise.all([
    getWorkerById(workerId),
    getWorkerAvailability(workerId),
    getWorkerMonthlyStats(workerId, month),
  ]);

  return { worker, availability, monthStats };
}

export async function getWorkerHistory(workerId: number) {
  const [appointmentsQuery, retouchesQuery] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        `id, date, cost, commission_rate, status, notes, address,
         client:clients(id, name, phone_number),
         items:appointment_items(
           service_combo:combos(id, name,
             object_combos(service_object:service_objects(id, name)))
         ),
         worker:workers(id, profile:profiles(id, name))`,
      )
      .eq("worker_id", workerId)
      .order("date", { ascending: false }),
    supabase
      .from("retouches")
      .select(
        `id, time, reason, estimate_time, status, address,
          appointment:appointments(
            id, address, notes,
            client:clients(id, name, phone_number),
            items:appointment_items(
              service_combo:combos(id, name,
                object_combos(service_object:service_objects(id, name)))
            )
         ),
         worker:workers(id, profile:profiles(id, name))`,
      )
      .eq("worker_id", workerId)
      .order("time", { ascending: false }),
  ]);

  if (appointmentsQuery.error) throw appointmentsQuery.error;
  if (retouchesQuery.error) throw retouchesQuery.error;

  const appointments = (appointmentsQuery.data ?? []).map(
    (row: any) => ({
      id: String(row.id),
      type: "appointment",
      date: row.date,
      client: {
        name: row.client?.name ?? "Sin cliente",
        phone: row.client?.phone_number ?? "",
      },
      service: pickItemsLabel(row.items ?? []),
      address: row.address ?? "Sin dirección",
      cost: Number(row.cost),
      workerEarned:
        Number(row.cost) * (Number(row.commission_rate) / 100),
      status: getAppointmentStatusKey(row.status),
    }),
  );

  const retouches = (retouchesQuery.data ?? []).map((row: any) => ({
    id: String(row.id),
    type: "retouch",
    date: row.time,
    client: {
      name: row.appointment?.client?.name ?? "Sin cliente",
      phone: row.appointment?.client?.phone_number ?? "",
    },
    service: `Repaso: ${pickItemsLabel(row.appointment?.items ?? [])}`,
    address:
      row.address ?? row.appointment?.address ?? "Sin dirección",
    reason: row.reason,
    status: getAppointmentStatusKey(row.status),
  }));

  return [...appointments, ...retouches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// ============================================================================
// PERFIL
// ============================================================================

export async function getCurrentProfile() {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();
  if (userError) throw userError;

  const user = userData.user;
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, auth_user_id, name, user_role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    user_role: profile.user_role,
    auth_user: {
      id: user.id,
      email: user.email ?? "",
      phone: user.phone ?? "",
    },
    updated_at: null,
  };
}

export async function updateCurrentProfileName(name: string) {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("No authenticated user");

  const { error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("auth_user_id", userData.user.id);

  if (error) throw error;
}

export {
  getAppointmentStatusKey,
  getPaymentMethodConfig,
  getExpenseCategoryConfig,
  getServiceIcon,
  DAY_NAMES,
};
