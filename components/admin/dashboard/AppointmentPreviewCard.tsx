import { View, Text, StyleSheet } from "react-native";

type AppointmentStatus = 1 | 2 | 3 | 4 | 5 | 6;
interface AppointmentPreviewCardProps {
  date: string;
  customer: string;
  service: string;
  worker: string;
  status: AppointmentStatus;
  paymentMethod?: string;
}
const statusConfig: Record<
  AppointmentStatus,
  { label: string; color: string; icon: string }
> = {
  1: { label: "Pendiente", color: "#F59E0B", icon: "⏳" },
  2: { label: "En proceso", color: "#3B82F6", icon: "🔄" },
  3: { label: "Completo", color: "#10B981", icon: "✅" },
  4: { label: "Pendiente - Repaso", color: "#D97706", icon: "📝" },
  5: { label: "Completo - Repaso", color: "#059669", icon: "✅" },
  6: { label: "En proceso - Repaso", color: "#2563EB", icon: "🔁" },
};

const paymentMethodIcons: any = {
  cash: "💵",
  transfer: "🏦",
};

export default function AppointmentPreviewCard({
  date,
  customer,
  service,
  worker,
  status,
  paymentMethod, // ← NUEVO
}: AppointmentPreviewCardProps) {
  const config = statusConfig[status];

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentTime}>
        <Text style={styles.appointmentTimeText}>{date}</Text>
        {/* NUEVO: Mostrar icono de método de pago */}
        {paymentMethod && (
          <Text style={styles.paymentMethodIcon}>
            {paymentMethodIcons[paymentMethod]}
          </Text>
        )}
      </View>
      <View style={styles.appointmentInfo}>
        <Text style={styles.appointmentCustomer}>{customer}</Text>
        <Text style={styles.appointmentService}>{service}</Text>
        <Text style={styles.appointmentWorker}>👤 {worker}</Text>
      </View>
      <View
        style={[
          styles.appointmentStatus,
          { backgroundColor: config.color + "20" }, // me esta arrojando error config.color dice no definiido
        ]}
      >
        <Text style={styles.appointmentStatusIcon}>{config.icon}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paymentMethodIcon: {
    fontSize: 12,
    marginTop: 4,
  },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentTime: {
    width: 60,
    marginRight: 16,
  },
  appointmentTimeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentCustomer: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  appointmentWorker: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  appointmentStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  appointmentStatusIcon: {
    fontSize: 20,
  },
});
