import { View, Text, StyleSheet } from "react-native";
import {
  getAppointmentStatusConfig,
  getAppointmentStatusConfigByKey,
  getPaymentMethodConfig,
} from "../../../utils/lookups";

interface AppointmentPreviewCardProps {
  date?: string;
  time?: string;
  customer: string;
  service: string;
  worker: string;
  status: number | string;
  paymentMethod?: string;
}

export default function AppointmentPreviewCard({
  date,
  time,
  customer,
  service,
  worker,
  status,
  paymentMethod,
}: AppointmentPreviewCardProps) {
  const config =
    typeof status === "string"
      ? getAppointmentStatusConfigByKey(status)
      : getAppointmentStatusConfig(Number(status));
  const payment = getPaymentMethodConfig(paymentMethod);

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentTime}>
        <Text style={styles.appointmentTimeText}>{date ?? time ?? "--:--"}</Text>
        {payment && <Text style={styles.paymentMethodIcon}>{payment.icon}</Text>}
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
