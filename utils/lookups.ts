export const APPOINTMENT_STATUS_CONFIG = {
  1: { key: "pending", label: "Pendiente", color: "#F59E0B", icon: "⏳" },
  2: { key: "in_progress", label: "En proceso", color: "#3B82F6", icon: "🔄" },
  3: { key: "completed", label: "Completo", color: "#10B981", icon: "✅" },
  4: {
    key: "pending_retouch",
    label: "Pendiente - Repaso",
    color: "#D97706",
    icon: "📝",
  },
  5: {
    key: "completed_retouch",
    label: "Completo - Repaso",
    color: "#059669",
    icon: "✅",
  },
  6: {
    key: "in_progress_retouch",
    label: "En proceso - Repaso",
    color: "#2563EB",
    icon: "🔁",
  },
} as const;

export const PAYMENT_METHODS = {
  cash: { label: "Efectivo", icon: "💵" },
  transfer: { label: "Transferencia", icon: "🏦" },
  debit: { label: "Débito", icon: "💳" },
  credit: { label: "Crédito", icon: "💳" },
  mercadopago: { label: "Mercado Pago", icon: "📱" },
  other: { label: "Otro", icon: "💰" },
} as const;

export const EXPENSE_CATEGORIES = {
  fuel: { icon: "⛽", label: "Nafta", color: "#EF4444" },
  advertising: { icon: "📢", label: "Publicidad", color: "#8B5CF6" },
  supplies: { icon: "🧴", label: "Insumos", color: "#3B82F6" },
  maintenance: { icon: "🔧", label: "Mantenimiento", color: "#F59E0B" },
  other: { icon: "📦", label: "Otros", color: "#6B7280" },
} as const;

export const RETOUCH_DURATIONS = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1.5 horas" },
  { value: "120", label: "2 horas" },
];

export const DEFAULT_SERVICE_ICONS: Record<string, string> = {
  auto: "🚗",
  sillones: "🛋️",
  silla: "🪑",
  alfombra: "🧶",
  colchon: "🛏️",
  cortinas: "🪟",
  huevito: "🐣",
  coche: "👶",
  otro: "📦",
};

export const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function getAppointmentStatusConfig(status: number | null | undefined) {
  return APPOINTMENT_STATUS_CONFIG[
    (status ?? 1) as keyof typeof APPOINTMENT_STATUS_CONFIG
  ];
}

export function getAppointmentStatusConfigByKey(
  statusKey: string | null | undefined,
) {
  const entry = Object.values(APPOINTMENT_STATUS_CONFIG).find(
    (item) => item.key === statusKey,
  );
  return entry ?? APPOINTMENT_STATUS_CONFIG[1];
}

export function getAppointmentStatusIdByKey(
  statusKey: string | null | undefined,
) {
  const entry = Object.entries(APPOINTMENT_STATUS_CONFIG).find(
    ([, item]) => item.key === statusKey,
  );
  return entry ? Number(entry[0]) : 1;
}

export function getAppointmentStatusKey(status: number | null | undefined) {
  return getAppointmentStatusConfig(status).key;
}

export function getPaymentMethodConfig(method: string | null | undefined) {
  return method
    ? PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS]
    : null;
}

export function getExpenseCategoryConfig(category: string | null | undefined) {
  return EXPENSE_CATEGORIES[
    (category ?? "other") as keyof typeof EXPENSE_CATEGORIES
  ];
}

export function getServiceIcon(label: string | null | undefined) {
  if (!label) return DEFAULT_SERVICE_ICONS.otro;
  const key = label.toLowerCase();
  return DEFAULT_SERVICE_ICONS[key] ?? DEFAULT_SERVICE_ICONS.otro;
}
